import type { Move } from '../core/Move';
import { Team } from '../core/Team';
import { Piece, PieceType } from '../core/Piece';
import { Position } from '../core/Position';
import { Board } from '../core/Board';
import { SimpleMove } from '../moves/SimpleMove';

const OFFSETS: Array<[number, number]> = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
];

export class Knight extends Piece {
  constructor(id: string, team: Team, position: Position) {
    super(id, team, position, PieceType.Knight);
  }

  generateMoves(board: Board): Move[] {
    const moves: Move[] = [];

    for (const [rowDelta, columnDelta] of OFFSETS) {
      const destination = this.getPosition().shift(rowDelta, columnDelta);
      if (!destination) {
        continue;
      }
      const pieceAtDestination = board.getPiece(destination);
      if (!pieceAtDestination || !pieceAtDestination.belongsTo(this.team)) {
        moves.push(new SimpleMove(this.id, this.getPosition(), destination));
      }
    }

    return moves;
  }

  clone(): Knight {
    const position = this.getPosition();
    return new Knight(this.id, this.team, Position.fromCoordinates(position.row, position.column));
  }
}
