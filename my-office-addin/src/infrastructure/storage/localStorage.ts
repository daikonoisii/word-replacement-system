import type { Mapping } from 'src/domain/mapping';
import type { IMappingRepository } from 'src/repositories/mappingInterfaces';
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
        return {
          findText: new FindText(value),
          replaceText: entry.replaceText,
        };
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
