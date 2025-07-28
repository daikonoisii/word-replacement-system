export class FindText {
  public readonly value: string;
  constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  isAlphabetOnly(): boolean {
    return /^[A-Za-z]+$/.test(this.value);
  }
}
