import type { Mapping } from 'src/domain/mapping';
export interface IRangeProcessor {
  process(
    ranges: Word.Range[],
    mapping: Mapping,
    context: Word.RequestContext
  ): Promise<void>;
}
