export class ReplaceTextUseCase {
    replacer;
    constructor(replacer) {
        this.replacer = replacer;
    }
    async run(map) {
        await this.replacer.replace(map);
    }
}
