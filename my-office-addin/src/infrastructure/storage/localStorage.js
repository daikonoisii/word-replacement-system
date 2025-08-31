import { Mapping } from 'src/domain/mapping';
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
                const mapping = new Mapping(new FindText(value), entry.replaceText);
                return mapping;
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
            // 逆置換: replaceText から findText を生成
            return entries.map((entry) => {
                return new Mapping(new FindText(entry.replaceText), entry.findText);
            });
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
export class LocalStorageListRepository {
    async load(sourceId) {
        const saved = localStorage.getItem(sourceId);
        return saved ? JSON.parse(saved) : [];
    }
    async add(sourceId, list) {
        // 既存の配列の後ろに複数の要素を追加する
        const saved = localStorage.getItem(sourceId);
        const array = saved ? JSON.parse(saved) : [];
        array.push(...list);
        localStorage.setItem(sourceId, JSON.stringify(array));
    }
}
