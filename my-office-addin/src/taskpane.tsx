import type { ChangeEvent } from 'react';
import type { Mapping } from 'src/domain/mapping';
import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import {
  STORAGE_KEY,
  CSV_FILE_STORAGE_ID,
  UNDO_STORAGE_KEY,
  HIGHLIGHT_COLOR,
} from 'src/constants/storage';
import { ReplaceTextUseCase } from 'src/usecases/replaceTextUseCase';
import {
  ReplaceAndHighlightReplacer,
  WordTextUndoReplacer,
} from 'src/infrastructure/office/word/wordTextReplace';
import { LocalStorageMappingRepository } from 'src/infrastructure/storage/localStorage';
import { CsvMappingRepository } from 'src/infrastructure/storage/csv';
import { FindText } from 'src/domain/findText';

const localRepository = new LocalStorageMappingRepository();
const fileRegistry = new Map<string, File | undefined>();
const externalRepository = new CsvMappingRepository(fileRegistry);
const replacer = new ReplaceAndHighlightReplacer(HIGHLIGHT_COLOR);
const useCase = new ReplaceTextUseCase(localRepository, replacer);
const undoReplacementsUseCase = new ReplaceTextUseCase(
  localRepository,
  new WordTextUndoReplacer()
);

const App: React.FC = () => {
  const [mapping, setMapping] = useState<Mapping[]>([]);
  // file input リセット用
  const [fileInputKey] = useState(0);

  // 初期ロード：localStorage のマッピングを読み込んで表示
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMapping(JSON.parse(saved));
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localRepository.save(STORAGE_KEY, mapping).then(() => {});
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [mapping]);

  // 「ルールの追加」ボタン
  const onAddRule = () => {
    setMapping([...mapping, { findText: new FindText(''), replaceText: '' }]);
  };

  // 各行の入力変更
  const onChangeRule =
    (idx: number, field: 'findText' | 'replaceText') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const copy = [...mapping];
      copy[idx] = { ...copy[idx], [field]: e.target.value };
      setMapping(copy);
    };

  // ファイル選択・読み込み
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    fileRegistry.set(CSV_FILE_STORAGE_ID, file);
    if (!file) return;
    const m = await externalRepository.load(CSV_FILE_STORAGE_ID);
    localRepository.save(STORAGE_KEY, m);
    setMapping(m);
  };

  const onSave = async () => {
    await localRepository.save(STORAGE_KEY, mapping);
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
              value={rule.findText.value}
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

      <div className="button-container">
        <button
          className="undo-button"
          onClick={async () => {
            await undoReplacementsUseCase.run(STORAGE_KEY);
            window.localStorage.removeItem(UNDO_STORAGE_KEY);
          }}
        >
          元に戻す
        </button>
        <button
          onClick={async () => {
            try {
              await useCase.run(STORAGE_KEY);
            } catch (e) {
              console.error(e);
            }
          }}
          disabled={mapping.length === 0}
        >
          置換実行
        </button>
      </div>
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
