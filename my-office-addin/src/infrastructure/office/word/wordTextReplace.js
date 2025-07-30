import { ReplaceProcessor, HighlightProcessor, ReplaceHighlightProcessor, } from 'src/infrastructure/office/word/rangeProcessor';
import { FindText } from 'src/domain/findText';
import { UNDO_STORAGE_KEY, HIGHLIGHT_COLOR } from 'src/constants/storage';
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
        window.localStorage.removeItem(UNDO_STORAGE_KEY);
        this.service = new RangeSearchService(processors);
    }
    async replace(map) {
        await this.service.replace(map);
    }
}
export class WordTextUndoReplacer {
    service;
    constructor() {
        // 検索後に置換を実行するプロセッサ群を注入
        const processors = [
            new ReplaceHighlightProcessor(HIGHLIGHT_COLOR),
            new HighlightProcessor(),
        ];
        this.service = new RangeSearchService(processors);
    }
    async replace(map) {
        const reversed = map.map(({ findText, replaceText }) => ({
            findText: new FindText(replaceText),
            replaceText: findText.value,
        }));
        await this.service.replace(reversed);
    }
}
