'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  Game,
  Team,
  PieceType,
  Position,
  type Move,
  type Piece,
  EnPassantMove,
  PromotionMove,
  type GameResult,
} from '@/domain/chess';
import type { Board } from '@/domain/chess/core/Board';

import {
  describeMove,
  type MoveDetails,
} from '@/app/chess-ui/helpers';
import { useTranslation } from '@/app/i18n/TranslationProvider';

export type SquareInfo = {
  id: string;
  position: Position;
  piece?: Piece;
  isDark: boolean;
};

type SelectionState = {
  pieceId: string;
  originKey: string;
};

export type HistoryEntry = MoveDetails & {
  sequence: number;
};

export type ScenePiece = {
  id: string;
  type: PieceType;
  team: Team;
  position: { row: number; column: number };
};

export type MoveEvent = {
  move: Move;
  boardBefore: Board;
  turn: Team;
  legalMoves: Move[];
  moveIndex: number;
};

const buildSquares = (game: Game, version: number): SquareInfo[] => {
  void version;
  const board = game.getBoard();
  const squares: SquareInfo[] = [];

  for (let row = 7; row >= 0; row -= 1) {
    for (let column = 0; column < 8; column += 1) {
      const position = Position.fromCoordinates(row, column);
      squares.push({
        id: position.toAlgebraic(),
        position,
        piece: board.getPiece(position),
        isDark: (row + column) % 2 === 1,
      });
    }
  }

  return squares;
};

const buildHistory = (game: Game, version: number): HistoryEntry[] => {
  void version;
  const history = game.moveHistory();
  const board = game.getBoard();

  return history.map(({ move, resolution }, index) => {
    const piece = board.getPiece(move.to);
    const details = describeMove(index, move, piece, resolution);
    return {
      sequence: index + 1,
      ...details,
    };
  });
};

const buildScenePieces = (game: Game, version: number): ScenePiece[] => {
  void version;
  return game
    .getBoard()
    .allPieces()
    .map((piece) => ({
      id: piece.id,
      type: piece.type,
      team: piece.team,
      position: {
        row: piece.getPosition().row,
        column: piece.getPosition().column,
      },
    }));
};

export const useChessUI = (
  game: Game,
  options?: { onMove?: (event: MoveEvent) => void; onPromotion?: (move: PromotionMove) => void },
) => {
  const [version, setVersion] = useState(0);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [candidateMoves, setCandidateMoves] = useState<Move[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const onMove = options?.onMove;
  const onPromotion = options?.onPromotion;

  const applyMove = useCallback(
    (move: Move): boolean => {
      const turn = game.getTurn();
      const boardBefore = game.getBoard().clone();
      const legalMoves: Move[] = [];
      game.getBoard()
        .getPiecesByTeam(turn)
        .forEach((piece) => {
          legalMoves.push(...game.generateMovesFor(piece.id));
        });
      try {
        game.executeMove(move);
        setSelection(null);
        setCandidateMoves([]);
        setVersion((value) => value + 1);
        setMessage(null);
        onMove?.({
          move,
          boardBefore,
          turn,
          legalMoves,
          moveIndex: game.moveHistory().length - 1,
        });
        return true;
      } catch (error) {
        setMessage(error instanceof Error ? error.message : t('board.message.invalidMove'));
        return false;
      }
    },
    [game, onMove, t],
  );

  const undoLastMove = useCallback((): boolean => {
    if (game.moveHistory().length === 0) {
      return false;
    }
    game.undoLastMove();
    setSelection(null);
    setCandidateMoves([]);
    setVersion((value) => value + 1);
    setMessage(null);
    return true;
  }, [game]);

  const squares = useMemo(() => buildSquares(game, version), [game, version]);

  const availableDestinations = useMemo(
    () => new Set(candidateMoves.map((move) => move.to.toKey())),
    [candidateMoves],
  );

  const captureDestinations = useMemo(() => {
    const board = game.getBoard();
    const set = new Set<string>();
    candidateMoves.forEach((m) => {
      if (m instanceof EnPassantMove) {
        set.add(m.to.toKey());
        return;
      }
      const destPiece = board.getPiece(m.to);
      if (destPiece && destPiece.team !== game.getTurn()) {
        set.add(m.to.toKey());
      }
    });
    return set;
  }, [candidateMoves, game]);

  const history = useMemo(() => buildHistory(game, version), [game, version]);

  const scenePieces = useMemo(() => buildScenePieces(game, version), [game, version]);

  const handleSquareClick = useCallback(
    (square: SquareInfo) => {
      // Si hay ganador, ignoramos más clicks
      const board = game.getBoard();
      const whiteHasKing = board.getPiecesByTeam(Team.White).some((p) => p.type === PieceType.King);
      const blackHasKing = board.getPiecesByTeam(Team.Black).some((p) => p.type === PieceType.King);
      if (!whiteHasKing || !blackHasKing) {
        return;
      }
      const key = square.position.toKey();
      const currentTurn = game.getTurn();

      if (selection && availableDestinations.has(key)) {
        const move = candidateMoves.find((candidate) => candidate.to.toKey() === key);
        if (!move) {
          return;
        }
        if (move instanceof PromotionMove && onPromotion) {
          setSelection(null);
          setCandidateMoves([]);
          setMessage(null);
          onPromotion(move);
          return;
        }
        applyMove(move);
        return;
      }

      if (selection && selection.originKey === key) {
        setSelection(null);
        setCandidateMoves([]);
        setMessage(null);
        return;
      }

      if (square.piece && square.piece.belongsTo(currentTurn)) {
        const moves = game.generateMovesFor(square.piece.id);
        setSelection({ pieceId: square.piece.id, originKey: key });
        setCandidateMoves(moves);
        setMessage(moves.length === 0 ? t('board.message.noLegalMoves') : null);
        return;
      }

      if (selection) {
        setSelection(null);
        setCandidateMoves([]);
        setMessage(null);
      }
    },
    [applyMove, availableDestinations, candidateMoves, game, onPromotion, selection, t],
  );

  const currentTurn = game.getTurn();
  const result: GameResult = game.getResult();

  const findKingSquareKey = useCallback((team: Team): string | null => {
    const king = game
      .getBoard()
      .getPiecesByTeam(team)
      .find((piece) => piece.type === PieceType.King);
    return king ? king.getPosition().toKey() : null;
  }, [game]);

  const inCheckSquareKey = useMemo(() => {
    if (result !== null) {
      return null;
    }
    return game.isKingInCheck(currentTurn) ? findKingSquareKey(currentTurn) : null;
  }, [currentTurn, findKingSquareKey, game, result]);

  const checkmateSquareKey = useMemo(() => {
    if (!(result === Team.White || result === Team.Black)) {
      return null;
    }
    const losingTeam = result === Team.White ? Team.Black : Team.White;
    if (!game.isKingInCheck(losingTeam)) {
      return null;
    }
    return findKingSquareKey(losingTeam);
  }, [findKingSquareKey, game, result]);

  const instruction = result
    ? result === Team.White
      ? t('info.winner.whites')
      : result === Team.Black
        ? t('info.winner.blacks')
        : t('info.winner.draw')
    : selection
      ? t('board.instruction.selectDestination')
      : t('board.instruction.selectPiece');

  return {
    squares,
    availableDestinations,
    captureDestinations,
    history,
    instruction,
    message,
    onSquareClick: handleSquareClick,
    applyMove,
    undoLastMove,
    scenePieces,
    selectedSquareKey: selection?.originKey ?? null,
    currentTurn,
    result,
    inCheckSquareKey,
    checkmateSquareKey,
  };
};
