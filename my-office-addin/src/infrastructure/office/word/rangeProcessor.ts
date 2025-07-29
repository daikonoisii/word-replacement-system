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

export class HighlightProcessor implements IRangeProcessor {
  private readonly color: string;
  constructor(color?: string) {
    this.color = color ?? 'yellow';
  }

  async process(
    ranges: Word.Range[],
    _mapping: Mapping,
    _context: Word.RequestContext
  ): Promise<void> {
    for (const r of ranges) {
      r.font.highlightColor = this.color;
    }
  }
}
