import { describe, expect, test } from 'vitest';

import { createStandardGame } from '@/domain/chess/factories/createStandardGame';
import { Position } from '@/domain/chess/core/Position';
import type { Game } from '@/domain/chess/Game';
import { gameToPGN, gameToSANMoves } from '@/domain/chess/pgn';

const play = (game: Game, from: string, to: string) => {
  const fromPos = Position.fromAlgebraic(from);
  const toPos = Position.fromAlgebraic(to);
  const piece = game.getBoard().getPiece(fromPos);
  expect(piece).toBeDefined();

  const move = game
    .generateMovesFor(piece!.id)
    .find((candidate) => candidate.to.equals(toPos));

  expect(move).toBeDefined();
  game.executeMove(move!);
};

describe('pgn helpers', () => {
  test('builds SAN move list for standard opening sequence', () => {
    const game = createStandardGame();

    play(game, 'e2', 'e4');
    play(game, 'e7', 'e5');
    play(game, 'g1', 'f3');
    play(game, 'b8', 'c6');
    play(game, 'f1', 'b5');

    expect(gameToSANMoves(game)).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']);
  });

  test('marks checkmate moves in SAN and PGN output', () => {
    const game = createStandardGame();

    play(game, 'e2', 'e4');
    play(game, 'e7', 'e5');
    play(game, 'f1', 'c4');
    play(game, 'b8', 'c6');
    play(game, 'd1', 'h5');
    play(game, 'g8', 'f6');
    play(game, 'h5', 'f7');

    const sanMoves = gameToSANMoves(game);
    expect(sanMoves.at(-1)).toBe('Qxf7#');

    const pgn = gameToPGN(game);
    expect(pgn).toContain('1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#');
  });
});
