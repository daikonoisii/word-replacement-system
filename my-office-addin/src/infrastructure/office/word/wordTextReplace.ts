import type { Mapping } from 'src/domain/mapping';
import type { ITextReplacer } from 'src/repositories/textEditingInterfaces';

export class WordTextReplacer implements ITextReplacer {
  async replace(map: Mapping[]): Promise<void> {
    await Word.run(async (context) => {
      const body = context.document.body;
      for (const { findText, replaceText } of map) {
        // 文字列がアルファベットの時のみ単語一致機能を使用する
        const results = body.search(findText.toString(), {
          matchCase: true,
          matchWholeWord: findText.isAlphabetOnly(),
        });
        results.load('items');
        await context.sync();
        for (const range of results.items) {
          range.insertText(replaceText, Word.InsertLocation.replace);
        }
      }
      await context.sync();
    });
  }
}
