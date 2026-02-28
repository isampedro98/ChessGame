import { Team, oppositeTeam } from './core/Team';
import type { Move, MoveResolution } from './core/Move';
import type { Piece } from './core/Piece';
import { Board } from './core/Board';
import { PieceType } from './core/Piece';
import { Position } from './core/Position';
import { CastleMove } from './moves/CastleMove';
import { EnPassantMove } from './moves/EnPassantMove';
import { PromotionMove } from './moves/PromotionMove';

/** Half-moves (plies) since last capture or pawn move; used for 50-move rule. */
const FIFTY_MOVE_THRESHOLD = 50;

interface MoveRecord {
  move: Move;
  resolution: MoveResolution;
}

export type GameResult = Team | 'DRAW' | null;

export interface GameFromFENOptions {
  turn?: Team;
  halfMoveClock?: number;
  castlingRights?: string;
}

export class Game {
  private readonly board: Board;
  private turn: Team = Team.White;
  private readonly history: MoveRecord[] = [];
  /** Half-move count for 50-move rule: resets on capture or pawn move. */
  private halfMovesWithoutCaptureOrPawn = 0;
  /** Stack of halfMove values before each move, for undo. */
  private readonly halfMoveStack: number[] = [];
  /** Position keys after each move (board + turn + castling + ep) for threefold repetition. */
  private readonly positionKeys: string[] = [];
  /** When set (e.g. from FEN), used instead of hasMoved for castling; updated on king/rook move. */
  private castlingRightsOverride: string | null = null;

  constructor(pieces: Piece[], options?: GameFromFENOptions) {
    this.board = new Board(pieces);
    if (options?.turn !== undefined) this.turn = options.turn;
    if (options?.halfMoveClock !== undefined) this.halfMovesWithoutCaptureOrPawn = options.halfMoveClock;
    if (options?.castlingRights !== undefined) this.castlingRightsOverride = options.castlingRights || '-';
  }

  getBoard(): Board {
    return this.board;
  }

  getTurn(): Team {
    return this.turn;
  }

  /** Half-moves (plies) since last capture or pawn move; for FEN and 50-move rule. */
  getHalfMoveClock(): number {
    return this.halfMovesWithoutCaptureOrPawn;
  }

  /** Full move number (1-based); for FEN. */
  getFullMoveNumber(): number {
    return 1 + Math.floor(this.history.length / 2);
  }

  /** Whether the given team's king is in check in the current position. */
  isKingInCheck(team: Team): boolean {
    return this.isInCheck(this.board, team);
  }

  /**
   * Returns the current position in standard FEN (Forsyth–Edwards Notation).
   * Format: piecePlacement activeColor castlingRights enPassantTarget halfmoveClock fullMoveNumber
   */
  toFEN(): string {
    const board = this.board;
    const pieceToChar: Record<PieceType, string> = {
      [PieceType.Pawn]: 'P',
      [PieceType.Knight]: 'N',
      [PieceType.Bishop]: 'B',
      [PieceType.Rook]: 'R',
      [PieceType.Queen]: 'Q',
      [PieceType.King]: 'K',
    };
    const ranks: string[] = [];
    for (let row = 7; row >= 0; row -= 1) {
      let rank = '';
      let empty = 0;
      for (let col = 0; col < 8; col += 1) {
        const pos = Position.fromCoordinates(row, col);
        const piece = board.getPiece(pos);
        if (!piece) {
          empty += 1;
          continue;
        }
        if (empty > 0) {
          rank += String(empty);
          empty = 0;
        }
        const c = pieceToChar[piece.type];
        rank += piece.team === Team.White ? c : c.toLowerCase();
      }
      if (empty > 0) rank += String(empty);
      ranks.push(rank);
    }
    const placement = ranks.join('/');
    const activeColor = this.turn === Team.White ? 'w' : 'b';
    const e1 = Position.fromCoordinates(0, 4);
    const a1 = Position.fromCoordinates(0, 0);
    const h1 = Position.fromCoordinates(0, 7);
    const e8 = Position.fromCoordinates(7, 4);
    const a8 = Position.fromCoordinates(7, 0);
    const h8 = Position.fromCoordinates(7, 7);
    let castling = '';
    const wk = board.getPiece(e1);
    if (wk?.type === PieceType.King && wk.team === Team.White && !this.hasMoved(wk.id)) {
      const rh = board.getPiece(h1);
      if (rh?.type === PieceType.Rook && rh.team === Team.White && !this.hasMoved(rh.id)) castling += 'K';
      const ra = board.getPiece(a1);
      if (ra?.type === PieceType.Rook && ra.team === Team.White && !this.hasMoved(ra.id)) castling += 'Q';
    }
    const bk = board.getPiece(e8);
    if (bk?.type === PieceType.King && bk.team === Team.Black && !this.hasMoved(bk.id)) {
      const rh = board.getPiece(h8);
      if (rh?.type === PieceType.Rook && rh.team === Team.Black && !this.hasMoved(rh.id)) castling += 'k';
      const ra = board.getPiece(a8);
      if (ra?.type === PieceType.Rook && ra.team === Team.Black && !this.hasMoved(ra.id)) castling += 'q';
    }
    if (!castling) castling = '-';
    let ep = '-';
    const last = this.history[this.history.length - 1];
    if (last) {
      const { move } = last;
      const piece = board.getPiece(move.to);
      if (piece?.type === PieceType.Pawn && Math.abs(move.to.row - move.from.row) === 2) {
        const epRow = (move.from.row + move.to.row) / 2;
        ep = Position.fromCoordinates(epRow, move.to.column).toAlgebraic();
      }
    }
    const halfMove = this.getHalfMoveClock();
    const fullMove = this.getFullMoveNumber();
    return `${placement} ${activeColor} ${castling} ${ep} ${halfMove} ${fullMove}`;
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

  private hasInsufficientMaterial(): boolean {
    const pieces = this.board.allPieces();
    const nonKings = pieces.filter((piece) => piece.type !== PieceType.King);

    if (nonKings.length === 0) {
      return true;
    }

    const counts = {
      white: { bishops: [] as number[], knights: 0 },
      black: { bishops: [] as number[], knights: 0 },
    };

    for (const piece of nonKings) {
      if ([PieceType.Pawn, PieceType.Rook, PieceType.Queen].includes(piece.type)) {
        return false;
      }
      const key = piece.team === Team.White ? 'white' : 'black';
      if (piece.type === PieceType.Bishop) {
        const pos = piece.getPosition();
        counts[key].bishops.push((pos.row + pos.column) % 2);
      } else if (piece.type === PieceType.Knight) {
        counts[key].knights += 1;
      }
    }

    const whiteMinors = counts.white.bishops.length + counts.white.knights;
    const blackMinors = counts.black.bishops.length + counts.black.knights;
    const totalMinors = whiteMinors + blackMinors;

    if (totalMinors <= 1) {
      return true;
    }

    if (totalMinors === 2) {
      if (whiteMinors === 1 && blackMinors === 1) {
        return true;
      }

      if (whiteMinors === 2 && blackMinors === 0) {
        return counts.white.knights === 2;
      }

      if (blackMinors === 2 && whiteMinors === 0) {
        return counts.black.knights === 2;
      }
    }

    return false;
  }

  private hasMoved(pieceId: string): boolean {
    return this.history.some((record) => record.move.pieceId === pieceId);
  }

  /** Builds a key for the current position (board + turn + castling + ep) for threefold repetition. */
  private getPositionKey(): string {
    const board = this.board;
    let boardPart = '';
    for (let row = 7; row >= 0; row -= 1) {
      for (let col = 0; col < 8; col += 1) {
        const pos = Position.fromCoordinates(row, col);
        const piece = board.getPiece(pos);
        if (!piece) {
          boardPart += '.';
          continue;
        }
        const c = { [PieceType.Pawn]: 'P', [PieceType.Knight]: 'N', [PieceType.Bishop]: 'B', [PieceType.Rook]: 'R', [PieceType.Queen]: 'Q', [PieceType.King]: 'K' }[piece.type];
        boardPart += piece.team === Team.White ? c : c.toLowerCase();
      }
    }
    const turnChar = this.turn === Team.White ? 'w' : 'b';
    let castling: string;
    if (this.castlingRightsOverride !== null) {
      castling = this.castlingRightsOverride || '-';
    } else {
      const e1 = Position.fromCoordinates(0, 4);
      const a1 = Position.fromCoordinates(0, 0);
      const h1 = Position.fromCoordinates(0, 7);
      const e8 = Position.fromCoordinates(7, 4);
      const a8 = Position.fromCoordinates(7, 0);
      const h8 = Position.fromCoordinates(7, 7);
      castling = '';
      const wk = board.getPiece(e1);
      if (wk?.type === PieceType.King && wk.team === Team.White && !this.hasMoved(wk.id)) {
        const rh = board.getPiece(h1);
        if (rh?.type === PieceType.Rook && rh.team === Team.White && !this.hasMoved(rh.id)) castling += 'K';
        const ra = board.getPiece(a1);
        if (ra?.type === PieceType.Rook && ra.team === Team.White && !this.hasMoved(ra.id)) castling += 'Q';
      }
      const bk = board.getPiece(e8);
      if (bk?.type === PieceType.King && bk.team === Team.Black && !this.hasMoved(bk.id)) {
        const rh = board.getPiece(h8);
        if (rh?.type === PieceType.Rook && rh.team === Team.Black && !this.hasMoved(rh.id)) castling += 'k';
        const ra = board.getPiece(a8);
        if (ra?.type === PieceType.Rook && ra.team === Team.Black && !this.hasMoved(ra.id)) castling += 'q';
      }
      if (!castling) castling = '-';
    }
    let ep = '-';
    const last = this.history[this.history.length - 1];
    if (last) {
      const { move } = last;
      const piece = board.getPiece(move.to);
      if (piece?.type === PieceType.Pawn && Math.abs(move.to.row - move.from.row) === 2) {
        const epRow = (move.from.row + move.to.row) / 2;
        ep = Position.fromCoordinates(epRow, move.to.column).toAlgebraic();
      }
    }
    return `${boardPart}${turnChar}${castling}${ep}`;
  }

  private hasThreefoldRepetition(): boolean {
    if (this.positionKeys.length === 0) return false;
    const current = this.getPositionKey();
    const count = this.positionKeys.filter((k) => k === current).length;
    return count >= 3;
  }

  private hasFiftyMoveDraw(): boolean {
    return this.halfMovesWithoutCaptureOrPawn >= FIFTY_MOVE_THRESHOLD;
  }

  private promotionRow(team: Team): number {
    return team === Team.White ? 7 : 0;
  }

  private castlingMovesFor(king: Piece): Move[] {
    if (king.type !== PieceType.King) {
      return [];
    }
    const team = king.team;
    if (this.castlingRightsOverride !== null) {
      const canK = team === Team.White ? this.castlingRightsOverride.includes('K') : this.castlingRightsOverride.includes('k');
      const canQ = team === Team.White ? this.castlingRightsOverride.includes('Q') : this.castlingRightsOverride.includes('q');
      if (!canK && !canQ) return [];
    } else if (this.hasMoved(king.id)) {
      return [];
    }

    const row = king.getPosition().row;
    if (this.isInCheck(this.board, team)) {
      return [];
    }

    const enemy = oppositeTeam(team);
    const moves: Move[] = [];

    const kingSideRookFrom = Position.fromCoordinates(row, 7);
    const kingSideRook = this.board.getPiece(kingSideRookFrom);
    const canCastleKingside = this.castlingRightsOverride !== null
      ? (team === Team.White ? this.castlingRightsOverride.includes('K') : this.castlingRightsOverride.includes('k'))
      : !this.hasMoved(king.id);
    if (
      kingSideRook &&
      kingSideRook.type === PieceType.Rook &&
      kingSideRook.team === team &&
      (this.castlingRightsOverride !== null ? canCastleKingside : !this.hasMoved(kingSideRook.id))
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
    const canCastleQueenside = this.castlingRightsOverride !== null
      ? (team === Team.White ? this.castlingRightsOverride.includes('Q') : this.castlingRightsOverride.includes('q'))
      : !this.hasMoved(king.id);
    if (
      queenSideRook &&
      queenSideRook.type === PieceType.Rook &&
      queenSideRook.team === team &&
      (this.castlingRightsOverride !== null ? canCastleQueenside : !this.hasMoved(queenSideRook.id))
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

  getResult(): GameResult {
    const whiteKing = this.kingPosition(this.board, Team.White);
    const blackKing = this.kingPosition(this.board, Team.Black);
    if (!whiteKing || !blackKing) {
      return 'DRAW';
    }

    if (this.hasInsufficientMaterial()) {
      return 'DRAW';
    }

    if (this.hasThreefoldRepetition()) {
      return 'DRAW';
    }

    if (this.hasFiftyMoveDraw()) {
      return 'DRAW';
    }

    const current = this.turn;
    if (this.hasLegalMove(current)) return null;
    return this.isInCheck(this.board, current) ? oppositeTeam(current) : 'DRAW';
  }

  getWinner(): Team | null {
    const result = this.getResult();
    return result === Team.White || result === Team.Black ? result : null;
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

    const wasPawn = piece.type === PieceType.Pawn;
    move.validate(this.board);
    const resolution = move.execute(this.board);
    if (this.isInCheck(this.board, this.turn)) {
      move.revert(this.board, resolution);
      throw new Error('Move leaves the king in check.');
    }
    if (this.castlingRightsOverride !== null && this.castlingRightsOverride !== '-') {
      let next = this.castlingRightsOverride;
      if (piece.type === PieceType.King) {
        if (piece.team === Team.White) next = next.replace(/K/g, '').replace(/Q/g, '');
        else next = next.replace(/k/g, '').replace(/q/g, '');
      } else if (piece.type === PieceType.Rook) {
        const from = move.from;
        if (from.row === 0 && from.column === 7) next = next.replace(/K/g, '');
        if (from.row === 0 && from.column === 0) next = next.replace(/Q/g, '');
        if (from.row === 7 && from.column === 7) next = next.replace(/k/g, '');
        if (from.row === 7 && from.column === 0) next = next.replace(/q/g, '');
      }
      this.castlingRightsOverride = next || '-';
    }

    this.history.push({ move, resolution });
    this.turn = oppositeTeam(this.turn);

    this.halfMoveStack.push(this.halfMovesWithoutCaptureOrPawn);
    if (resolution.capturedPiece || wasPawn) {
      this.halfMovesWithoutCaptureOrPawn = 0;
    } else {
      this.halfMovesWithoutCaptureOrPawn += 1;
    }
    this.positionKeys.push(this.getPositionKey());
  }

  undoLastMove(): void {
    const record = this.history.pop();
    if (!record) {
      return;
    }
    this.positionKeys.pop();
    const prevHalf = this.halfMoveStack.pop();
    if (prevHalf !== undefined) {
      this.halfMovesWithoutCaptureOrPawn = prevHalf;
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
