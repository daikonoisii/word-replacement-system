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
export class LocalStorageUndoMappingRepository {
    async load(sourceId) {
        const raw = window.localStorage.getItem(sourceId);
        if (!raw)
            return [];
        try {
            const entries = JSON.parse(raw);
            return entries.map((entry) => ({
                // 逆置換: replaceText から findText を生成
                findText: new FindText(entry.replaceText),
                // 元のテキストを replaceText に設定
                replaceText: entry.findText,
            }));
        }
        catch (e) {
            console.error('Undo mapping load failed:', e);
            return [];
        }
    }
    async save(_sourceId, _mapping) {
        // Undo 用リポジトリでは save を行わない
    }
}
