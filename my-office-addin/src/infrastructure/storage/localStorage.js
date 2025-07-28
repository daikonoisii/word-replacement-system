import { FindText } from 'src/domain/findText';
export class LocalStorageMappingRepository {
    async load(sourceId) {
        const map = localStorage.getItem(sourceId);
        if (!map)
            return [];
        try {
            // JSON.parseするとprototypeが失われるため再生成
            const arr = JSON.parse(map);
            return arr.map((entry) => {
                // entry.findText が文字列で来る場合
                const value = typeof entry.findText === 'string'
                    ? entry.findText
                    : entry.findText.value;
                return {
                    findText: new FindText(value),
                    replaceText: entry.replaceText,
                };
            });
        }
        catch (e) {
            console.error('localStorage からのマッピング読み込みに失敗:', e);
            return [];
        }
    }
    async save(sourceId, mapping) {
        localStorage.setItem(sourceId, JSON.stringify(mapping));
    }
}
