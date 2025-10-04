import { Move, type MoveResolution } from '../core/Move';
import type { Piece } from '../core/Piece';
import { Board } from '../core/Board';

export class SimpleMove extends Move {
  validate(board: Board): void {
    const piece = this.getPieceToMove(board);
    const destinationPiece = board.getPiece(this.to);
    if (destinationPiece && destinationPiece.belongsTo(piece.team)) {
      throw new Error('Destination square is occupied by an allied piece.');
    }
  }

  execute(board: Board): MoveResolution {
    const piece = this.getPieceToMove(board);
    const captured = board.movePiece(piece.getPosition(), this.to);
    return { capturedPiece: captured ?? undefined };
  }

  revert(board: Board, resolution: MoveResolution): void {
    const piece = board.getPiece(this.to);
    if (!piece || piece.id !== this.pieceId) {
      throw new Error('Unable to revert move: piece not found.');
    }

    board.movePiece(this.to, this.from);

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
}
