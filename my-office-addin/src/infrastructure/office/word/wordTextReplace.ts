import type { ITextReplacer } from 'src/repositories/textEditingInterfaces';
import type { IRangeProcessor } from 'src/repositories/rangeProcessInterface';
import {
  ReplaceProcessor,
  HighlightProcessor,
  ReplaceHighlightProcessor,
} from 'src/infrastructure/office/word/rangeProcessor';
import { Mapping, reverseMappings } from 'src/domain/mapping';
import { UNDO_STORAGE_KEY, HIGHLIGHT_COLOR } from 'src/constants/storage';
import { RangeProcessorService } from 'src/infrastructure/office/word/rangeSearch';

export class WordTextReplacer implements ITextReplacer {
  private readonly service: RangeProcessorService;
  constructor() {
    // 検索後に置換を実行するプロセッサ群を注入
    const processors: IRangeProcessor[] = [new ReplaceProcessor()];
    this.service = new RangeProcessorService(processors);
  }
  async replace(map: Mapping[]): Promise<void> {
    await this.service.run(map);
  }
}

export class ReplaceAndHighlightReplacer implements ITextReplacer {
  private readonly service: RangeProcessorService;
  private readonly color: string;
  constructor(color: string) {
    this.color = color;
    // 検索後に「置換→ハイライト」の順で実行するプロセッサ群を注入
    const processors: IRangeProcessor[] = [
      new ReplaceProcessor(),
      new HighlightProcessor(this.color),
    ];
    try {
      // Office.contextが利用可能かチェック
      if (
        typeof Office !== 'undefined' &&
        Office.context &&
        Office.context.roamingSettings
      ) {
        Office.context.roamingSettings.remove(UNDO_STORAGE_KEY);
        Office.context.roamingSettings.saveAsync(() => {
          // 保存の完了は特に待たない（非同期で実行）
        });
      } else {
        // フォールバックとしてlocalStorageを使用
        localStorage.removeItem(UNDO_STORAGE_KEY);
      }
    } catch (error) {
      console.warn(
        'roamingSettings not available, falling back to localStorage:',
        error
      );
      localStorage.removeItem(UNDO_STORAGE_KEY);
    }
    this.service = new RangeProcessorService(processors);
  }

  async replace(map: Mapping[]): Promise<void> {
    await this.service.run(map);
  }
}

export class WordTextUndoReplacer implements ITextReplacer {
  private readonly service: RangeProcessorService;
  constructor() {
    // 検索後に置換を実行するプロセッサ群を注入
    const processors: IRangeProcessor[] = [
      new ReplaceHighlightProcessor(HIGHLIGHT_COLOR),
      new HighlightProcessor(null),
    ];
    this.service = new RangeProcessorService(processors);
  }
  async replace(map: Mapping[]): Promise<void> {
    const reversed = reverseMappings(map);
    await this.service.run(reversed);
  }
}

export class WordTextHighlightColorReplacer implements ITextReplacer {
  private readonly service: RangeProcessorService;
  constructor(beforeColor: string | null, afterColor: string | null) {
    const processors: IRangeProcessor[] = [
      new HighlightProcessor(afterColor, beforeColor),
    ];
    this.service = new RangeProcessorService(processors);
  }
  async replace(map: Mapping[]): Promise<void> {
    const reversed = reverseMappings(map);
    await this.service.run(reversed);
  }
}
