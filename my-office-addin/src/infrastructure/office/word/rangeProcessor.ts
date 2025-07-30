import type { Mapping } from 'src/domain/mapping';
import type { IRangeProcessor } from 'src/repositories/rangeProcessInterface';

export class ReplaceProcessor implements IRangeProcessor {
  async process(
    ranges: Word.Range[],
    mapping: Mapping,
    _context: Word.RequestContext
  ): Promise<void> {
    for (const r of ranges) {
      r.insertText(mapping.replaceText, Word.InsertLocation.replace);
    }
  }
}

export class ReplaceHighlightProcessor implements IRangeProcessor {
  private readonly color: string;
  constructor(color?: string) {
    this.color = color ?? 'yellow';
  }
  async process(
    ranges: Word.Range[],
    mapping: Mapping,
    context: Word.RequestContext
  ): Promise<void> {
    for (const range of ranges) {
      // ハイライトの色を読み込む
      range.font.load('highlightColor');
    }

    // ハイライトカラーの情報を取得
    await context.sync();

    for (const range of ranges) {
      if (range.font.highlightColor === this.color) {
        range.insertText(mapping.replaceText, Word.InsertLocation.replace);
      }
    }

    await context.sync();
  }
}

export class HighlightProcessor implements IRangeProcessor {
  private readonly color: string | null;
  constructor(color?: string) {
    this.color = color ?? null;
  }

  async process(
    ranges: Word.Range[],
    _mapping: Mapping,
    _context: Word.RequestContext
  ): Promise<void> {
    for (const r of ranges) {
      // @ts-ignore
      r.font.highlightColor = this.color;
    }
  }
}
