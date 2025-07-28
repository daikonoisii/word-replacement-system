import type { Mapping } from 'src/domain/mapping';

export interface IMappingRepository {
  load(sourceId: string): Promise<Mapping[]>;
  save(sourceId: string, mapping: Mapping[]): Promise<void>;
}

export interface IMappingSelector {
  listSources(): Promise<string[]>;
  getDefault(): string;
}
