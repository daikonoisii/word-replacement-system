import type { Mapping } from 'src/domain/mapping';
import type { IMappingRepository } from 'src/repositories/mappingInterfaces';

export class LocalStorageMappingRepository implements IMappingRepository {
  async load(sourceId: string): Promise<Mapping[]> {
    const map = localStorage.getItem(sourceId);
    if (map) {
      try {
        return JSON.parse(map);
      } catch (e) {
        console.error('localStorage からのマッピング読み込みに失敗:', e);
      }
    }
    // 保存データがないかパース失敗時は空配列を返す
    return [];
  }
  async save(sourceId: string, mapping: Mapping[]): Promise<void> {
    localStorage.setItem(sourceId, JSON.stringify(mapping));
  }
}
