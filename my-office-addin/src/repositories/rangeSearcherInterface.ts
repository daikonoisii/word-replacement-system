import type { Mapping } from 'src/domain/mapping';
export interface IRangeSearcher {
  run(
    map: Mapping,
    body: Word.Body,
  ):  Word.RangeCollection;
}
