import { FindText } from 'src/domain/findText';
export class Mapping {
  public findText: FindText;
  public replaceText: string;
  constructor(findText: FindText, replaceText: string) {
    this.findText = findText;
    this.replaceText = replaceText;
  }

  reverse(): Mapping {
    return new Mapping(new FindText(this.replaceText), this.findText.value);
  }
}

export type UndoRecord = {
  findText: string;
  replaceText: string;
  ooxmlText: string;
};

export function reverseMappings(map: Mapping[]): Mapping[] {
  return map.map((m) => m.reverse());
}
