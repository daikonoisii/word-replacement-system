import type { IMappingRepository } from 'src/repositories/mappingInterfaces';
import type { ITextReplacer } from 'src/repositories/textEditingInterfaces';
export class ReplaceTextUseCase {
  private repository: IMappingRepository;
  private replacer: ITextReplacer;

  constructor(repository: IMappingRepository, replacer: ITextReplacer) {
    this.repository = repository;
    this.replacer = replacer;
  }
  async run(sourceId: string): Promise<void> {
    const map = await this.repository.load(sourceId);
    await this.replacer.replace(map);
  }
}
