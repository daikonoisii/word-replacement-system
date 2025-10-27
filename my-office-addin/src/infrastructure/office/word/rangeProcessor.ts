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

export class EnglishHighlightProcessor implements IRangeProcessor {
  private readonly color: string | null;

  constructor(color: string | null) {
    this.color = color;
  }

  async process(
    ranges: Word.Range[],
    _mapping: Mapping,
    context: Word.RequestContext
  ): Promise<void> {
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
      } else if (hasFullwidth && !hasHalfwidth) {
        // 全角のみの場合
        const hasUppercase = /[Ａ-Ｚ]/.test(original);
        const hasLowercase = /[ａ-ｚ]/.test(original);

        if (hasUppercase && hasLowercase) {
          // 条件2: 小文字と大文字が混在していて、全て全角
          shouldHighlight = true;
        } else if (hasLowercase && !hasUppercase) {
          // 条件4: 全て小文字の全角
          shouldHighlight = true;
        }
      } else if (hasHalfwidth && !hasFullwidth) {
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

export class UrlHighlightProcessor implements IRangeProcessor {
  private readonly color: string | null;

  constructor(color: string | null) {
    this.color = color;
  }

  async process(
    ranges: Word.Range[],
    _mapping: Mapping,
    context: Word.RequestContext
  ): Promise<void> {
    // テキストを読み込む
    for (const r of ranges) {
      r.load('text');
    }
    await context.sync();

    for (const r of ranges) {
      const original = r.text;

      // 全角文字が含まれているかチェック
      const hasFullwidth = /[\uff01-\uff5e]/.test(original);

      if (hasFullwidth) {
        // 全角文字が含まれている場合はハイライト
        // @ts-expect-error Word API の型定義が不完全なため無視
        r.font.highlightColor = this.color;
      }
    }
  }
}

export class ReplaceUrlProcessor implements IRangeProcessor {
  async process(
    ranges: Word.Range[],
    _mapping: Mapping,
    _context: Word.RequestContext
  ): Promise<void> {
    for (const r of ranges) {
      const original = r.text;

      // 全角文字を半角に変換
      const toHalfwidth = (s: string): string => {
        return s.replace(/[\uff01-\uff5e]/g, (c) => {
          return String.fromCharCode(c.charCodeAt(0) - 0xfee0);
        });
      };

      const replacement = toHalfwidth(original);

      // 変更があった場合のみ置換
      if (replacement !== original) {
        r.insertText(replacement, Word.InsertLocation.replace);
      }
    }
  }
}
