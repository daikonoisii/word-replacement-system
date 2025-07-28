export class LocalStorageMappingRepository {
    async load(sourceId) {
        const map = localStorage.getItem(sourceId);
        if (map) {
            try {
                return JSON.parse(map);
            }
            catch (e) {
                console.error('localStorage からのマッピング読み込みに失敗:', e);
            }
        }
        // 保存データがないかパース失敗時は空配列を返す
        return [];
    }
    async save(sourceId, mapping) {
        localStorage.setItem(sourceId, JSON.stringify(mapping));
    }
}
