import type { Move } from '../core/Move';
import { Team } from '../core/Team';
import { Piece, PieceType } from '../core/Piece';
import { Position } from '../core/Position';
import { Board } from '../core/Board';
import { SimpleMove } from '../moves/SimpleMove';

const WHITE_STARTING_ROW = 1;
const BLACK_STARTING_ROW = 6;

export class Pawn extends Piece {
  constructor(id: string, team: Team, position: Position) {
    super(id, team, position, PieceType.Pawn);
  }

  generateMoves(board: Board): Move[] {
    const moves: Move[] = [];
    const direction = this.team === Team.White ? 1 : -1;
    const origin = this.getPosition();

    const oneStep = origin.shift(direction, 0);
    if (oneStep && board.isEmpty(oneStep)) {
      moves.push(new SimpleMove(this.id, origin, oneStep));

      if (this.isOnStartingRow()) {
        const twoSteps = origin.shift(direction * 2, 0);
        if (twoSteps && board.isEmpty(twoSteps)) {
          moves.push(new SimpleMove(this.id, origin, twoSteps));
        }
      }
    }

    const captureSquares = [origin.shift(direction, -1), origin.shift(direction, 1)];
    for (const destination of captureSquares) {
      if (!destination) {
        continue;
      }
      const piece = board.getPiece(destination);
      if (piece && !piece.belongsTo(this.team)) {
        moves.push(new SimpleMove(this.id, origin, destination));
      }
    }

    return moves;
  }

  clone(): Pawn {
    const position = this.getPosition();
    return new Pawn(this.id, this.team, Position.fromCoordinates(position.row, position.column));
  }

  private isOnStartingRow(): boolean {
    const row = this.getPosition().row;
    return (
      (this.team === Team.White && row === WHITE_STARTING_ROW) ||
      (this.team === Team.Black && row === BLACK_STARTING_ROW)
    );
  }
}
