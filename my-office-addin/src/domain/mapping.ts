import type { FindText } from 'src/domain/findText';
export type Mapping = {
  findText: FindText;
  replaceText: string;
};

export type UndoRecord = {
  findText: string;
  replaceText: string;
  ooxmlText: string;
};
