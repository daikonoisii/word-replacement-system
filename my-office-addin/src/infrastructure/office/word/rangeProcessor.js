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
            console.log(`range.text="${range.text}", highlightColor="${range.font.highlightColor}", expected="${this.color}"`);
            if (range.font.highlightColor === this.color) {
                range.insertText(mapping.replaceText, Word.InsertLocation.replace);
            }
        }
        await context.sync();
    }
}
export class HighlightProcessor {
    color;
    constructor(color) {
        this.color = color ?? 'yellow';
    }
    async process(ranges, _mapping, _context) {
        for (const r of ranges) {
            r.font.highlightColor = this.color;
        }
    }
}
