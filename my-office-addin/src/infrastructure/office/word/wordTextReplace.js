import { ReplaceProcessor, ReplaceEnglishProcessor, HighlightProcessor, ReplaceHighlightProcessor, EnglishHighlightProcessor, } from 'src/infrastructure/office/word/rangeProcessor';
import { Mapping, reverseMappings } from 'src/domain/mapping';
import { UNDO_STORAGE_KEY, HIGHLIGHT_COLOR } from 'src/constants/storage';
import { RangeProcessorService } from 'src/infrastructure/office/word/rangeProcessorService';
import { MapSearcher, EnglishSearcher, } from 'src/infrastructure/office/word/rangeSearcher';
function createProcessorService(processors, searcher) {
    try {
        // Office.contextが利用可能かチェック
        if (typeof Office !== 'undefined' &&
            Office.context &&
            Office.context.roamingSettings) {
            Office.context.roamingSettings.remove(UNDO_STORAGE_KEY);
            Office.context.roamingSettings.saveAsync(() => {
                // 保存の完了は特に待たない（非同期で実行）
            });
        }
        else {
            // フォールバックとしてlocalStorageを使用
            localStorage.removeItem(UNDO_STORAGE_KEY);
        }
    }
    catch (error) {
        console.warn('roamingSettings not available, falling back to localStorage:', error);
        localStorage.removeItem(UNDO_STORAGE_KEY);
    }
    return new RangeProcessorService(processors, searcher);
}
export class WordTextReplacer {
    service;
    constructor() {
        // 検索後に置換を実行するプロセッサ群を注入
        const processors = [new ReplaceProcessor()];
        const searcher = new MapSearcher();
        this.service = new RangeProcessorService(processors, searcher);
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
        const searcher = new MapSearcher();
        this.service = createProcessorService(processors, searcher);
    }
    async replace(map) {
        await this.service.run(map);
    }
}
export class ReplaceEnglishAndHighlightReplacer {
    service;
    color;
    constructor(color) {
        this.color = color;
        // 検索後に「ハイライト判定→置換」の順で実行するプロセッサ群を注入
        // 重要: ハイライト判定を先に行い、元のテキストで条件チェックする
        const processors = [
            new EnglishHighlightProcessor(this.color),
            new ReplaceEnglishProcessor(),
        ];
        const searcher = new EnglishSearcher();
        this.service = createProcessorService(processors, searcher);
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
        const searcher = new MapSearcher();
        this.service = new RangeProcessorService(processors, searcher);
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
        const searcher = new MapSearcher();
        this.service = new RangeProcessorService(processors, searcher);
    }
    async replace(map) {
        const reversed = reverseMappings(map);
        await this.service.run(reversed);
    }
}
