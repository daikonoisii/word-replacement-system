import type { Mapping } from 'src/domain/mapping';
import type { IMappingRepository } from 'src/repositories/mappingInterfaces';
import { FindText } from 'src/domain/findText';

export class CsvMappingRepository implements IMappingRepository {
  private fileRegistry: Map<string, File | undefined>;
  constructor(fileRegistry: Map<string, File | undefined>) {
    this.fileRegistry = fileRegistry;
  }

  async load(id: string): Promise<Mapping[]> {
    const file = this.fileRegistry.get(id);
    if (!file) throw new Error('File not found for sourceId: ' + id);
    const text = await file.text();
    return text
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const [findText, replaceText] = line.split(',');
        return {
          findText: new FindText(findText.trim()),
          replaceText: replaceText.trim(),
        };
      });
  }

  async save(): Promise<void> {
    throw new Error('CSVファイルへの保存は未対応です');
  }
}
