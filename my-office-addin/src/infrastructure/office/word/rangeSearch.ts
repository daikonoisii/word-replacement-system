import type { Mapping } from 'src/domain/mapping';
import type { IRangeProcessor } from 'src/repositories/rangeProcessInterface';

export class RangeProcessorService {
  private readonly processors: IRangeProcessor[];
  constructor(processors: IRangeProcessor[]) {
    this.processors = processors;
  }

  async run(map: Mapping[]): Promise<void> {
    await Word.run(async (context) => {
      const body = context.document.body;

      for (const mapping of map) {
        const results = body.search(mapping.findText.toString(), {
          matchCase: true,
          matchWholeWord: false,
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
