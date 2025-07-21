import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '/src/components/taskpane.css';

type Mapping = { findText: string; replaceText: string; };
const STORAGE_KEY = 'wordReplaceMapping';

async function readCsv(file: File): Promise<Mapping[]> {
  const text = await file.text();
  return text
    .split(/\r?\n/)
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [findText, replaceText] = line.split(',');
      return { findText: findText.trim(), replaceText: replaceText.trim() };
    });
}

async function runReplaceLogic(mapping: Mapping[]) {
  await Word.run(async context => {
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

const App: React.FC = () => {
  const [mapping, setMapping] = useState<Mapping[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setMapping(JSON.parse(saved)); } catch (error) {
        console.error(error);
      }
    }
    Office.actions.associate('runReplaceLogic', () => runReplaceLogic(mapping));
  }, [mapping]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const m = await readCsv(file);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
    setMapping(m);
  };

  const onRunClick = () => runReplaceLogic(mapping);

  return (
    <div className="container">
      <h2>CSVからマッピング読み込み</h2>
      <input type="file" accept=".csv" onChange={onFileChange} />
      <button onClick={onRunClick} disabled={mapping.length === 0}>
        置換実行
      </button>
    </div>
  );
};

// Fast Refresh を有効にするために App をエクスポート
export default App;

// React アプリをマウント
createRoot(document.getElementById('root')!).render(<App />);