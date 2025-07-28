import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import { STORAGE_KEY, CSV_FILE_STORAGE_ID } from 'src/constants/storage';
import { ReplaceTextUseCase } from 'src/usecases/replaceTextUseCase';
import { WordTextReplacer } from 'src/infrastructure/office/word/wordTextReplace';
import { LocalStorageMappingRepository } from 'src/infrastructure/storage/localStorage';
import { CsvMappingRepository } from 'src/infrastructure/storage/csv';
import { FindText } from 'src/domain/findText';
const localRepository = new LocalStorageMappingRepository();
const fileRegistry = new Map();
const externalRepository = new CsvMappingRepository(fileRegistry);
const replacer = new WordTextReplacer();
const useCase = new ReplaceTextUseCase(localRepository, replacer);
const App = () => {
    const [mapping, setMapping] = useState([]);
    // file input リセット用
    const [fileInputKey] = useState(0);
    // 初期ロード：localStorage のマッピングを読み込んで表示
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setMapping(JSON.parse(saved));
            }
            catch (error) {
                console.error(error);
            }
        }
    }, []);
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            localRepository.save(STORAGE_KEY, mapping).then(() => { });
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [mapping]);
    // 「ルールの追加」ボタン
    const onAddRule = () => {
        setMapping([...mapping, { findText: new FindText(''), replaceText: '' }]);
    };
    // 各行の入力変更
    const onChangeRule = (idx, field) => (e) => {
        const copy = [...mapping];
        copy[idx] = { ...copy[idx], [field]: e.target.value };
        setMapping(copy);
    };
    // ファイル選択・読み込み
    const onFileChange = async (e) => {
        const file = e.target.files?.[0];
        fileRegistry.set(CSV_FILE_STORAGE_ID, file);
        if (!file)
            return;
        const m = await externalRepository.load(CSV_FILE_STORAGE_ID);
        localRepository.save(STORAGE_KEY, m);
        setMapping(m);
    };
    const onSave = async () => {
        await localRepository.save(STORAGE_KEY, mapping);
    };
    return (_jsxs("div", { className: "container", children: [_jsxs("div", { className: "controls", children: [_jsx("button", { onClick: onSave, disabled: mapping.length === 0, children: "\u4FDD\u5B58" }), _jsx("button", { onClick: onAddRule, children: "\u30EB\u30FC\u30EB\u306E\u8FFD\u52A0" })] }), _jsx("div", { className: "load-csv", children: _jsx("input", { type: "file", accept: ".csv", onChange: onFileChange }, fileInputKey) }), _jsx("div", { className: "rules", children: mapping.map((rule, idx) => (_jsxs("div", { className: "rule-row", children: [_jsx("input", { type: "text", placeholder: "\u7F6E\u63DB\u524D", value: rule.findText.value, onChange: onChangeRule(idx, 'findText') }), _jsx("span", { className: "arrow", children: "\u2192" }), _jsx("input", { type: "text", placeholder: "\u7F6E\u63DB\u5F8C", value: rule.replaceText, onChange: onChangeRule(idx, 'replaceText') })] }, idx))) }), _jsx("button", { className: "run-button", onClick: async () => {
                    try {
                        await useCase.run('default');
                        alert('置換が完了しました');
                    }
                    catch (e) {
                        console.error(e);
                        alert('置換中にエラーが発生しました');
                    }
                }, disabled: mapping.length === 0, children: "\u7F6E\u63DB\u5B9F\u884C" })] }));
};
// Fast Refresh を有効にするために App をエクスポート
export default App;
// React アプリをマウント
Office.onReady().then(() => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(_jsx(App, {}));
});
