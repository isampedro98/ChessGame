import { describe, expect, test } from 'vitest';

import { Board } from '@/domain/chess/core/Board';
import { Position } from '@/domain/chess/core/Position';
import { Team } from '@/domain/chess/core/Team';
import { Knight, Pawn } from '@/domain/chess/pieces';

const squares = (moves: Array<{ to: Position }>) =>
  moves.map((move) => move.to.toAlgebraic()).sort();

describe('knight moves', () => {
  test('jumps to all L-shaped destinations on an empty board', () => {
    const knight = new Knight('white-knight', Team.White, Position.fromAlgebraic('d4'));
    const board = new Board([knight]);

    const moves = knight.generateMoves(board);
    expect(squares(moves)).toEqual(['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5'].sort());
  });

  test('cannot land on allied pieces but can capture enemies', () => {
    const knight = new Knight('white-knight', Team.White, Position.fromAlgebraic('d4'));
    const ally = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('b5'));
    const enemy = new Pawn('black-pawn', Team.Black, Position.fromAlgebraic('e6'));
    const blocker = new Pawn('white-blocker', Team.White, Position.fromAlgebraic('c5'));
    const board = new Board([knight, ally, enemy, blocker]);

    const moves = knight.generateMoves(board);
    const destinations = squares(moves);
    expect(destinations).not.toContain('b5');
    expect(destinations).toContain('e6');
    expect(destinations).toContain('f5');
  });
});
