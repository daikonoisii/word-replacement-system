import { Mapping } from 'src/domain/mapping';
import { FindText } from 'src/domain/findText';
export class CsvMappingRepository {
    fileRegistry;
    decoder;
    constructor(fileRegistry, decoder) {
        this.fileRegistry = fileRegistry;
        this.decoder = decoder;
    }
    async load(id) {
        const file = this.fileRegistry.get(id);
        if (!file)
            throw new Error('File not found for sourceId: ' + id);
        // デコーダーでUnicodeで取得
        const text = await this.decoder.decode(file);
        return text
            .split(/\r?\n/)
            .filter((line) => line && !line.startsWith('#'))
            .map((line) => {
            const [findText, replaceText] = line.split(',');
            const mapping = new Mapping(new FindText(findText.trim()), replaceText.trim());
            return mapping;
        });
    }
    async save() {
        throw new Error('CSVファイルへの保存は未対応です');
    }
}
