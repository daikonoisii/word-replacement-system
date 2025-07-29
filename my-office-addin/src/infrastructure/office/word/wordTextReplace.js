import { ReplaceProcessor, HighlightProcessor, } from 'src/infrastructure/office/word/rangeProcessor';
import { RangeSearchService } from 'src/infrastructure/office/word/rangeSearch';
export class WordTextReplacer {
    service;
    constructor() {
        // 検索後に置換を実行するプロセッサ群を注入
        const processors = [new ReplaceProcessor()];
        this.service = new RangeSearchService(processors);
    }
    async replace(map) {
        await this.service.replace(map);
    }
}
export class ReplaceAndHighlightReplacer {
    service;
    color;
    constructor(color) {
        this.color = color;
        // 検索後に「置換→ハイライト」の順で実行するプロセッサ群を注入
        const processors = [
            new ReplaceProcessor(),
            new HighlightProcessor(this.color),
        ];
        this.service = new RangeSearchService(processors);
    }
    async replace(map) {
        await this.service.replace(map);
    }
}
