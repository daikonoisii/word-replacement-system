import { Mapping, type UndoRecord } from 'src/domain/mapping';
import type { IMappingRepository } from 'src/repositories/mappingInterfaces';
import type { IListRepository } from 'src/repositories/listInterface';
import { FindText } from 'src/domain/findText';

export class LocalStorageMappingRepository implements IMappingRepository {
  async load(sourceId: string): Promise<Mapping[]> {
    let map: string | null = null;

    try {
      // Office.contextが利用可能かチェック
      if (
        typeof Office !== 'undefined' &&
        Office.context &&
        Office.context.roamingSettings
      ) {
        map = Office.context.roamingSettings.get(sourceId) as string | null;
      } else {
        // フォールバックとしてlocalStorageを使用
        map = localStorage.getItem(sourceId);
      }
    } catch (error) {
      console.warn(
        'roamingSettings not available, falling back to localStorage:',
        error
      );
      map = localStorage.getItem(sourceId);
    }

    if (!map) return [];

    try {
      // JSON.parseするとprototypeが失われるため再生成
      const arr = JSON.parse(map) as Array<{
        findText: { value: string } | string;
        replaceText: string;
      }>;
      return arr.map(
        (entry: {
          findText: { value: string } | string;
          replaceText: string;
        }) => {
          // entry.findText が文字列で来る場合
          const value =
            typeof entry.findText === 'string'
              ? entry.findText
              : entry.findText.value;
          const mapping = new Mapping(new FindText(value), entry.replaceText);
          return mapping;
        }
      );
    } catch (e) {
      console.error('roamingSettings からのマッピング読み込みに失敗:', e);
      return [];
    }
  }
  async save(sourceId: string, mapping: Mapping[]): Promise<void> {
    try {
      // Office.contextが利用可能かチェック
      if (
        typeof Office !== 'undefined' &&
        Office.context &&
        Office.context.roamingSettings
      ) {
        Office.context.roamingSettings.set(sourceId, JSON.stringify(mapping));
        return new Promise<void>((resolve, reject) => {
          Office.context.roamingSettings.saveAsync((result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
              resolve();
            } else {
              reject(
                new Error(result.error?.message || 'roamingSettings保存に失敗')
              );
            }
          });
        });
      } else {
        // フォールバックとしてlocalStorageを使用
        localStorage.setItem(sourceId, JSON.stringify(mapping));
        return Promise.resolve();
      }
    } catch (error) {
      console.warn(
        'roamingSettings not available, falling back to localStorage:',
        error
      );
      localStorage.setItem(sourceId, JSON.stringify(mapping));
      return Promise.resolve();
    }
  }
}

export class LocalStorageUndoMappingRepository implements IMappingRepository {
  async load(sourceId: string): Promise<Mapping[]> {
    let raw: string | null = null;

    try {
      // Office.contextが利用可能かチェック
      if (
        typeof Office !== 'undefined' &&
        Office.context &&
        Office.context.roamingSettings
      ) {
        raw = Office.context.roamingSettings.get(sourceId) as string | null;
      } else {
        // フォールバックとしてlocalStorageを使用
        raw = localStorage.getItem(sourceId);
      }
    } catch (error) {
      console.warn(
        'roamingSettings not available, falling back to localStorage:',
        error
      );
      raw = localStorage.getItem(sourceId);
    }

    if (!raw) return [];
    try {
      const entries = JSON.parse(raw) as UndoRecord[];
      // 逆置換: replaceText から findText を生成

      return entries.map((entry: UndoRecord) => {
        return new Mapping(new FindText(entry.replaceText), entry.findText);
      });
    } catch (e) {
      console.error('Undo mapping load failed:', e);
      return [];
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async save(_sourceId: string, _mapping: Mapping[]): Promise<void> {
    // Undo 用リポジトリでは save を行わない
  }
}

export class LocalStorageListRepository implements IListRepository {
  async load(sourceId: string): Promise<string[]> {
    let saved: string | null = null;

    try {
      // Office.contextが利用可能かチェック
      if (
        typeof Office !== 'undefined' &&
        Office.context &&
        Office.context.roamingSettings
      ) {
        saved = Office.context.roamingSettings.get(sourceId) as string | null;
      } else {
        // フォールバックとしてlocalStorageを使用
        saved = localStorage.getItem(sourceId);
      }
    } catch (error) {
      console.warn(
        'roamingSettings not available, falling back to localStorage:',
        error
      );
      saved = localStorage.getItem(sourceId);
    }

    if (!saved) return [];
    return JSON.parse(saved) as string[];
  }
  async add(sourceId: string, list: string[]): Promise<void> {
    try {
      // 既存の配列の後ろに複数の要素を追加する
      let saved: string | null = null;

      // Office.contextが利用可能かチェック
      if (
        typeof Office !== 'undefined' &&
        Office.context &&
        Office.context.roamingSettings
      ) {
        saved = Office.context.roamingSettings.get(sourceId) as string | null;
        const array = saved ? JSON.parse(saved) : [];
        array.push(...list);
        Office.context.roamingSettings.set(sourceId, JSON.stringify(array));
        return new Promise<void>((resolve, reject) => {
          Office.context.roamingSettings.saveAsync((result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
              resolve();
            } else {
              reject(
                new Error(result.error?.message || 'roamingSettings保存に失敗')
              );
            }
          });
        });
      } else {
        // フォールバックとしてlocalStorageを使用
        saved = localStorage.getItem(sourceId);
        const array = saved ? JSON.parse(saved) : [];
        array.push(...list);
        localStorage.setItem(sourceId, JSON.stringify(array));
        return Promise.resolve();
      }
    } catch (error) {
      console.warn(
        'roamingSettings not available, falling back to localStorage:',
        error
      );
      const saved = localStorage.getItem(sourceId);
      const array = saved ? JSON.parse(saved) : [];
      array.push(...list);
      localStorage.setItem(sourceId, JSON.stringify(array));
      return Promise.resolve();
    }
  }
}
