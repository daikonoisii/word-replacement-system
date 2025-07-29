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
    const raw = window.localStorage.getItem(UNDO_STORAGE_KEY);
    const records: UndoRecord[] = raw ? JSON.parse(raw) : [];
    for (const ooxmlText of ooxmlValues) {
      records.push({
        findText: mapping.findText.value,
        replaceText: mapping.replaceText,
        ooxmlText,
      });
    }

    window.localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(records));
  }
}
