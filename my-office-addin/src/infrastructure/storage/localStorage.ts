import { Mapping, type UndoRecord } from 'src/domain/mapping';
import type { IMappingRepository } from 'src/repositories/mappingInterfaces';
import type { IListRepository } from 'src/repositories/listInterface';
import { FindText } from 'src/domain/findText';

export class LocalStorageMappingRepository implements IMappingRepository {
  async load(sourceId: string): Promise<Mapping[]> {
    const map = localStorage.getItem(sourceId);
    if (!map) return [];

    try {
      // JSON.parseするとprototypeが失われるため再生成
      const arr = JSON.parse(map) as Array<{
        findText: { value: string } | string;
        replaceText: string;
      }>;
      return arr.map((entry) => {
        // entry.findText が文字列で来る場合
        const value =
          typeof entry.findText === 'string'
            ? entry.findText
            : entry.findText.value;
        const mapping = new Mapping(new FindText(value), entry.replaceText);
        return mapping;
      });
    } catch (e) {
      console.error('localStorage からのマッピング読み込みに失敗:', e);
      return [];
    }
  }
  async save(sourceId: string, mapping: Mapping[]): Promise<void> {
    localStorage.setItem(sourceId, JSON.stringify(mapping));
  }
}

export class LocalStorageUndoMappingRepository implements IMappingRepository {
  async load(sourceId: string): Promise<Mapping[]> {
    const raw = window.localStorage.getItem(sourceId);
    if (!raw) return [];
    try {
      const entries = JSON.parse(raw) as UndoRecord[];
      // 逆置換: replaceText から findText を生成

      return entries.map((entry) => {
        return new Mapping(new FindText(entry.replaceText), entry.findText);
      });
    } catch (e) {
      console.error('Undo mapping load failed:', e);
      return [];
    }
  }
  async save(_sourceId: string, _mapping: Mapping[]): Promise<void> {
    // Undo 用リポジトリでは save を行わない
  }
}

export class LocalStorageListRepository implements IListRepository {
  async load(sourceId: string): Promise<string[]> {
    const saved = localStorage.getItem(sourceId);
    return saved ? JSON.parse(saved) : [];
  }
  async add(sourceId: string, list: string[]): Promise<void> {
    // 既存の配列の後ろに複数の要素を追加する
    const saved = localStorage.getItem(sourceId);
    const array = saved ? JSON.parse(saved) : [];
    array.push(...list);
    localStorage.setItem(sourceId, JSON.stringify(array));
  }
}
