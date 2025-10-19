export class RangeProcessorService {
    processors;
    searcher;
    constructor(processors, searcher) {
        this.processors = processors;
        this.searcher = searcher;
    }
    async run(map) {
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
