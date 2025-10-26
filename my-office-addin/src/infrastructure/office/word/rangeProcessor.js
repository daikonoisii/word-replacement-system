export class ReplaceProcessor {
    async process(ranges, mapping, _context) {
        for (const r of ranges) {
            r.insertText(mapping.replaceText, Word.InsertLocation.replace);
        }
    }
}
export class ReplaceEnglishProcessor {
    async process(ranges, _mapping, _context) {
        console.log('=== ReplaceEnglishProcessor: 処理開始 ===');
        console.log('処理対象の範囲数:', ranges.length);
        for (const r of ranges) {
            const original = r.text;
            // デバッグログ: 範囲のテキスト内容を確認
            console.log('--- 範囲の処理開始 ---');
            console.log('Range text (JSON):', JSON.stringify(original));
            console.log('Range text (length):', original.length);
            console.log('Range text (char codes):', Array.from(original)
                .map((c) => `${c}(${c.charCodeAt(0).toString(16)})`)
                .join(' '));
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
                    console.log('判定: 小文字を含む → 半角に統一');
                }
                else {
                    // 全て大文字なら全角に統一（大文字のまま）
                    replacement = toFullwidth(original);
                    console.log('判定: 全て大文字 → 全角に統一');
                }
            }
            console.log('Original:', JSON.stringify(original));
            console.log('Replacement:', JSON.stringify(replacement));
            console.log('変換前後が同じ?:', original === replacement);
            r.insertText(replacement, Word.InsertLocation.replace);
            console.log('--- 範囲の処理完了 ---');
        }
        console.log('=== ReplaceEnglishProcessor: 処理完了 ===');
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
            // @ts-expect-error Word API の型定義が不完全なため無視
            r.font.highlightColor = this.afterColor;
        }
    }
}
export class EnglishHighlightProcessor {
    color;
    constructor(color) {
        this.color = color;
    }
    async process(ranges, _mapping, context) {
        // テキストを読み込む
        for (const r of ranges) {
            r.load('text');
        }
        await context.sync();
        for (const r of ranges) {
            const original = r.text;
            // 半角アルファベットが含まれているか
            const hasHalfwidth = /[A-Za-z]/.test(original);
            // 全角アルファベットが含まれているか
            const hasFullwidth = /[Ａ-Ｚａ-ｚ]/.test(original);
            // ハイライト条件をチェック
            let shouldHighlight = false;
            if (hasHalfwidth && hasFullwidth) {
                // 条件1: 半角と全角が混在
                shouldHighlight = true;
            }
            else if (hasFullwidth && !hasHalfwidth) {
                // 全角のみの場合
                const hasUppercase = /[Ａ-Ｚ]/.test(original);
                const hasLowercase = /[ａ-ｚ]/.test(original);
                if (hasUppercase && hasLowercase) {
                    // 条件2: 小文字と大文字が混在していて、全て全角
                    shouldHighlight = true;
                }
                else if (hasLowercase && !hasUppercase) {
                    // 条件4: 全て小文字の全角
                    shouldHighlight = true;
                }
            }
            else if (hasHalfwidth && !hasFullwidth) {
                // 半角のみの場合
                const hasUppercase = /[A-Z]/.test(original);
                const hasLowercase = /[a-z]/.test(original);
                if (hasUppercase && !hasLowercase) {
                    // 条件3: 全て大文字の半角
                    shouldHighlight = true;
                }
            }
            if (shouldHighlight) {
                // @ts-expect-error Word API の型定義が不完全なため無視
                r.font.highlightColor = this.color;
            }
        }
    }
}
