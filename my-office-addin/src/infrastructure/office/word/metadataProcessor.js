import { UNDO_STORAGE_KEY } from 'src/constants/storage';
export class MetadataProcessor {
    async process(ranges, mapping, context) {
        // OOXML を取得
        const ooxmlPromises = ranges.map((r) => r.getOoxml());
        await context.sync();
        const ooxmlValues = ooxmlPromises.map((cr) => cr.value);
        // レコードを追記
        const raw = window.localStorage.getItem(UNDO_STORAGE_KEY);
        const records = raw ? JSON.parse(raw) : [];
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
