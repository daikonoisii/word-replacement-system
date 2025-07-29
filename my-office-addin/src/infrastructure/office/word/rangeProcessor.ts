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
