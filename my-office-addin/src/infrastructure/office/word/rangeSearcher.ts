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
    // 連続したアルファベット(大文字・小文字)のブロックを検索
    // 全角英字（Ａ-Ｚ、ａ-ｚ）も含める
    // ハイライト条件の判定はEnglishHighlightProcessor側で行う
    return body.search('[A-Za-zＡ-Ｚａ-ｚ]{1,}', {
      matchCase: false,
      matchWholeWord: false,
      matchWildcards: true,
    });
  }
}

export class UrlSearcher implements IRangeSearcher {
  run(_mapping: Mapping, body: Word.Body): Word.RangeCollection {
    // http:// または https:// で始まるURLを検索
    return body.search('[hｈ][tｔ][tｔ][pｐ][sｓ]?[:\uff1a][/／][/／][!-~\uff01-\uff5e]{1,}', {
      matchCase: false,
      matchWholeWord: false,
      matchWildcards: true,
    });
  }
}
