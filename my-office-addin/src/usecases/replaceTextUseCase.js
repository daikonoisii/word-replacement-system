export class ReplaceTextUseCase {
    replacer;
    constructor(replacer) {
        this.replacer = replacer;
    }
    async run(map) {
        console.log('run: ' +
            JSON.stringify(map.map((m) => ({
                findText: m.findText.value ?? 'miss',
                replaceText: m.replaceText,
            }))));
        await this.replacer.replace(map);
    }
}
