import { Team } from './Team';
import { Piece } from './Piece';
import { Position } from './Position';

export class Board {
  private readonly squares = new Map<string, Piece>();

  constructor(pieces: Piece[] = []) {
    pieces.forEach((piece) => this.placePiece(piece));
  }

  getPiece(position: Position): Piece | undefined {
    return this.squares.get(position.toKey());
  }

  getPieceById(id: string): Piece | undefined {
    for (const piece of this.squares.values()) {
      if (piece.id === id) {
        return piece;
      }
    }
    return undefined;
  }

  getPiecesByTeam(team: Team): Piece[] {
    return Array.from(this.squares.values()).filter((piece) => piece.belongsTo(team));
  }

  placePiece(piece: Piece): void {
    const position = piece.getPosition();
    this.squares.set(position.toKey(), piece);
  }

  removePiece(position: Position): Piece | undefined {
    const key = position.toKey();
    const piece = this.squares.get(key);
    if (piece) {
      this.squares.delete(key);
    }
    return piece;
  }

  movePiece(from: Position, to: Position): Piece | undefined {
    const piece = this.getPiece(from);
    if (!piece) {
      throw new Error('There is no piece on the source square.');
    }

    const capturedPiece = this.removePiece(to);
    this.squares.delete(from.toKey());
    piece.updatePosition(to);
    this.squares.set(to.toKey(), piece);
    return capturedPiece;
  }

  clone(): Board {
    const pieces = Array.from(this.squares.values()).map((piece) => piece.clone());
    return new Board(pieces);
  }

  isEmpty(position: Position): boolean {
    return !this.squares.has(position.toKey());
  }

  allPieces(): Piece[] {
    return Array.from(this.squares.values());
  }
}
