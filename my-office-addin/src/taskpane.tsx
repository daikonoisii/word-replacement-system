import type { ChangeEvent } from 'react';
import type { Mapping } from 'src/domain/mapping';
import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import {
  STORAGE_KEY,
  CSV_FILE_STORAGE_ID,
  HIGHLIGHT_COLOR,
  DEFAULT_RULE_NAME,
  RULE_LIST_NAME,
} from 'src/constants/storage';
import { ReplaceTextUseCase } from 'src/usecases/replaceTextUseCase';
import {
  ReplaceAndHighlightReplacer,
  WordTextUndoReplacer,
} from 'src/infrastructure/office/word/wordTextReplace';
import {
  LocalStorageMappingRepository,
  LocalStorageListRepository,
} from 'src/infrastructure/storage/localStorage';
import { CsvMappingRepository } from 'src/infrastructure/storage/csv';
import { CsvTextDecoderService } from 'src/infrastructure/decoder/textDecoder';
import { FindText } from 'src/domain/findText';

const localMappingRepository = new LocalStorageMappingRepository();
const fileRegistry = new Map<string, File | undefined>();
const unicodeDecoder = new CsvTextDecoderService();
const externalRepository = new CsvMappingRepository(
  fileRegistry,
  unicodeDecoder
);
const replacer = new ReplaceAndHighlightReplacer(HIGHLIGHT_COLOR);
const useCase = new ReplaceTextUseCase(localMappingRepository, replacer);
const undoReplacementsUseCase = new ReplaceTextUseCase(
  localMappingRepository,
  new WordTextUndoReplacer()
);
const localListRepository = new LocalStorageListRepository();

const App: React.FC = () => {
  const [mapping, setMapping] = useState<Mapping[]>([]);
  const [saveName, setSaveName] = useState(''); // 入力欄（新規名用）
  const [currentRuleName, setCurrentRuleName] = useState('');
  const [ruleNames, setRuleNames] = useState<string[]>([]);
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
    (async () => {
      try {
        const list = await localListRepository.load(RULE_LIST_NAME);
        setRuleNames(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('rule list load error:', e);
        setRuleNames([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!currentRuleName) return;
    try {
      const saved = localStorage.getItem(currentRuleName);
      if (saved) setMapping(JSON.parse(saved));
      localStorage.setItem(STORAGE_KEY, currentRuleName);
      setSaveName(currentRuleName);
    } catch (e) {
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
      const v = e.target.value;
      setMapping((prev) => {
        const next = [...prev];
        if (field === 'findText') {
          next[idx] = { ...next[idx], findText: new FindText(v) };
        } else {
          next[idx] = { ...next[idx], replaceText: v };
        }
        return next;
      });
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
      await localListRepository.add(RULE_LIST_NAME, [name]);
      setRuleNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
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
      {/* CSV 読み込み用 */}
      <div className="load-csv">
        <input
          key={fileInputKey}
          type="file"
          accept=".csv"
          onChange={onFileChange}
        />
      </div>
      {/* 保存されたルールの読み込み */}
      <div className="form-group">
        <span className="form-label">項目を選択：</span>
        <label>
          <select
            value={currentRuleName}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setCurrentRuleName(e.target.value);
            }}
          >
            <option value="" disabled>
              選択してください
            </option>
            {ruleNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
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
        <button onClick={onAddRule}>項目の追加</button>
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
        {currentRuleName !== DEFAULT_RULE_NAME && (
          <button onClick={onOverwrite} disabled={mapping.length === 0}>
            上書き保存
          </button>
        )}
        {/* 項目を保存 */}
        <div className="controls">
          <button onClick={onSaveAs}>名前を付けて保存</button>
          <input
            type="text"
            placeholder="保存名を入力"
            onChange={(e) => setSaveName(e.target.value)}
          />
        </div>
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
