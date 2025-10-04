import type { Move } from './Move';
import type { Board } from './Board';
import { Team } from './Team';
import { Position } from './Position';

export enum PieceType {
  King = 'KING',
  Queen = 'QUEEN',
  Rook = 'ROOK',
  Bishop = 'BISHOP',
  Knight = 'KNIGHT',
  Pawn = 'PAWN',
}

export abstract class Piece {
  constructor(
    readonly id: string,
    readonly team: Team,
    protected position: Position,
    readonly type: PieceType,
  ) {}

  getPosition(): Position {
    return this.position;
  }

  updatePosition(position: Position): void {
    this.position = position;
  }

  belongsTo(team: Team): boolean {
    return this.team === team;
  }

  isLocatedAt(position: Position): boolean {
    return this.position.equals(position);
  }

  abstract generateMoves(board: Board): Move[];
  abstract clone(): Piece;
}
