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
        // 連続したアルファベット(大文字・小文字)のブロックを検索
        // 全角英字（Ａ-Ｚ、ａ-ｚ）も含める
        return body.search('[A-Za-zＡ-Ｚａ-ｚ]{1,}', {
            matchCase: false,
            matchWholeWord: true,
            matchWildcards: true,
        });
    }
}
