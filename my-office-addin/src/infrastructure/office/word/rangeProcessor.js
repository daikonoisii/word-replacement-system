export class ReplaceProcessor {
    async process(ranges, mapping, _context) {
        for (const r of ranges) {
            r.insertText(mapping.replaceText, Word.InsertLocation.replace);
        }
    }
}
export class ReplaceEnglishProcessor {
    async process(ranges, _mapping, _context) {
        for (const r of ranges) {
            const original = r.text;
            const normalizeFullwidthToAscii = (s) => s.replace(/[\uFF21-\uFF3A\uFF41-\uFF5A]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
            const toFullwidth = (s) => s
                .split('')
                .map((c) => {
                const code = c.charCodeAt(0);
                if ((code >= 0x41 && code <= 0x5a) ||
                    (code >= 0x61 && code <= 0x7a)) {
                    return String.fromCharCode(code + 0xfee0);
                }
                return c;
            })
                .join('');
            const toHalfwidth = (s) => s
                .split('')
                .map((c) => {
                const code = c.charCodeAt(0);
                if ((code >= 0xff21 && code <= 0xff3a) ||
                    (code >= 0xff41 && code <= 0xff5a)) {
                    return String.fromCharCode(code - 0xfee0);
                }
                return c;
            })
                .join('');
            const normalized = normalizeFullwidthToAscii(original);
            const letters = (normalized.match(/[A-Za-z]/g) || []).join('');
            let replacement = original;
            if (letters.length > 0) {
                const hasLower = /[a-z]/.test(letters);
                if (hasLower) {
                    // 1文字でも小文字が混ざっていれば半角に統一（大文字小文字は保持）
                    replacement = toHalfwidth(original);
                }
                else {
                    // 全て大文字なら全角に統一（大文字のまま）
                    replacement = toFullwidth(original);
                }
            }
            r.insertText(replacement, Word.InsertLocation.replace);
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
