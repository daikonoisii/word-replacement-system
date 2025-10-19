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
    // 以下ケース以外のアルファベット文字列を全て検索
    // - 全て大文字かつ全角
    // - 全て半角かつ1文字以上の小文字が含まれる
    return body.search(
      '[A-Za-zＡ-Ｚａ-ｚ]*[A-Za-z][A-Za-zＡ-Ｚａ-ｚ]*[Ａ-Ｚａ-ｚ][A-Za-zＡ-Ｚａ-ｚ]*|[A-Za-zＡ-Ｚａ-ｚ]*[Ａ-Ｚａ-ｚ][A-Za-zＡ-Ｚａ-ｚ]*[A-Za-z][A-Za-zＡ-Ｚａ-ｚ]*|[Ａ-Ｚａ-ｚ]*[Ａ-Ｚ][Ａ-Ｚａ-ｚ]*[ａ-ｚ][Ａ-Ｚａ-ｚ]*|[Ａ-Ｚａ-ｚ]*[ａ-ｚ][Ａ-Ｚａ-ｚ]*[Ａ-Ｚ][Ａ-Ｚａ-ｚ]*|[A-Z]{1,}|[ａ-ｚ]{1,}',
      {
        matchCase: false,
        matchWholeWord: false,
        matchWildcards: true,
      }
    );
  }
}
