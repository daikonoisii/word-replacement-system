import type { Mapping } from 'src/domain/mapping';

export interface ITextReplacer {
  replace(mapping: Mapping[]): Promise<void>;
}
