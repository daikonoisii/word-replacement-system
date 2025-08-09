import type { ChangeEvent } from 'react';
import type { Mapping } from 'src/domain/mapping';
import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import {
  STORAGE_KEY,
  CSV_FILE_STORAGE_ID,
  HIGHLIGHT_COLOR,
  DEFAULT_RULE_NAME,
} from 'src/constants/storage';
import { ReplaceTextUseCase } from 'src/usecases/replaceTextUseCase';
import {
  ReplaceAndHighlightReplacer,
  WordTextUndoReplacer,
} from 'src/infrastructure/office/word/wordTextReplace';
import { LocalStorageMappingRepository } from 'src/infrastructure/storage/localStorage';
import { CsvMappingRepository } from 'src/infrastructure/storage/csv';
import { FindText } from 'src/domain/findText';

const localMappingRepository = new LocalStorageMappingRepository();
const fileRegistry = new Map<string, File | undefined>();
const externalRepository = new CsvMappingRepository(fileRegistry);
const replacer = new ReplaceAndHighlightReplacer(HIGHLIGHT_COLOR);
const useCase = new ReplaceTextUseCase(localMappingRepository, replacer);
const undoReplacementsUseCase = new ReplaceTextUseCase(
  localMappingRepository,
  new WordTextUndoReplacer()
);

const App: React.FC = () => {
  const [mapping, setMapping] = useState<Mapping[]>([]);
  const [saveName, setSaveName] = useState(''); // 入力欄（新規名用）
  const [currentRuleName, setCurrentRuleName] = useState('');
  // file input リセット用
  const [fileInputKey] = useState(0);

  // 初期ロード：localStorage のマッピングを読み込んで表示
  useEffect(() => {
    setCurrentRuleName(localStorage.getItem(STORAGE_KEY) || '');
    setSaveName(currentRuleName);
    const saved = localStorage.getItem(currentRuleName);
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
      // 現在編集しているルールの名称を取得
      if (currentRuleName) {
        try {
          localMappingRepository.save(currentRuleName, mapping).then(() => {});
        } catch (error) {
          console.error(error);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [mapping]);

  // 「ルールの追加」ボタン
  const onAddRule = () => {
    setMapping([...mapping, { findText: new FindText(''), replaceText: '' }]);
  };

  const onRemoveRule = (idx: number) => {
    setMapping((prev) => {
      const newMapping = prev.filter((_, index) => index !== idx);
      return newMapping;
    });
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
    localMappingRepository.save(DEFAULT_RULE_NAME, m);
    localStorage.setItem(STORAGE_KEY, DEFAULT_RULE_NAME);
    setCurrentRuleName(DEFAULT_RULE_NAME);
    setMapping(m);
  };

  // 名前を付けて保存
  const onSaveAs = async () => {
    const name = saveName.trim();
    if (!name) return;
    try {
      localStorage.setItem(STORAGE_KEY, name);
      setCurrentRuleName(name);
      await localMappingRepository.save(name, mapping);
    } catch (e) {
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
    } catch (e) {
      console.error('上書き保存 失敗:', e);
    }
  };
  return (
    <div className="container">
      {/* 上部コントロール */}
      <div className="controls">
        {/* CSV 読み込み用 */}
        <div className="load-csv">
          <input
            key={fileInputKey}
            type="file"
            accept=".csv"
            onChange={onFileChange}
          />
        </div>
        <button onClick={onAddRule}>ルールの追加</button>
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
            <button onClick={() => onRemoveRule(idx)}>削除</button>
          </div>
        ))}
      </div>

      <div className="button-container">
        {/* 置換を取り消すボタン */}
        <button
          className="undo-button"
          onClick={async () => {
            try {
              if (!currentRuleName) {
                throw new Error('currentRuleName is empty');
              }
              await undoReplacementsUseCase.run(currentRuleName);
            } catch (e) {
              console.error(e);
            }
            // window.localStorage.removeItem(UNDO_STORAGE_KEY);
          }}
        >
          元に戻す
        </button>
        {/* 置換実行ボタン */}
        <button
          onClick={async () => {
            try {
              if (!currentRuleName) {
                throw new Error('currentRuleName is empty');
              }
              await useCase.run(currentRuleName);
            } catch (e) {
              console.error(e);
            }
          }}
          disabled={mapping.length === 0}
        >
          置換実行
        </button>
      </div>
      {/* ルールを保存 */}
      <div className="controls">
        {currentRuleName !== DEFAULT_RULE_NAME && (
          <button onClick={onOverwrite} disabled={mapping.length === 0}>
            上書き保存
          </button>
        )}
        <button onClick={onSaveAs}>名前を付けて保存</button>
        <input
          type="text"
          placeholder="保存名を入力"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
        />
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
