export class Position {
  private static readonly lowestIndex = 0;
  private static readonly highestIndex = 7;

  constructor(readonly row: number, readonly column: number) {
    Position.assertInRange(row);
    Position.assertInRange(column);
  }

  static fromCoordinates(row: number, column: number): Position {
    return new Position(row, column);
  }

  static fromAlgebraic(notation: string): Position {
    if (!/^([a-h][1-8])$/i.test(notation)) {
      throw new Error('Invalid algebraic notation: ' + notation);
    }

    const column = notation[0].toLowerCase().charCodeAt(0) - 97;
    const row = Number.parseInt(notation[1], 10) - 1;
    return new Position(row, column);
  }

  shift(rowDelta: number, columnDelta: number): Position | null {
    const nextRow = this.row + rowDelta;
    const nextColumn = this.column + columnDelta;

    if (!Position.inBounds(nextRow) || !Position.inBounds(nextColumn)) {
      return null;
    }

    return new Position(nextRow, nextColumn);
  }

  equals(other: Position): boolean {
    return this.row === other.row && this.column === other.column;
  }

  toKey(): string {
    return `${this.row},${this.column}`;
  }

  toAlgebraic(): string {
    const fileLetter = String.fromCharCode(97 + this.column);
    return `${fileLetter}${this.row + 1}`;
  }

  private static assertInRange(value: number) {
    if (!Position.inBounds(value)) {
      throw new Error('Position out of bounds: ' + value);
    }
  }

  private static inBounds(value: number): boolean {
    return Number.isInteger(value) && value >= Position.lowestIndex && value <= Position.highestIndex;
  }
}
