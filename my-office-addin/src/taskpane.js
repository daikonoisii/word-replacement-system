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
async function runReplaceLogic(mapping) {
    await Word.run(async (context) => {
        const body = context.document.body;
        for (const { findText, replaceText } of mapping) {
            const results = body.search(findText, { matchCase: false, matchWholeWord: false });
            results.load('items');
            await context.sync();
            for (const range of results.items) {
                range.insertText(replaceText, Word.InsertLocation.replace);
            }
        }
        await context.sync();
    });
}
const App = () => {
    const [mapping, setMapping] = useState([]);
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
        Office.actions.associate('runReplaceLogic', () => runReplaceLogic(mapping));
    }, [mapping]);
    const onFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const m = await readCsv(file);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
        setMapping(m);
    };
    const onRunClick = () => runReplaceLogic(mapping);
    return (_jsxs("div", { className: "container", children: [_jsx("h2", { children: "CSV\u304B\u3089\u30DE\u30C3\u30D4\u30F3\u30B0\u8AAD\u307F\u8FBC\u307F" }), _jsx("input", { type: "file", accept: ".csv", onChange: onFileChange }), _jsx("button", { onClick: onRunClick, disabled: mapping.length === 0, children: "\u7F6E\u63DB\u5B9F\u884C" })] }));
};
// Fast Refresh を有効にするために App をエクスポート
export default App;
// React アプリをマウント
createRoot(document.getElementById('root')).render(_jsx(App, {}));
