import { describe, expect, test } from 'vitest';

import { Board } from '@/domain/chess/core/Board';
import { Position } from '@/domain/chess/core/Position';
import { Team } from '@/domain/chess/core/Team';
import { Pawn, Knight } from '@/domain/chess/pieces';

const squares = (moves: Array<{ to: Position }>) =>
  moves.map((move) => move.to.toAlgebraic()).sort();

describe('pawn moves', () => {
  test('advances one or two squares from the starting rank when clear', () => {
    const pawn = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('e2'));
    const board = new Board([pawn]);

    const moves = pawn.generateMoves(board);
    expect(squares(moves)).toEqual(['e3', 'e4'].sort());
  });

  test('cannot move forward when blocked', () => {
    const pawn = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('e2'));
    const blocker = new Pawn('white-blocker', Team.White, Position.fromAlgebraic('e3'));
    const board = new Board([pawn, blocker]);

    const moves = pawn.generateMoves(board);
    expect(moves).toHaveLength(0);
  });

  test('captures diagonally only enemy pieces', () => {
    const pawn = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('e5'));
    const enemy = new Knight('black-knight', Team.Black, Position.fromAlgebraic('d6'));
    const ally = new Knight('white-knight', Team.White, Position.fromAlgebraic('f6'));
    const board = new Board([pawn, enemy, ally]);

    const moves = pawn.generateMoves(board);
    expect(squares(moves)).toEqual(['d6', 'e6'].sort());
  });

  test('black pawns advance toward rank 1', () => {
    const pawn = new Pawn('black-pawn', Team.Black, Position.fromAlgebraic('d7'));
    const board = new Board([pawn]);

    const moves = pawn.generateMoves(board);
    expect(squares(moves)).toEqual(['d5', 'd6'].sort());
  });
});
