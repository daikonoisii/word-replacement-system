import type { Mapping } from 'src/domain/mapping';
import type { IRangeProcessor } from 'src/repositories/rangeProcessInterface';

export class ReplaceProcessor implements IRangeProcessor {
  async process(
    ranges: Word.Range[],
    mapping: Mapping,
    _context: Word.RequestContext
  ): Promise<void> {
    for (const r of ranges) {
      r.insertText(mapping.replaceText, Word.InsertLocation.replace);
    }
  }
}

export class ReplaceEnglishProcessor implements IRangeProcessor {
  async process(
    ranges: Word.Range[],
    _mapping: Mapping,
    _context: Word.RequestContext
  ): Promise<void> {
    for (const r of ranges) {
      const original = r.text;

      const normalizeFullwidthToAscii = (s: string) =>
        s.replace(/[\uFF21-\uFF3A\uFF41-\uFF5A]/g, (c) =>
          String.fromCharCode(c.charCodeAt(0) - 0xfee0)
        );

      const toFullwidth = (s: string) =>
        s
          .split('')
          .map((c) => {
            const code = c.charCodeAt(0);
            if (
              (code >= 0x41 && code <= 0x5a) ||
              (code >= 0x61 && code <= 0x7a)
            ) {
              return String.fromCharCode(code + 0xfee0);
            }
            return c;
          })
          .join('');

      const toHalfwidth = (s: string) =>
        s
          .split('')
          .map((c) => {
            const code = c.charCodeAt(0);
            if (
              (code >= 0xff21 && code <= 0xff3a) ||
              (code >= 0xff41 && code <= 0xff5a)
            ) {
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
        } else {
          // 全て大文字なら全角に統一（大文字のまま）
          replacement = toFullwidth(original);
        }
      }

      r.insertText(replacement, Word.InsertLocation.replace);
    }
  }
}

export class ReplaceHighlightProcessor implements IRangeProcessor {
  private readonly color: string;
  constructor(color?: string) {
    this.color = color ?? 'yellow';
  }
  async process(
    ranges: Word.Range[],
    mapping: Mapping,
    context: Word.RequestContext
  ): Promise<void> {
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

export class HighlightProcessor implements IRangeProcessor {
  private readonly afterColor: string | null;
  private readonly beforeColor: string | null | undefined;

  constructor(
    afterColor: string | null,
    beforeColor?: string | null | undefined
  ) {
    this.afterColor = afterColor;
    this.beforeColor = beforeColor;
  }

  async process(
    ranges: Word.Range[],
    _mapping: Mapping,
    context: Word.RequestContext
  ): Promise<void> {
    for (const r of ranges) {
      // 全てのhighlightColorをload
      for (const r of ranges) {
        r.font.load('highlightColor');
      }
      await context.sync();

      // nullはハイライトされていない箇所のみを対象とする
      // undefinedは全ての色を対象
      if (
        r.font.highlightColor != this.beforeColor &&
        this.beforeColor != undefined
      ) {
        continue;
      }
      // @ts-ignore
      r.font.highlightColor = this.afterColor;
    }
  }
}
