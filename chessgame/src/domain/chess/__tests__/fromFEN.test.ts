import { describe, expect, test } from 'vitest';
import { Position } from '@/domain/chess/core/Position';
import { PieceType } from '@/domain/chess/core/Piece';
import { createGameFromFEN } from '@/domain/chess/fromFEN';
import { createStandardGame } from '@/domain/chess/factories/createStandardGame';

const STANDARD_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('fromFEN', () => {
  test('standard position matches createStandardGame FEN', () => {
    const fromFactory = createStandardGame();
    const fromFen = createGameFromFEN(STANDARD_FEN);
    expect(fromFen.toFEN()).toBe(fromFactory.toFEN());
  });

  test('invalid FEN throws', () => {
    expect(() => createGameFromFEN('')).toThrow('Invalid FEN');
    expect(() => createGameFromFEN('only-five parts here')).toThrow('expected 6 fields');
    expect(() => createGameFromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1')).toThrow('active color');
    expect(() => createGameFromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -1 1')).toThrow('halfmove');
  });

  test('after e4 position loads, turn is black and e4 has white pawn', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    const game = createGameFromFEN(fen);
    expect(game.getTurn()).toBe('BLACK');
    const e4 = Position.fromAlgebraic('e4');
    const piece = game.getBoard().getPiece(e4);
    expect(piece?.type).toBe(PieceType.Pawn);
    expect(piece?.team).toBe('WHITE');
  });
});
