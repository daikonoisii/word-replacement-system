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
        // ハイライト条件の判定はEnglishHighlightProcessor側で行う
        return body.search('[A-Za-zＡ-Ｚａ-ｚ]{1,}', {
            matchCase: false,
            matchWholeWord: false,
            matchWildcards: true,
        });
    }
}
export class UrlSearcher {
    run(_mapping, body) {
        // http:// または https:// で始まるURL全体を検索（全角・半角両対応）
        return body.search(
        // ASCII + 全角（コロン・スラッシュ・ドット等の全角も許容）
        '[hｈ][tｔ][tｔ][pｐ][sｓ]{0,1}[:：][/／]{2}[A-Za-zＡ-Ｚａ-ｚ0-9０-９._．＿~～/:：/／?#？＃@＠%％&＆=＝+＋\\-]{1,}', {
            matchCase: false,
            matchWholeWord: false,
            matchWildcards: true,
        });
    }
}
