export class ReplaceProcessor {
    async process(ranges, mapping, _context) {
        for (const r of ranges) {
            r.insertText(mapping.replaceText, Word.InsertLocation.replace);
        }
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
