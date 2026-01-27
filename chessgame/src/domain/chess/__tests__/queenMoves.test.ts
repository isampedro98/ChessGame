import { describe, expect, test } from 'vitest';

import { Board } from '@/domain/chess/core/Board';
import { Position } from '@/domain/chess/core/Position';
import { Team } from '@/domain/chess/core/Team';
import { Queen, Pawn } from '@/domain/chess/pieces';

const squares = (moves: Array<{ to: Position }>) =>
  moves.map((move) => move.to.toAlgebraic()).sort();

describe('queen moves', () => {
  test('combines rook and bishop movement with blockers', () => {
    const queen = new Queen('white-queen', Team.White, Position.fromAlgebraic('d4'));
    const ally = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('d6'));
    const allyDiagonal = new Pawn('white-pawn-2', Team.White, Position.fromAlgebraic('f6'));
    const enemyRight = new Pawn('black-pawn', Team.Black, Position.fromAlgebraic('f4'));
    const enemyDiagonal = new Pawn('black-pawn-2', Team.Black, Position.fromAlgebraic('b2'));
    const board = new Board([queen, ally, allyDiagonal, enemyRight, enemyDiagonal]);

    const moves = queen.generateMoves(board);
    expect(squares(moves)).toEqual([
      'a4',
      'a7',
      'b2',
      'b4',
      'b6',
      'c3',
      'c4',
      'c5',
      'd1',
      'd2',
      'd3',
      'd5',
      'e3',
      'e4',
      'e5',
      'f2',
      'f4',
      'g1',
    ].sort());
  });
});
