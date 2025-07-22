import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '/src/components/taskpane.css';
const STORAGE_KEY = 'wordReplaceMapping';
async function readCsv(file) {
    const text = await file.text();
    return text
        .split(/\r?\n/)
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
        const [findText, replaceText] = line.split(',');
        return { findText: findText.trim(), replaceText: replaceText.trim() };
    });
}
function loadMappingFromLocalStorage() {
    // 1) キー名は STORAGE_KEY 定数と合わせる
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            // 2) JSON 文字列をオブジェクトに変換
            return JSON.parse(saved);
        }
        catch (e) {
            console.error('localStorage からのマッピング読み込みに失敗:', e);
        }
    }
    // 3) 保存データがないかパース失敗時は空配列を返す
    return [];
}
async function runReplaceLogic(mapping) {
    await Word.run(async (context) => {
        const body = context.document.body;
        for (const { findText, replaceText } of mapping) {
            const results = body.search(findText, { matchCase: false, matchWholeWord: false });
            results.load('items');
            await context.sync();
            for (const range of results.items) {
                // 1. 対象語句に横線（取り消し線）と赤字を適用
                range.font.strikeThrough = true;
                range.font.color = 'red';
                // 2. 直後に置換後語句（通常色）を挿入
                range.insertText(replaceText, Word.InsertLocation.after);
            }
        }
        await context.sync();
    });
}
const App = () => {
    const [mapping, setMapping] = useState([]);
    const [fileInputKey, setFileInputKey] = useState(0); // file input リセット用
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
        // Commands-Only 実行対応
        Office.actions.associate('runReplaceLogic', () => runReplaceLogic(mapping));
    }, []);
    // 「ルールの追加」ボタン
    const onAddRule = () => {
        setMapping([...mapping, { findText: '', replaceText: '' }]);
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
        if (!file)
            return;
        const m = await readCsv(file);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
        setMapping(m);
    };
    // 「保存」ボタン：CSV を生成してダウンロード
    const onSave = () => {
        const mapping = loadMappingFromLocalStorage();
        const csv = mapping.map(({ findText, replaceText }) => `${findText},${replaceText}`).join('\n') +
            '\n';
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mapping.csv';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        // 保存後もマッピングを UI に反映し続ける
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping));
        // file input をダウンロードした CSV に「擬似的に」合わせるためリセット（ユーザー選択は不可）
        setFileInputKey(prev => prev + 1);
    };
    return (_jsxs("div", { className: "container", children: [_jsxs("div", { className: "controls", children: [_jsx("button", { onClick: onSave, disabled: mapping.length === 0, children: "\u4FDD\u5B58" }), _jsx("button", { onClick: onAddRule, children: "\u30EB\u30FC\u30EB\u306E\u8FFD\u52A0" })] }), _jsx("div", { className: "load-csv", children: _jsx("input", { type: "file", accept: ".csv", onChange: onFileChange }, fileInputKey) }), _jsx("div", { className: "rules", children: mapping.map((rule, idx) => (_jsxs("div", { className: "rule-row", children: [_jsx("input", { type: "text", placeholder: "\u7F6E\u63DB\u524D", value: rule.findText, onChange: onChangeRule(idx, 'findText') }), _jsx("span", { className: "arrow", children: "\u2192" }), _jsx("input", { type: "text", placeholder: "\u7F6E\u63DB\u5F8C", value: rule.replaceText, onChange: onChangeRule(idx, 'replaceText') })] }, idx))) }), _jsx("button", { className: "run-button", onClick: () => runReplaceLogic(mapping), disabled: mapping.length === 0, children: "\u7F6E\u63DB\u5B9F\u884C" })] }));
};
// Fast Refresh を有効にするために App をエクスポート
export default App;
// React アプリをマウント
Office.onReady().then(() => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(_jsx(App, {}));
});
