import type { ITextReplacer } from 'src/repositories/textEditingInterfaces';
import type { IRangeProcessor } from 'src/repositories/rangeProcessInterface';
import {
  ReplaceProcessor,
  HighlightProcessor,
  ReplaceHighlightProcessor,
} from 'src/infrastructure/office/word/rangeProcessor';
import { Mapping, reverseMappings } from 'src/domain/mapping';
import { UNDO_STORAGE_KEY, HIGHLIGHT_COLOR } from 'src/constants/storage';
import { RangeSearchService } from 'src/infrastructure/office/word/rangeSearch';

export class WordTextReplacer implements ITextReplacer {
  private readonly service: RangeSearchService;
  constructor() {
    // 検索後に置換を実行するプロセッサ群を注入
    const processors: IRangeProcessor[] = [new ReplaceProcessor()];
    this.service = new RangeSearchService(processors);
  }
  async replace(map: Mapping[]): Promise<void> {
    await this.service.run(map);
  }
}

export class ReplaceAndHighlightReplacer implements ITextReplacer {
  private readonly service: RangeSearchService;
  private readonly color: string;
  constructor(color: string) {
    this.color = color;
    // 検索後に「置換→ハイライト」の順で実行するプロセッサ群を注入
    const processors: IRangeProcessor[] = [
      new ReplaceProcessor(),
      new HighlightProcessor(this.color),
    ];
    window.localStorage.removeItem(UNDO_STORAGE_KEY);
    this.service = new RangeSearchService(processors);
  }

  async replace(map: Mapping[]): Promise<void> {
    await this.service.run(map);
  }
}

export class WordTextUndoReplacer implements ITextReplacer {
  private readonly service: RangeSearchService;
  constructor() {
    // 検索後に置換を実行するプロセッサ群を注入
    const processors: IRangeProcessor[] = [
      new ReplaceHighlightProcessor(HIGHLIGHT_COLOR),
      new HighlightProcessor(),
    ];
    this.service = new RangeSearchService(processors);
  }
  async replace(map: Mapping[]): Promise<void> {
    const reversed = reverseMappings(map);
    await this.service.run(reversed);
  }
}
