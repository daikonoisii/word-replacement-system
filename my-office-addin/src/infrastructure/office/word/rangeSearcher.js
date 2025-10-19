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
        // 半角と全角が混在したアルファベット文字列のみを検索
        return body.search('[A-Za-zＡ-Ｚａ-ｚ]*[A-Za-z][A-Za-zＡ-Ｚａ-ｚ]*[Ａ-Ｚａ-ｚ][A-Za-zＡ-Ｚａ-ｚ]*|[A-Za-zＡ-Ｚａ-ｚ]*[Ａ-Ｚａ-ｚ][A-Za-zＡ-Ｚａ-ｚ]*[A-Za-z][A-Za-zＡ-Ｚａ-ｚ]*', {
            matchCase: false,
            matchWholeWord: false,
            matchWildcards: true,
        });
    }
}
