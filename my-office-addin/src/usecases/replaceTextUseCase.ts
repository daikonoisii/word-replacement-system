import type { Mapping } from 'src/domain/mapping';
import type { ITextReplacer } from 'src/repositories/textEditingInterfaces';

export class ReplaceTextUseCase {
  private replacer: ITextReplacer;

  constructor(replacer: ITextReplacer) {
    this.replacer = replacer;
  }
  async run(map: Mapping[]): Promise<void> {
    console.log(
      'run: ' +
        JSON.stringify(
          map.map((m) => ({
            findText: m.findText.value ?? 'miss',
            replaceText: m.replaceText,
          }))
        )
    );
    await this.replacer.replace(map);
  }
}
