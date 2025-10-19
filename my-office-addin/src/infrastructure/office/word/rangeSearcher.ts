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

export class EnglishSearcher implements IRangeSearcher {
  run(_mapping: Mapping, body: Word.Body): Word.RangeCollection {
    // 半角と全角が混在したアルファベット文字列のみを検索
    return body.search('[A-Za-zＡ-Ｚａ-ｚ]*[A-Za-z][A-Za-zＡ-Ｚａ-ｚ]*[Ａ-Ｚａ-ｚ][A-Za-zＡ-Ｚａ-ｚ]*|[A-Za-zＡ-Ｚａ-ｚ]*[Ａ-Ｚａ-ｚ][A-Za-zＡ-Ｚａ-ｚ]*[A-Za-z][A-Za-zＡ-Ｚａ-ｚ]*', {
      matchCase: false,
      matchWholeWord: false,
      matchWildcards: true,
    });
  }
}
