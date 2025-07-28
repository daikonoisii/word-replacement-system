import { FindText } from 'src/domain/findText';
export class CsvMappingRepository {
    fileRegistry;
    constructor(fileRegistry) {
        this.fileRegistry = fileRegistry;
    }
    async load(id) {
        const file = this.fileRegistry.get(id);
        if (!file)
            throw new Error('File not found for sourceId: ' + id);
        const text = await file.text();
        return text
            .split(/\r?\n/)
            .filter((line) => line && !line.startsWith('#'))
            .map((line) => {
            const [findText, replaceText] = line.split(',');
            return {
                findText: new FindText(findText.trim()),
                replaceText: replaceText.trim(),
            };
        });
    }
    async save() {
        throw new Error('CSVファイルへの保存は未対応です');
    }
}
