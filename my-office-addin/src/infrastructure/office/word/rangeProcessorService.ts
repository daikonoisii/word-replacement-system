import type { Mapping } from 'src/domain/mapping';
import type { IRangeProcessor } from 'src/repositories/rangeProcessInterface';
import type { IRangeSearcher } from 'src/repositories/rangeSearcherInterface';

export class RangeProcessorService {
  private readonly processors: IRangeProcessor[];
  private readonly searcher: IRangeSearcher;
  constructor(
    processors: IRangeProcessor[],
    searcher: IRangeSearcher,
  ) {
    this.processors = processors;
    this.searcher = searcher;
  }

  async run(map: Mapping[]): Promise<void> {
    await Word.run(async (context) => {
      const body = context.document.body;

      for (const mapping of map) {
        const results = this.searcher.run(mapping, body);
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
