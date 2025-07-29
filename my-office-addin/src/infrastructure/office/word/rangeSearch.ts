import type { Mapping } from 'src/domain/mapping';
import type { IRangeProcessor } from 'src/repositories/rangeProcessInterface';
import type { ITextReplacer } from 'src/repositories/textEditingInterfaces';

export class RangeSearchService implements ITextReplacer {
  private readonly processors: IRangeProcessor[];
  constructor(processors: IRangeProcessor[]) {
    this.processors = processors;
  }

  async replace(map: Mapping[]): Promise<void> {
    await Word.run(async (context) => {
      const body = context.document.body;

      for (const mapping of map) {
        const results = body.search(mapping.findText.toString(), {
          matchCase: false,
          matchWholeWord: mapping.findText.isAlphabetOnly(),
        });
        results.load('items');
        await context.sync();

        for (const processor of this.processors) {
          await processor.process(results.items, mapping, context);
        }
      }

      await context.sync();
    });
  }
}
