export class ReplaceTextUseCase {
    repository;
    replacer;
    constructor(repository, replacer) {
        this.repository = repository;
        this.replacer = replacer;
    }
    async run(sourceId) {
        const map = await this.repository.load(sourceId);
        await this.replacer.replace(map);
    }
}
