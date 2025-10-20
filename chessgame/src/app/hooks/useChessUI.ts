'use client';

import { useCallback, useMemo, useState } from 'react';

import { Game, Team, PieceType, Position, type Move, type Piece } from '@/domain/chess';

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

export const useChessUI = (game: Game) => {
  const [version, setVersion] = useState(0);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [candidateMoves, setCandidateMoves] = useState<Move[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const squares = useMemo(() => buildSquares(game, version), [game, version]);

  const availableDestinations = useMemo(
    () => new Set(candidateMoves.map((move) => move.to.toKey())),
    [candidateMoves],
  );

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
        try {
          game.executeMove(move);
          setSelection(null);
          setCandidateMoves([]);
          setVersion((value) => value + 1);
          setMessage(null);
        } catch (error) {
          setMessage(error instanceof Error ? error.message : t('board.message.invalidMove'));
        }
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
    [availableDestinations, candidateMoves, game, selection, t],
  );

  const currentTurn = game.getTurn();
  const board = game.getBoard();
  const whiteHasKing = board.getPiecesByTeam(Team.White).some((p) => p.type === PieceType.King);
  const blackHasKing = board.getPiecesByTeam(Team.Black).some((p) => p.type === PieceType.King);
  const winner: Team | null = !whiteHasKing ? Team.Black : !blackHasKing ? Team.White : null;

  const instruction = winner
    ? winner === Team.White
      ? t('info.winner.whites')
      : t('info.winner.blacks')
    : selection
      ? t('board.instruction.selectDestination')
      : t('board.instruction.selectPiece');

  return {
    squares,
    availableDestinations,
    history,
    instruction,
    message,
    onSquareClick: handleSquareClick,
    scenePieces,
    selectedSquareKey: selection?.originKey ?? null,
    currentTurn,
  };
};
