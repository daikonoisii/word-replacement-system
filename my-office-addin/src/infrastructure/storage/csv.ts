import type { Mapping } from 'src/domain/mapping';
import type { IMappingRepository } from 'src/repositories/mappingInterfaces';
import type { ITextDecoderService } from 'src/repositories/textDecoderInterface';
import { FindText } from 'src/domain/findText';

export class CsvMappingRepository implements IMappingRepository {
  private fileRegistry: Map<string, File | undefined>;
  private decoder: ITextDecoderService;
  constructor(
    fileRegistry: Map<string, File | undefined>,
    decoder: ITextDecoderService
  ) {
    this.fileRegistry = fileRegistry;
    this.decoder = decoder;
  }

  async load(id: string): Promise<Mapping[]> {
    const file = this.fileRegistry.get(id);
    if (!file) throw new Error('File not found for sourceId: ' + id);

    // デコーダーでUnicodeで取得
    const text = await this.decoder.decode(file);

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
