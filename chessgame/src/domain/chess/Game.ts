import { Team, oppositeTeam } from './core/Team';
import type { Move, MoveResolution } from './core/Move';
import type { Piece } from './core/Piece';
import { Board } from './core/Board';
import { PieceType } from './core/Piece';
import { Position } from './core/Position';
import { CastleMove } from './moves/CastleMove';
import { EnPassantMove } from './moves/EnPassantMove';
import { PromotionMove } from './moves/PromotionMove';

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
      if (piece.type === PieceType.Pawn) {
        const direction = piece.team === Team.White ? 1 : -1;
        const left = piece.getPosition().shift(direction, -1);
        const right = piece.getPosition().shift(direction, 1);
        if (left?.equals(square) || right?.equals(square)) {
          return true;
        }
        continue;
      }
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
      const moves = this.generateMovesFor(piece.id);
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

  private hasMoved(pieceId: string): boolean {
    return this.history.some((record) => record.move.pieceId === pieceId);
  }

  private promotionRow(team: Team): number {
    return team === Team.White ? 7 : 0;
  }

  private castlingMovesFor(king: Piece): Move[] {
    if (king.type !== PieceType.King) {
      return [];
    }
    if (this.hasMoved(king.id)) {
      return [];
    }

    const team = king.team;
    const row = king.getPosition().row;
    if (this.isInCheck(this.board, team)) {
      return [];
    }

    const enemy = oppositeTeam(team);
    const moves: Move[] = [];

    const kingSideRookFrom = Position.fromCoordinates(row, 7);
    const kingSideRook = this.board.getPiece(kingSideRookFrom);
    if (
      kingSideRook &&
      kingSideRook.type === PieceType.Rook &&
      kingSideRook.team === team &&
      !this.hasMoved(kingSideRook.id)
    ) {
      const f = Position.fromCoordinates(row, 5);
      const g = Position.fromCoordinates(row, 6);
      if (
        this.board.isEmpty(f) &&
        this.board.isEmpty(g) &&
        !this.isSquareAttacked(this.board, f, enemy) &&
        !this.isSquareAttacked(this.board, g, enemy)
      ) {
        moves.push(new CastleMove(king.id, king.getPosition(), g, kingSideRook.id, kingSideRookFrom, f));
      }
    }

    const queenSideRookFrom = Position.fromCoordinates(row, 0);
    const queenSideRook = this.board.getPiece(queenSideRookFrom);
    if (
      queenSideRook &&
      queenSideRook.type === PieceType.Rook &&
      queenSideRook.team === team &&
      !this.hasMoved(queenSideRook.id)
    ) {
      const b = Position.fromCoordinates(row, 1);
      const c = Position.fromCoordinates(row, 2);
      const d = Position.fromCoordinates(row, 3);
      if (
        this.board.isEmpty(b) &&
        this.board.isEmpty(c) &&
        this.board.isEmpty(d) &&
        !this.isSquareAttacked(this.board, d, enemy) &&
        !this.isSquareAttacked(this.board, c, enemy)
      ) {
        moves.push(new CastleMove(king.id, king.getPosition(), c, queenSideRook.id, queenSideRookFrom, d));
      }
    }

    return moves;
  }

  private enPassantMovesFor(pawn: Piece): Move[] {
    if (pawn.type !== PieceType.Pawn) {
      return [];
    }
    const lastMove = this.history[this.history.length - 1]?.move;
    if (!lastMove) {
      return [];
    }

    const lastPiece = this.board.getPiece(lastMove.to);
    if (!lastPiece || lastPiece.type !== PieceType.Pawn || lastPiece.team === pawn.team) {
      return [];
    }

    const rowDelta = Math.abs(lastMove.to.row - lastMove.from.row);
    if (rowDelta !== 2) {
      return [];
    }

    const pawnPos = pawn.getPosition();
    if (pawnPos.row !== lastMove.to.row) {
      return [];
    }
    if (Math.abs(pawnPos.column - lastMove.to.column) !== 1) {
      return [];
    }

    const direction = pawn.team === Team.White ? 1 : -1;
    const destination = pawnPos.shift(direction, lastMove.to.column - pawnPos.column);
    if (!destination) {
      return [];
    }

    const capturedPos = Position.fromCoordinates(lastMove.to.row, lastMove.to.column);
    return [new EnPassantMove(pawn.id, pawnPos, destination, capturedPos)];
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
    let candidates = piece.generateMoves(this.board);
    if (piece.type === PieceType.Pawn) {
      const promotionRow = this.promotionRow(piece.team);
      candidates = candidates.map((move) =>
        move.to.row === promotionRow ? new PromotionMove(piece.id, move.from, move.to) : move,
      );
      candidates = [...candidates, ...this.enPassantMovesFor(piece)];
    }
    if (piece.type === PieceType.King) {
      candidates = [...candidates, ...this.castlingMovesFor(piece)];
    }

    return candidates.filter((move) => {
      const clone = this.board.clone();
      try {
        move.execute(clone);
      } catch {
        return false;
      }
      return !this.isInCheck(clone, piece.team);
    });
  }
}
