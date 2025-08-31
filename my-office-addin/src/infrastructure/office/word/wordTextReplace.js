import { ReplaceProcessor, HighlightProcessor, ReplaceHighlightProcessor, } from 'src/infrastructure/office/word/rangeProcessor';
import { Mapping, reverseMappings } from 'src/domain/mapping';
import { UNDO_STORAGE_KEY, HIGHLIGHT_COLOR } from 'src/constants/storage';
import { RangeProcessorService } from 'src/infrastructure/office/word/rangeSearch';
export class WordTextReplacer {
    service;
    constructor() {
        // 検索後に置換を実行するプロセッサ群を注入
        const processors = [new ReplaceProcessor()];
        this.service = new RangeProcessorService(processors);
    }
    async replace(map) {
        await this.service.run(map);
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
        window.localStorage.removeItem(UNDO_STORAGE_KEY);
        this.service = new RangeProcessorService(processors);
    }
    async replace(map) {
        await this.service.run(map);
    }
}
export class WordTextUndoReplacer {
    service;
    constructor() {
        // 検索後に置換を実行するプロセッサ群を注入
        const processors = [
            new ReplaceHighlightProcessor(HIGHLIGHT_COLOR),
            new HighlightProcessor(null),
        ];
        this.service = new RangeProcessorService(processors);
    }
    async replace(map) {
        const reversed = reverseMappings(map);
        await this.service.run(reversed);
    }
}
export class WordTextHighlightColorReplacer {
    service;
    constructor(beforeColor, afterColor) {
        const processors = [
            new HighlightProcessor(afterColor, beforeColor),
        ];
        this.service = new RangeProcessorService(processors);
    }
    async replace(map) {
        const reversed = reverseMappings(map);
        await this.service.run(reversed);
    }
}
