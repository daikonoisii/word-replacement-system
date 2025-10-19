export class MapSearcher {
    run(mapping, body) {
        return body.search(mapping.findText.toString(), {
            matchCase: true,
            matchWholeWord: false,
        });
    }
}
export class EnglishSearcher {
    run(_mapping, body) {
        // 以下ケース以外のアルファベット文字列を全て検索
        // - 全て大文字かつ全角
        // - 全て半角かつ1文字以上の小文字が含まれる
        return body.search('[A-Za-zＡ-Ｚａ-ｚ]*[A-Za-z][A-Za-zＡ-Ｚａ-ｚ]*[Ａ-Ｚａ-ｚ][A-Za-zＡ-Ｚａ-ｚ]*|[A-Za-zＡ-Ｚａ-ｚ]*[Ａ-Ｚａ-ｚ][A-Za-zＡ-Ｚａ-ｚ]*[A-Za-z][A-Za-zＡ-Ｚａ-ｚ]*|[Ａ-Ｚａ-ｚ]*[Ａ-Ｚ][Ａ-Ｚａ-ｚ]*[ａ-ｚ][Ａ-Ｚａ-ｚ]*|[Ａ-Ｚａ-ｚ]*[ａ-ｚ][Ａ-Ｚａ-ｚ]*[Ａ-Ｚ][Ａ-Ｚａ-ｚ]*|[A-Z]{1,}|[ａ-ｚ]{1,}', {
            matchCase: false,
            matchWholeWord: false,
            matchWildcards: true,
        });
    }
}
