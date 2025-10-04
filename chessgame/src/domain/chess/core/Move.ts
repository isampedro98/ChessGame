import type { Piece } from './Piece';
import { Position } from './Position';
import type { Board } from './Board';

export interface MoveResolution {
  capturedPiece?: Piece;
  isPromotion?: boolean;
  promotedPiece?: Piece;
}

export abstract class Move {
  constructor(
    readonly pieceId: string,
    readonly from: Position,
    readonly to: Position,
  ) {}

  description(): string {
    return `${this.from.toAlgebraic()} -> ${this.to.toAlgebraic()}`;
  }

  abstract validate(board: Board): void;
  abstract execute(board: Board): MoveResolution;
  abstract revert(board: Board, resolution: MoveResolution): void;
}
