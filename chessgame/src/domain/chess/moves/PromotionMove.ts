import { Move, type MoveResolution } from '../core/Move';
import type { Piece } from '../core/Piece';
import { PieceType } from '../core/Piece';
import { Board } from '../core/Board';
import { Position } from '../core/Position';
import { Team } from '../core/Team';
import { Pawn, Queen, Rook, Bishop, Knight } from '../pieces';

export class PromotionMove extends Move {
  constructor(
    pieceId: string,
    from: Position,
    to: Position,
    private readonly promoteTo: PieceType = PieceType.Queen,
  ) {
    super(pieceId, from, to);
  }

  description(): string {
    return `${this.from.toAlgebraic()} -> ${this.to.toAlgebraic()} = ${this.promoteTo}`;
  }

  validate(board: Board): void {
    const pawn = this.getPieceToMove(board);
    if (pawn.type !== PieceType.Pawn) {
      throw new Error('Promotion move requires a pawn.');
    }

    const promotionRow = pawn.team === Team.White ? 7 : 0;
    if (this.to.row !== promotionRow) {
      throw new Error('Promotion destination is not on the final rank.');
    }

    const destinationPiece = board.getPiece(this.to);
    if (destinationPiece && destinationPiece.belongsTo(pawn.team)) {
      throw new Error('Destination square is occupied by an allied piece.');
    }
  }

  execute(board: Board): MoveResolution {
    this.validate(board);
    const pawn = this.getPieceToMove(board);
    const captured = board.movePiece(this.from, this.to);

    const promoted = this.createPromotedPiece(pawn.team, this.to);
    board.removePiece(this.to);
    board.placePiece(promoted);

    return {
      capturedPiece: captured ?? undefined,
      isPromotion: true,
      promotedPiece: promoted,
    };
  }

  revert(board: Board, resolution: MoveResolution): void {
    const promotedPiece = board.getPiece(this.to);
    if (!promotedPiece || promotedPiece.id !== this.pieceId) {
      throw new Error('Unable to revert promotion: promoted piece not found.');
    }

    board.removePiece(this.to);
    const pawn = new Pawn(
      this.pieceId,
      promotedPiece.team,
      Position.fromCoordinates(this.from.row, this.from.column),
    );
    board.placePiece(pawn);

    if (resolution.capturedPiece) {
      resolution.capturedPiece.updatePosition(this.to);
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

  private createPromotedPiece(team: Team, position: Position): Piece {
    switch (this.promoteTo) {
      case PieceType.Rook:
        return new Rook(this.pieceId, team, Position.fromCoordinates(position.row, position.column));
      case PieceType.Bishop:
        return new Bishop(this.pieceId, team, Position.fromCoordinates(position.row, position.column));
      case PieceType.Knight:
        return new Knight(this.pieceId, team, Position.fromCoordinates(position.row, position.column));
      case PieceType.Queen:
      default:
        return new Queen(this.pieceId, team, Position.fromCoordinates(position.row, position.column));
    }
  }
}
