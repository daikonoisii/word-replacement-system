import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import { STORAGE_KEY, CSV_FILE_STORAGE_ID, HIGHLIGHT_COLOR, DEFAULT_RULE_NAME, RULE_LIST_NAME, } from 'src/constants/storage';
import { ReplaceTextUseCase } from 'src/usecases/replaceTextUseCase';
import { ReplaceAndHighlightReplacer, WordTextUndoReplacer, } from 'src/infrastructure/office/word/wordTextReplace';
import { LocalStorageMappingRepository, LocalStorageListRepository, } from 'src/infrastructure/storage/localStorage';
import { CsvMappingRepository } from 'src/infrastructure/storage/csv';
import { CsvTextDecoderService } from 'src/infrastructure/decoder/textDecoder';
import { FindText } from 'src/domain/findText';
const localMappingRepository = new LocalStorageMappingRepository();
const fileRegistry = new Map();
const unicodeDecoder = new CsvTextDecoderService();
const externalRepository = new CsvMappingRepository(fileRegistry, unicodeDecoder);
const replacer = new ReplaceAndHighlightReplacer(HIGHLIGHT_COLOR);
const useCase = new ReplaceTextUseCase(replacer);
const undoReplacementsUseCase = new ReplaceTextUseCase(new WordTextUndoReplacer());
const localListRepository = new LocalStorageListRepository();
const App = () => {
    const [mapping, setMapping] = useState([]);
    const [saveName, setSaveName] = useState(''); // 入力欄（新規名用）
    const [currentRuleName, setCurrentRuleName] = useState('');
    const [ruleNames, setRuleNames] = useState([]);
    // file input リセット用
    const [fileInputKey] = useState(0);
    // 初期ロード：localStorage のマッピングを読み込んで表示
    useEffect(() => {
        setCurrentRuleName(localStorage.getItem(STORAGE_KEY) || DEFAULT_RULE_NAME);
        setSaveName(currentRuleName);
        const saved = localStorage.getItem(currentRuleName);
        if (saved) {
            try {
                setMapping(JSON.parse(saved));
            }
            catch (error) {
                console.error(error);
            }
        }
        (async () => {
            try {
                const list = await localListRepository.load(RULE_LIST_NAME);
                setRuleNames(Array.isArray(list) ? list : []);
            }
            catch (e) {
                console.error('rule list load error:', e);
                setRuleNames([]);
            }
        })();
    }, []);
    useEffect(() => {
        if (!currentRuleName)
            return;
        try {
            const saved = localStorage.getItem(currentRuleName);
            if (saved)
                setMapping(JSON.parse(saved));
            localStorage.setItem(STORAGE_KEY, currentRuleName);
            setSaveName(currentRuleName);
        }
        catch (e) {
            console.error('load mapping by currentRuleName error:', e);
        }
    }, [currentRuleName]);
    // useEffect(() => {
    //   const timeoutId = setTimeout(() => {
    //     // 現在編集しているルールの名称を取得
    //     if (currentRuleName) {
    //       try {
    //         localMappingRepository.save(currentRuleName, mapping).then(() => {});
    //       } catch (error) {
    //         console.error(error);
    //       }
    //     }
    //   }, 500);
    //   return () => clearTimeout(timeoutId);
    // }, [mapping]);
    // 「ルールの追加」ボタン
    const onAddRule = () => {
        setMapping([...mapping, { findText: new FindText(''), replaceText: '' }]);
    };
    const onRemoveRule = (idx) => {
        setMapping((prev) => {
            const newMapping = prev.filter((_, index) => index !== idx);
            return newMapping;
        });
    };
    // 各行の入力変更
    const onChangeRule = (idx, field) => (e) => {
        const v = e.target.value;
        setMapping((prev) => {
            const next = [...prev];
            if (field === 'findText') {
                next[idx] = { ...next[idx], findText: new FindText(v) };
            }
            else {
                next[idx] = { ...next[idx], replaceText: v };
            }
            return next;
        });
    };
    // ファイル選択・読み込み
    const onFileChange = async (e) => {
        const file = e.target.files?.[0];
        fileRegistry.set(CSV_FILE_STORAGE_ID, file);
        if (!file)
            return;
        const m = await externalRepository.load(CSV_FILE_STORAGE_ID);
        localMappingRepository.save(DEFAULT_RULE_NAME, m);
        localStorage.setItem(STORAGE_KEY, DEFAULT_RULE_NAME);
        setCurrentRuleName(DEFAULT_RULE_NAME);
        setMapping(m);
    };
    // 名前を付けて保存
    const onSaveAs = async () => {
        const name = saveName.trim();
        if (!name)
            return;
        try {
            localStorage.setItem(STORAGE_KEY, name);
            setCurrentRuleName(name);
            await localMappingRepository.save(name, mapping);
            await localListRepository.add(RULE_LIST_NAME, [name]);
            setRuleNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
        }
        catch (e) {
            console.error('名前を付けて保存 失敗:', e);
        }
    };
    // 上書き保存
    const onOverwrite = async () => {
        if (!currentRuleName) {
            console.info('currentRuleName is empty');
            return;
        }
        console.info('currentRuleName is ' + currentRuleName);
        try {
            console.info('start localMappingRepository');
            await localMappingRepository.save(currentRuleName, mapping);
        }
        catch (e) {
            console.error('上書き保存 失敗:', e);
        }
    };
    return (_jsxs("div", { className: "container", children: [_jsx("div", { className: "load-csv", children: _jsx("input", { type: "file", accept: ".csv", onChange: onFileChange }, fileInputKey) }), _jsxs("div", { className: "form-group", children: [_jsx("span", { className: "form-label", children: "\u9805\u76EE\u3092\u9078\u629E\uFF1A" }), _jsx("label", { children: _jsxs("select", { value: currentRuleName, onChange: (e) => {
                                setCurrentRuleName(e.target.value);
                            }, children: [_jsx("option", { value: "", disabled: true, children: "\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), ruleNames.map((name) => (_jsx("option", { value: name, children: name }, name)))] }) })] }), _jsx("div", { className: "rules", children: mapping.map((rule, idx) => (_jsxs("div", { className: "rule-row", children: [_jsx("input", { type: "text", placeholder: "\u7F6E\u63DB\u524D", value: rule.findText.value, onChange: onChangeRule(idx, 'findText') }), _jsx("span", { className: "arrow", children: "\u2192" }), _jsx("input", { type: "text", placeholder: "\u7F6E\u63DB\u5F8C", value: rule.replaceText, onChange: onChangeRule(idx, 'replaceText') }), _jsx("button", { onClick: () => onRemoveRule(idx), children: "\u524A\u9664" })] }, idx))) }), _jsxs("div", { className: "button-container", children: [_jsx("button", { onClick: onAddRule, children: "\u9805\u76EE\u306E\u8FFD\u52A0" }), _jsx("button", { className: "undo-button", onClick: async () => {
                            try {
                                if (!currentRuleName) {
                                    throw new Error('currentRuleName is empty');
                                }
                                await undoReplacementsUseCase.run(mapping);
                            }
                            catch (e) {
                                console.error(e);
                            }
                            // window.localStorage.removeItem(UNDO_STORAGE_KEY);
                        }, children: "\u5143\u306B\u623B\u3059" }), _jsx("button", { onClick: async () => {
                            try {
                                if (!currentRuleName) {
                                    throw new Error('currentRuleName is empty');
                                }
                                await useCase.run(mapping);
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }, disabled: mapping.length === 0, children: "\u7F6E\u63DB\u5B9F\u884C" }), currentRuleName !== DEFAULT_RULE_NAME && (_jsx("button", { onClick: onOverwrite, disabled: mapping.length === 0, children: "\u4E0A\u66F8\u304D\u4FDD\u5B58" })), _jsxs("div", { className: "controls", children: [_jsx("button", { onClick: onSaveAs, children: "\u540D\u524D\u3092\u4ED8\u3051\u3066\u4FDD\u5B58" }), _jsx("input", { type: "text", placeholder: "\u4FDD\u5B58\u540D\u3092\u5165\u529B", onChange: (e) => setSaveName(e.target.value) })] })] })] }));
};
// Fast Refresh を有効にするために App をエクスポート
export default App;
// React アプリをマウント
Office.onReady().then(() => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(_jsx(App, {}));
});
