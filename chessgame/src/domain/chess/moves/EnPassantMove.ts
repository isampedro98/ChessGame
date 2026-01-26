import { Move, type MoveResolution } from '../core/Move';
import type { Piece } from '../core/Piece';
import { PieceType } from '../core/Piece';
import { Board } from '../core/Board';
import { Position } from '../core/Position';

export class EnPassantMove extends Move {
  constructor(
    pieceId: string,
    from: Position,
    to: Position,
    private readonly capturedPosition: Position,
  ) {
    super(pieceId, from, to);
  }

  description(): string {
    return `${this.from.toAlgebraic()} x ${this.to.toAlgebraic()} (e.p.)`;
  }

  validate(board: Board): void {
    const pawn = this.getPieceToMove(board);
    if (pawn.type !== PieceType.Pawn) {
      throw new Error('En passant is only valid for pawns.');
    }
    if (!board.isEmpty(this.to)) {
      throw new Error('En passant destination must be empty.');
    }
    const captured = board.getPiece(this.capturedPosition);
    if (!captured || captured.type !== PieceType.Pawn) {
      throw new Error('En passant capture target is missing.');
    }
    if (captured.team === pawn.team) {
      throw new Error('En passant capture target is an allied pawn.');
    }
  }

  execute(board: Board): MoveResolution {
    this.validate(board);
    const captured = board.removePiece(this.capturedPosition);
    if (!captured) {
      throw new Error('En passant capture target is missing.');
    }
    board.movePiece(this.from, this.to);
    return { capturedPiece: captured };
  }

  revert(board: Board, resolution: MoveResolution): void {
    const pawn = board.getPiece(this.to);
    if (!pawn || pawn.id !== this.pieceId) {
      throw new Error('Unable to revert en passant: pawn not found.');
    }

    board.movePiece(this.to, this.from);

    if (resolution.capturedPiece) {
      resolution.capturedPiece.updatePosition(this.capturedPosition);
      board.placePiece(resolution.capturedPiece);
    }
  }

  private getPieceToMove(board: Board): Piece {
    const piece = board.getPiece(this.from);
    if (!piece) {
      throw new Error('There is no piece on the source square.');
    }
    if (piece.id !== this.pieceId) {
      throw new Error('Source piece does not match the move descriptor.');
    }
    return piece;
  }
}
