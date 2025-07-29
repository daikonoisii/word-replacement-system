import type { Mapping } from 'src/domain/mapping';
import type { ITextReplacer } from 'src/repositories/textEditingInterfaces';
import type { IRangeProcessor } from 'src/repositories/rangeProcessInterface';
import { ReplaceProcessor } from 'src/infrastructure/office/word/rangeProcessor';
import { RangeSearchService } from 'src/infrastructure/office/word/rangeSearch';

export class WordTextReplacer implements ITextReplacer {
  private readonly service: RangeSearchService;
  constructor() {
    // 検索後に置換を実行するプロセッサ群を注入
    const processors: IRangeProcessor[] = [new ReplaceProcessor()];
    this.service = new RangeSearchService(processors);
  }
  async replace(map: Mapping[]): Promise<void> {
    await this.service.replace(map);
  }
}
