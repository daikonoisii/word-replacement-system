import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
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

function loadMappingFromLocalStorage(): Mapping[] {
  // 1) キー名は STORAGE_KEY 定数と合わせる
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      // 2) JSON 文字列をオブジェクトに変換
      return JSON.parse(saved);
    } catch (e) {
      console.error('localStorage からのマッピング読み込みに失敗:', e);
    }
  }
  // 3) 保存データがないかパース失敗時は空配列を返す
  return [];
}


async function runReplaceLogic(mapping: Mapping[]) {
  await Word.run(async context => {
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

const App: React.FC = () => {
  const [mapping, setMapping] = useState<Mapping[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0); // file input リセット用

  // 初期ロード：localStorage のマッピングを読み込んで表示
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setMapping(JSON.parse(saved)); } catch (error) {
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
  const onChangeRule = (idx: number, field: 'findText' | 'replaceText') => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const copy = [...mapping];
    copy[idx] = { ...copy[idx], [field]: e.target.value };
    setMapping(copy);
  };

  // ファイル選択・読み込み
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const m = await readCsv(file);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
    setMapping(m);
  };

  // 「保存」ボタン：CSV を生成してダウンロード
  const onSave = () => {
    const mapping = loadMappingFromLocalStorage();
    const csv =
      mapping.map(({ findText, replaceText }) => `${findText},${replaceText}`).join('\n') +
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

  return (
    <div className="container">
      {/* 上部コントロール */}
      <div className="controls">
        <button onClick={onSave} disabled={mapping.length === 0}>
          保存
        </button>
        <button onClick={onAddRule}>ルールの追加</button>
      </div>

      {/* CSV 読み込み用 */}
      <div className="load-csv">
        <input
          key={fileInputKey}
          type="file"
          accept=".csv"
          onChange={onFileChange}
        />
      </div>

      {/* ルール一覧 */}
      <div className="rules">
        {mapping.map((rule, idx) => (
          <div className="rule-row" key={idx}>
            <input
              type="text"
              placeholder="置換前"
              value={rule.findText}
              onChange={onChangeRule(idx, 'findText')}
            />
            <span className="arrow">→</span>
            <input
              type="text"
              placeholder="置換後"
              value={rule.replaceText}
              onChange={onChangeRule(idx, 'replaceText')}
            />
          </div>
        ))}
      </div>

      {/* 実行ボタン */}
      <button
        className="run-button"
        onClick={() => runReplaceLogic(mapping)}
        disabled={mapping.length === 0}
      >
        置換実行
      </button>
    </div>
  );
};

// Fast Refresh を有効にするために App をエクスポート
export default App;

// React アプリをマウント
Office.onReady().then(() => {
  const container = document.getElementById('root')!;
  const root = createRoot(container);
  root.render(<App />);
});
