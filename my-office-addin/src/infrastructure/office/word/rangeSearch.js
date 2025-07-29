export class RangeSearchService {
    processors;
    constructor(processors) {
        this.processors = processors;
    }
    async replace(map) {
        await Word.run(async (context) => {
            const body = context.document.body;
            for (const mapping of map) {
                const results = body.search(mapping.findText.toString(), {
                    matchCase: true,
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
