import type { IRangeProcessor } from 'src/repositories/rangeProcessInterface';
import type { Mapping, UndoRecord } from 'src/domain/mapping';
import { UNDO_STORAGE_KEY } from 'src/constants/storage';

export class MetadataProcessor implements IRangeProcessor {
  async process(
    ranges: Word.Range[],
    mapping: Mapping,
    context: Word.RequestContext
  ): Promise<void> {
    // OOXML を取得
    const ooxmlPromises = ranges.map((r) => r.getOoxml());
    await context.sync();
    const ooxmlValues = ooxmlPromises.map((cr) => cr.value);

    // レコードを追記
    let raw: string | null = null;
    let records: UndoRecord[] = [];

    try {
      // Office.contextが利用可能かチェック
      if (
        typeof Office !== 'undefined' &&
        Office.context &&
        Office.context.roamingSettings
      ) {
        raw = Office.context.roamingSettings.get(UNDO_STORAGE_KEY) as
          | string
          | null;
      } else {
        // フォールバックとしてlocalStorageを使用
        raw = localStorage.getItem(UNDO_STORAGE_KEY);
      }
      records = raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.warn(
        'roamingSettings not available, falling back to localStorage:',
        error
      );
      raw = localStorage.getItem(UNDO_STORAGE_KEY);
      records = raw ? JSON.parse(raw) : [];
    }

    for (const ooxmlText of ooxmlValues) {
      records.push({
        findText: mapping.findText.value,
        replaceText: mapping.replaceText,
        ooxmlText,
      });
    }

    try {
      // Office.contextが利用可能かチェック
      if (
        typeof Office !== 'undefined' &&
        Office.context &&
        Office.context.roamingSettings
      ) {
        Office.context.roamingSettings.set(
          UNDO_STORAGE_KEY,
          JSON.stringify(records)
        );
        Office.context.roamingSettings.saveAsync(() => {
          // 保存の完了は特に待たない（非同期で実行）
        });
      } else {
        // フォールバックとしてlocalStorageを使用
        localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(records));
      }
    } catch (error) {
      console.warn(
        'roamingSettings not available, falling back to localStorage:',
        error
      );
      localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(records));
    }
  }
}
