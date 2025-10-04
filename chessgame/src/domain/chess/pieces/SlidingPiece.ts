import type { Move } from '../core/Move';
import { Piece } from '../core/Piece';
import { Position } from '../core/Position';
import { Board } from '../core/Board';
import { SimpleMove } from '../moves/SimpleMove';

export abstract class SlidingPiece extends Piece {
  protected generateLinearMoves(board: Board, directions: Array<[number, number]>): Move[] {
    const moves: Move[] = [];

    for (const [rowDelta, columnDelta] of directions) {
      let destination = this.getPosition().shift(rowDelta, columnDelta);
      while (destination) {
        const occupyingPiece = board.getPiece(destination);
        if (!occupyingPiece) {
          moves.push(this.createSimpleMove(destination));
        } else {
          if (!occupyingPiece.belongsTo(this.team)) {
            moves.push(this.createSimpleMove(destination));
          }
          break;
        }
        destination = destination.shift(rowDelta, columnDelta);
      }
    }

    return moves;
  }

  protected createSimpleMove(destination: Position): Move {
    return new SimpleMove(this.id, this.getPosition(), destination);
  }
}
