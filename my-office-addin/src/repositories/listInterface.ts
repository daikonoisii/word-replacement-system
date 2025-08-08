export interface IListRepository {
  load(sourceId: string): Promise<string[]>;
  add(sourceId: string, list: string[]): Promise<void>;
}
