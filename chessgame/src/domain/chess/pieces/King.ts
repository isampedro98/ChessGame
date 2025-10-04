import type { Move } from '../core/Move';
import { Team } from '../core/Team';
import { Piece, PieceType } from '../core/Piece';
import { Position } from '../core/Position';
import { Board } from '../core/Board';
import { SimpleMove } from '../moves/SimpleMove';

const OFFSETS: Array<[number, number]> = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export class King extends Piece {
  constructor(id: string, team: Team, position: Position) {
    super(id, team, position, PieceType.King);
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

  clone(): King {
    const position = this.getPosition();
    return new King(this.id, this.team, Position.fromCoordinates(position.row, position.column));
  }
}
