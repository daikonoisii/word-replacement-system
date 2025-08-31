export class ReplaceProcessor {
    async process(ranges, mapping, _context) {
        for (const r of ranges) {
            r.insertText(mapping.replaceText, Word.InsertLocation.replace);
        }
    }
}
export class ReplaceHighlightProcessor {
    color;
    constructor(color) {
        this.color = color ?? 'yellow';
    }
    async process(ranges, mapping, context) {
        for (const range of ranges) {
            // ハイライトの色を読み込む
            range.font.load('highlightColor');
        }
        // ハイライトカラーの情報を取得
        await context.sync();
        for (const range of ranges) {
            if (range.font.highlightColor === this.color) {
                range.insertText(mapping.replaceText, Word.InsertLocation.replace);
            }
        }
        await context.sync();
    }
}
export class HighlightProcessor {
    afterColor;
    beforeColor;
    constructor(afterColor, beforeColor) {
        this.afterColor = afterColor;
        this.beforeColor = beforeColor;
    }
    async process(ranges, _mapping, context) {
        for (const r of ranges) {
            // 全てのhighlightColorをload
            for (const r of ranges) {
                r.font.load('highlightColor');
            }
            await context.sync();
            // nullはハイライトされていない箇所のみを対象とする
            // undefinedは全ての色を対象
            if (r.font.highlightColor != this.beforeColor &&
                this.beforeColor != undefined) {
                continue;
            }
            // @ts-ignore
            r.font.highlightColor = this.afterColor;
        }
    }
}
