export class FindText {
    value;
    constructor(value) {
        this.value = value;
    }
    toString() {
        return this.value;
    }
    isAlphabetOnly() {
        return /^[A-Za-z]+$/.test(this.value);
    }
}
