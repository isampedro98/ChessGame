import type { Move } from '../core/Move';
import { Team } from '../core/Team';
import { PieceType } from '../core/Piece';
import { Position } from '../core/Position';
import { Board } from '../core/Board';
import { SlidingPiece } from './SlidingPiece';

const DIRECTIONS: Array<[number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export class Rook extends SlidingPiece {
  constructor(id: string, team: Team, position: Position) {
    super(id, team, position, PieceType.Rook);
  }

  generateMoves(board: Board): Move[] {
    return this.generateLinearMoves(board, DIRECTIONS);
  }

  clone(): Rook {
    const position = this.getPosition();
    return new Rook(this.id, this.team, Position.fromCoordinates(position.row, position.column));
  }
}
