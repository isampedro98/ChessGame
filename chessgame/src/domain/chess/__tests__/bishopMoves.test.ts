import { describe, expect, test } from 'vitest';

import { Board } from '@/domain/chess/core/Board';
import { Position } from '@/domain/chess/core/Position';
import { Team } from '@/domain/chess/core/Team';
import { Bishop, Pawn } from '@/domain/chess/pieces';

const squares = (moves: Array<{ to: Position }>) =>
  moves.map((move) => move.to.toAlgebraic()).sort();

describe('bishop moves', () => {
  test('slides diagonally and stops on blockers', () => {
    const bishop = new Bishop('white-bishop', Team.White, Position.fromAlgebraic('c1'));
    const ally = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('e3'));
    const enemy = new Pawn('black-pawn', Team.Black, Position.fromAlgebraic('b2'));
    const board = new Board([bishop, ally, enemy]);

    const moves = bishop.generateMoves(board);
    expect(squares(moves)).toEqual(['b2', 'd2'].sort());
  });
});
