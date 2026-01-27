import { describe, expect, test } from 'vitest';

import { Board } from '@/domain/chess/core/Board';
import { Position } from '@/domain/chess/core/Position';
import { Team } from '@/domain/chess/core/Team';
import { Rook, Pawn } from '@/domain/chess/pieces';

const squares = (moves: Array<{ to: Position }>) =>
  moves.map((move) => move.to.toAlgebraic()).sort();

describe('rook moves', () => {
  test('slides orthogonally and stops on blockers', () => {
    const rook = new Rook('white-rook', Team.White, Position.fromAlgebraic('d4'));
    const ally = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('d6'));
    const enemy = new Pawn('black-pawn', Team.Black, Position.fromAlgebraic('b4'));
    const board = new Board([rook, ally, enemy]);

    const moves = rook.generateMoves(board);
    expect(squares(moves)).toEqual([
      'b4',
      'c4',
      'd1',
      'd2',
      'd3',
      'd5',
      'e4',
      'f4',
      'g4',
      'h4',
    ].sort());
  });
});
