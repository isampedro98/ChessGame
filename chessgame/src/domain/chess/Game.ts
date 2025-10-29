import { Team, oppositeTeam } from './core/Team';
import type { Move, MoveResolution } from './core/Move';
import type { Piece } from './core/Piece';
import { Board } from './core/Board';
import { PieceType } from './core/Piece';
import { Position } from './core/Position';

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

  // Winner detection helpers
  private kingPosition(board: Board, team: Team): Position | null {
    const king = board.getPiecesByTeam(team).find((p) => p.type === PieceType.King);
    return king ? king.getPosition() : null;
  }

  private isSquareAttacked(board: Board, square: Position, byTeam: Team): boolean {
    const enemyPieces = board.getPiecesByTeam(byTeam);
    for (const piece of enemyPieces) {
      const moves = piece.generateMoves(board);
      if (moves.some((m) => m.to.equals(square))) {
        return true;
      }
    }
    return false;
  }

  private isInCheck(board: Board, team: Team): boolean {
    const kingPos = this.kingPosition(board, team);
    if (!kingPos) {
      return true;
    }
    return this.isSquareAttacked(board, kingPos, oppositeTeam(team));
  }

  private hasLegalMove(team: Team): boolean {
    const pieces = this.board.getPiecesByTeam(team);
    for (const piece of pieces) {
      const moves = piece.generateMoves(this.board);
      for (const move of moves) {
        const clone = this.board.clone();
        try {
          move.execute(clone);
        } catch {
          continue;
        }
        if (!this.isInCheck(clone, team)) {
          return true;
        }
      }
    }
    return false;
  }

  getWinner(): Team | null {
    const whiteKing = this.kingPosition(this.board, Team.White);
    const blackKing = this.kingPosition(this.board, Team.Black);
    if (!whiteKing && blackKing) return Team.Black;
    if (!blackKing && whiteKing) return Team.White;
    if (!whiteKing && !blackKing) return null;

    const current = this.turn;
    if (this.hasLegalMove(current)) return null;
    return this.isInCheck(this.board, current) ? oppositeTeam(current) : null;
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
