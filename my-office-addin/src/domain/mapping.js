import { FindText } from 'src/domain/findText';
export class Mapping {
    findText;
    replaceText;
    constructor(findText, replaceText) {
        this.findText = findText;
        this.replaceText = replaceText;
    }
    reverse() {
        return new Mapping(new FindText(this.replaceText), this.findText.value);
    }
}
export function reverseMappings(map) {
    return map.map((m) => m.reverse());
}
