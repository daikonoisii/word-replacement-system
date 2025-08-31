import { Mapping } from 'src/domain/mapping';
import { FindText } from 'src/domain/findText';
export class LocalStorageMappingRepository {
    async load(sourceId) {
        let map = null;
        try {
            // Office.contextが利用可能かチェック
            if (typeof Office !== 'undefined' &&
                Office.context &&
                Office.context.roamingSettings) {
                map = Office.context.roamingSettings.get(sourceId);
            }
            else {
                // フォールバックとしてlocalStorageを使用
                map = localStorage.getItem(sourceId);
            }
        }
        catch (error) {
            console.warn('roamingSettings not available, falling back to localStorage:', error);
            map = localStorage.getItem(sourceId);
        }
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
            console.error('roamingSettings からのマッピング読み込みに失敗:', e);
            return [];
        }
    }
    async save(sourceId, mapping) {
        try {
            // Office.contextが利用可能かチェック
            if (typeof Office !== 'undefined' &&
                Office.context &&
                Office.context.roamingSettings) {
                Office.context.roamingSettings.set(sourceId, JSON.stringify(mapping));
                return new Promise((resolve, reject) => {
                    Office.context.roamingSettings.saveAsync((result) => {
                        if (result.status === Office.AsyncResultStatus.Succeeded) {
                            resolve();
                        }
                        else {
                            reject(new Error(result.error?.message || 'roamingSettings保存に失敗'));
                        }
                    });
                });
            }
            else {
                // フォールバックとしてlocalStorageを使用
                localStorage.setItem(sourceId, JSON.stringify(mapping));
                return Promise.resolve();
            }
        }
        catch (error) {
            console.warn('roamingSettings not available, falling back to localStorage:', error);
            localStorage.setItem(sourceId, JSON.stringify(mapping));
            return Promise.resolve();
        }
    }
}
export class LocalStorageUndoMappingRepository {
    async load(sourceId) {
        let raw = null;
        try {
            // Office.contextが利用可能かチェック
            if (typeof Office !== 'undefined' &&
                Office.context &&
                Office.context.roamingSettings) {
                raw = Office.context.roamingSettings.get(sourceId);
            }
            else {
                // フォールバックとしてlocalStorageを使用
                raw = localStorage.getItem(sourceId);
            }
        }
        catch (error) {
            console.warn('roamingSettings not available, falling back to localStorage:', error);
            raw = localStorage.getItem(sourceId);
        }
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async save(_sourceId, _mapping) {
        // Undo 用リポジトリでは save を行わない
    }
}
export class LocalStorageListRepository {
    async load(sourceId) {
        let saved = null;
        try {
            // Office.contextが利用可能かチェック
            if (typeof Office !== 'undefined' &&
                Office.context &&
                Office.context.roamingSettings) {
                saved = Office.context.roamingSettings.get(sourceId);
            }
            else {
                // フォールバックとしてlocalStorageを使用
                saved = localStorage.getItem(sourceId);
            }
        }
        catch (error) {
            console.warn('roamingSettings not available, falling back to localStorage:', error);
            saved = localStorage.getItem(sourceId);
        }
        if (!saved)
            return [];
        return JSON.parse(saved);
    }
    async add(sourceId, list) {
        try {
            // 既存の配列の後ろに複数の要素を追加する
            let saved = null;
            // Office.contextが利用可能かチェック
            if (typeof Office !== 'undefined' &&
                Office.context &&
                Office.context.roamingSettings) {
                saved = Office.context.roamingSettings.get(sourceId);
                const array = saved ? JSON.parse(saved) : [];
                array.push(...list);
                Office.context.roamingSettings.set(sourceId, JSON.stringify(array));
                return new Promise((resolve, reject) => {
                    Office.context.roamingSettings.saveAsync((result) => {
                        if (result.status === Office.AsyncResultStatus.Succeeded) {
                            resolve();
                        }
                        else {
                            reject(new Error(result.error?.message || 'roamingSettings保存に失敗'));
                        }
                    });
                });
            }
            else {
                // フォールバックとしてlocalStorageを使用
                saved = localStorage.getItem(sourceId);
                const array = saved ? JSON.parse(saved) : [];
                array.push(...list);
                localStorage.setItem(sourceId, JSON.stringify(array));
                return Promise.resolve();
            }
        }
        catch (error) {
            console.warn('roamingSettings not available, falling back to localStorage:', error);
            const saved = localStorage.getItem(sourceId);
            const array = saved ? JSON.parse(saved) : [];
            array.push(...list);
            localStorage.setItem(sourceId, JSON.stringify(array));
            return Promise.resolve();
        }
    }
}
