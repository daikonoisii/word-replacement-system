import type { Mapping } from 'src/domain/mapping';
import type { IRangeSearcher } from 'src/repositories/rangeSearcherInterface';

export class MapSearcher implements IRangeSearcher {
  run(mapping: Mapping, body: Word.Body): Word.RangeCollection {
    return body.search(mapping.findText.toString(), {
      matchCase: true,
      matchWholeWord: false,
    });
  }
}
