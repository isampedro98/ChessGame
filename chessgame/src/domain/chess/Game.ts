import { Team, oppositeTeam } from './core/Team';
import type { Move, MoveResolution } from './core/Move';
import type { Piece } from './core/Piece';
import { Board } from './core/Board';

interface MoveRecord {
  move: Move;
  resolution: MoveResolution;
}

export class Game {
  private readonly board: Board;
  private turn: Team = Team.White;
  private readonly history: MoveRecord[] = [];

  constructor(pieces: Piece[]) {
    this.board = new Board(pieces);
  }

  getBoard(): Board {
    return this.board;
  }

  getTurn(): Team {
    return this.turn;
  }

  executeMove(move: Move): void {
    const piece = this.board.getPiece(move.from);
    if (!piece) {
      throw new Error('There is no piece on the source square.');
    }
    if (piece.team !== this.turn) {
      throw new Error('It is not that team\'s turn.');
    }
    if (piece.id !== move.pieceId) {
      throw new Error('The piece specified does not match the move descriptor.');
    }

    move.validate(this.board);
    const resolution = move.execute(this.board);
    this.history.push({ move, resolution });
    this.turn = oppositeTeam(this.turn);
  }

  undoLastMove(): void {
    const record = this.history.pop();
    if (!record) {
      return;
    }
    record.move.revert(this.board, record.resolution);
    this.turn = oppositeTeam(this.turn);
  }

  moveHistory(): ReadonlyArray<MoveRecord> {
    return this.history.slice();
  }

  generateMovesFor(pieceId: string): Move[] {
    const piece = this.board.getPieceById(pieceId);
    if (!piece || piece.team !== this.turn) {
      return [];
    }
    return piece.generateMoves(this.board);
  }
}
