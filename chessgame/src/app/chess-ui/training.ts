import { Board } from '@/domain/chess/core/Board';
import { Move } from '@/domain/chess/core/Move';
import { PieceType } from '@/domain/chess/core/Piece';
import { Position } from '@/domain/chess/core/Position';
import { Team, oppositeTeam } from '@/domain/chess/core/Team';
import { CastleMove } from '@/domain/chess/moves/CastleMove';

export type TrainingPhase = 'opening' | 'midgame' | 'endgame';
export type ReasonKey =
  | 'material'
  | 'center'
  | 'development'
  | 'castle'
  | 'hanging'
  | 'earlyQueen'
  | 'pawnAdvance'
  | 'kingActivity'
  | 'missed'
  | 'quiet';

type Contribution = {
  key: ReasonKey;
  score: number;
};

export type TrainingAnalysis = {
  phase: TrainingPhase;
  moveScore: number;
  bestScore: number;
  delta: number;
  positiveReasons: ReasonKey[];
  negativeReasons: ReasonKey[];
};

export type TrainingBotConfig = {
  randomness: number;
  preferTop: number;
};

const PIECE_VALUE: Record<PieceType, number> = {
  [PieceType.Pawn]: 1,
  [PieceType.Knight]: 3,
  [PieceType.Bishop]: 3,
  [PieceType.Rook]: 5,
  [PieceType.Queen]: 9,
  [PieceType.King]: 100,
};

const isCenter = (pos: Position): boolean => {
  return (pos.row === 3 || pos.row === 4) && (pos.column === 3 || pos.column === 4);
};

const isExtendedCenter = (pos: Position): boolean => {
  return pos.row >= 2 && pos.row <= 5 && pos.column >= 2 && pos.column <= 5;
};

const isBackRank = (team: Team, row: number): boolean =>
  (team === Team.White && row === 0) || (team === Team.Black && row === 7);

const distanceToCenter = (pos: Position): number => {
  const center = [
    Position.fromCoordinates(3, 3),
    Position.fromCoordinates(3, 4),
    Position.fromCoordinates(4, 3),
    Position.fromCoordinates(4, 4),
  ];
  return Math.min(...center.map((c) => Math.abs(c.row - pos.row) + Math.abs(c.column - pos.column)));
};

const determinePhase = (board: Board, moveIndex: number): TrainingPhase => {
  const pieces = board.allPieces().filter((p) => p.type !== PieceType.King);
  const material = pieces.reduce((sum, p) => sum + PIECE_VALUE[p.type], 0);
  if (material <= 14 || pieces.length <= 6) return 'endgame';
  if (moveIndex < 14) return 'opening';
  return 'midgame';
};

const isSquareAttacked = (board: Board, square: Position, byTeam: Team): boolean => {
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
};

const simulateMove = (board: Board, move: Move) => {
  const clone = board.clone();
  const resolution = move.execute(clone);
  return { board: clone, resolution };
};

const evaluateMoveScore = (
  boardBefore: Board,
  move: Move,
  phase: TrainingPhase,
  turn: Team,
): { score: number; contributions: Contribution[] } => {
  const piece = boardBefore.getPiece(move.from);
  if (!piece) return { score: -Infinity, contributions: [] };

  const contributions: Contribution[] = [];
  let score = 0;

  const { board: after, resolution } = simulateMove(boardBefore, move);
  const enemy = oppositeTeam(turn);

  if (resolution.capturedPiece) {
    const gain = PIECE_VALUE[resolution.capturedPiece.type];
    score += gain;
    contributions.push({ key: 'material', score: gain });
  }

  if (move instanceof CastleMove) {
    const bonus = phase === 'opening' ? 0.6 : 0.3;
    score += bonus;
    contributions.push({ key: 'castle', score: bonus });
  }

  if (isCenter(move.to)) {
    const bonus = phase === 'opening' ? 0.35 : 0.2;
    score += bonus;
    contributions.push({ key: 'center', score: bonus });
  } else if (isExtendedCenter(move.to)) {
    const bonus = phase === 'opening' ? 0.2 : 0.1;
    score += bonus;
    contributions.push({ key: 'center', score: bonus });
  }

  if (
    phase === 'opening' &&
    (piece.type === PieceType.Knight || piece.type === PieceType.Bishop) &&
    isBackRank(turn, piece.getPosition().row) &&
    !isBackRank(turn, move.to.row)
  ) {
    const bonus = 0.4;
    score += bonus;
    contributions.push({ key: 'development', score: bonus });
  }

  if (phase === 'opening' && piece.type === PieceType.Queen) {
    const penalty = -0.5;
    score += penalty;
    contributions.push({ key: 'earlyQueen', score: penalty });
  }

  if (phase === 'endgame' && piece.type === PieceType.King) {
    const before = distanceToCenter(piece.getPosition());
    const afterDist = distanceToCenter(move.to);
    if (afterDist < before) {
      const bonus = 0.35;
      score += bonus;
      contributions.push({ key: 'kingActivity', score: bonus });
    }
  }

  if (phase === 'endgame' && piece.type === PieceType.Pawn) {
    const advance = Math.abs(move.to.row - move.from.row);
    if (advance > 0) {
      const bonus = 0.2 * advance;
      score += bonus;
      contributions.push({ key: 'pawnAdvance', score: bonus });
    }
  }

  const attackedByEnemy = isSquareAttacked(after, move.to, enemy);
  if (attackedByEnemy) {
    const defendedByAlly = isSquareAttacked(after, move.to, turn);
    const penalty = defendedByAlly ? -0.4 * PIECE_VALUE[piece.type] : -0.9 * PIECE_VALUE[piece.type];
    score += penalty;
    contributions.push({ key: 'hanging', score: penalty });
  }

  return { score, contributions };
};

export const analyzeTrainingMove = (params: {
  board: Board;
  move: Move;
  legalMoves: Move[];
  turn: Team;
  moveIndex: number;
}): TrainingAnalysis => {
  const phase = determinePhase(params.board, params.moveIndex);
  const evaluated = evaluateMoveScore(params.board, params.move, phase, params.turn);

  let bestScore = -Infinity;
  params.legalMoves.forEach((candidate) => {
    const result = evaluateMoveScore(params.board, candidate, phase, params.turn);
    bestScore = Math.max(bestScore, result.score);
  });

  const contributions = evaluated.contributions.slice().sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  const positive = contributions.filter((c) => c.score > 0.15).slice(0, 2).map((c) => c.key);
  const negative = contributions.filter((c) => c.score < -0.15).slice(0, 2).map((c) => c.key);

  return {
    phase,
    moveScore: evaluated.score,
    bestScore,
    delta: bestScore - evaluated.score,
    positiveReasons: positive,
    negativeReasons: negative,
  };
};

export const chooseTrainingMove = (params: {
  board: Board;
  legalMoves: Move[];
  turn: Team;
  moveIndex: number;
  config?: Partial<TrainingBotConfig>;
}): { move: Move; analysis: TrainingAnalysis } | null => {
  if (params.legalMoves.length === 0) return null;
  const config: TrainingBotConfig = {
    randomness: params.config?.randomness ?? 0.15,
    preferTop: params.config?.preferTop ?? 0.35,
  };

  const phase = determinePhase(params.board, params.moveIndex);
  let best = -Infinity;
  const scored: Array<{ move: Move; score: number }> = [];

  params.legalMoves.forEach((move) => {
    const evaluated = evaluateMoveScore(params.board, move, phase, params.turn);
    const jitter = (Math.random() - 0.5) * config.randomness;
    const score = evaluated.score + jitter;
    scored.push({ move, score });
    if (score > best) best = score;
  });

  const threshold = best - config.preferTop;
  const candidates = scored.filter((entry) => entry.score >= threshold);
  const pick = candidates[Math.floor(Math.random() * candidates.length)] ?? scored[0];

  return {
    move: pick.move,
    analysis: analyzeTrainingMove({
      board: params.board,
      move: pick.move,
      legalMoves: params.legalMoves,
      turn: params.turn,
      moveIndex: params.moveIndex,
    }),
  };
};
