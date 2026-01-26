import { Move, type MoveResolution } from '../core/Move';
import type { Piece } from '../core/Piece';
import { PieceType } from '../core/Piece';
import { Board } from '../core/Board';
import { Position } from '../core/Position';

export class CastleMove extends Move {
  constructor(
    pieceId: string,
    from: Position,
    to: Position,
    private readonly rookId: string,
    private readonly rookFrom: Position,
    private readonly rookTo: Position,
  ) {
    super(pieceId, from, to);
  }

  description(): string {
    return this.to.column > this.from.column ? 'O-O' : 'O-O-O';
  }

  validate(board: Board): void {
    const king = this.getPieceToMove(board);
    if (king.type !== PieceType.King) {
      throw new Error('Castling move requires a king.');
    }

    const rook = board.getPiece(this.rookFrom);
    if (!rook || rook.id !== this.rookId || rook.type !== PieceType.Rook) {
      throw new Error('Castling rook is missing or invalid.');
    }
    if (!rook.belongsTo(king.team)) {
      throw new Error('Castling rook belongs to the opposing team.');
    }

    if (!board.isEmpty(this.to) || !board.isEmpty(this.rookTo)) {
      throw new Error('Castling destination is not empty.');
    }

    const row = this.from.row;
    const start = Math.min(this.from.column, this.rookFrom.column) + 1;
    const end = Math.max(this.from.column, this.rookFrom.column) - 1;
    for (let col = start; col <= end; col += 1) {
      const position = Position.fromCoordinates(row, col);
      if (!board.isEmpty(position)) {
        throw new Error('Castling path is blocked.');
      }
    }
  }

  execute(board: Board): MoveResolution {
    this.validate(board);
    board.movePiece(this.from, this.to);
    board.movePiece(this.rookFrom, this.rookTo);
    return {};
  }

  revert(board: Board): void {
    const king = board.getPiece(this.to);
    if (!king || king.id !== this.pieceId) {
      throw new Error('Unable to revert castling: king not found.');
    }
    const rook = board.getPiece(this.rookTo);
    if (!rook || rook.id !== this.rookId) {
      throw new Error('Unable to revert castling: rook not found.');
    }

    board.movePiece(this.to, this.from);
    board.movePiece(this.rookTo, this.rookFrom);
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
