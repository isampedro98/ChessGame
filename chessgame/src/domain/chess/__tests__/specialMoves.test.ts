import { describe, expect, test } from 'vitest';

import { Game } from '@/domain/chess/Game';
import { Position } from '@/domain/chess/core/Position';
import { Team } from '@/domain/chess/core/Team';
import { PieceType } from '@/domain/chess/core/Piece';
import { King, Rook, Pawn } from '@/domain/chess/pieces';
import { SimpleMove } from '@/domain/chess/moves/SimpleMove';
import { CastleMove } from '@/domain/chess/moves/CastleMove';
import { EnPassantMove } from '@/domain/chess/moves/EnPassantMove';
import { PromotionMove } from '@/domain/chess/moves/PromotionMove';

describe('special moves', () => {
  test('allows king-side castling when squares are clear and not attacked', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteRook = new Rook('white-rook', Team.White, Position.fromAlgebraic('h1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const game = new Game([whiteKing, whiteRook, blackKing]);

    const moves = game.generateMovesFor(whiteKing.id);
    const castle = moves.find(
      (move) => move instanceof CastleMove && move.to.equals(Position.fromAlgebraic('g1')),
    );
    expect(castle).toBeDefined();

    game.executeMove(castle!);
    const board = game.getBoard();
    expect(board.getPiece(Position.fromAlgebraic('g1'))?.type).toBe(PieceType.King);
    expect(board.getPiece(Position.fromAlgebraic('f1'))?.type).toBe(PieceType.Rook);
  });

  test('blocks castling through attacked squares', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteRook = new Rook('white-rook', Team.White, Position.fromAlgebraic('h1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const blackRook = new Rook('black-rook', Team.Black, Position.fromAlgebraic('f8'));
    const game = new Game([whiteKing, whiteRook, blackKing, blackRook]);

    const moves = game.generateMovesFor(whiteKing.id);
    const castle = moves.find(
      (move) => move instanceof CastleMove && move.to.equals(Position.fromAlgebraic('g1')),
    );
    expect(castle).toBeUndefined();
  });

  test('supports en passant captures immediately after a double pawn move', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const whitePawn = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('e5'));
    const blackPawn = new Pawn('black-pawn', Team.Black, Position.fromAlgebraic('d7'));
    const game = new Game([whiteKing, blackKing, whitePawn, blackPawn]);

    game.executeMove(new SimpleMove(whiteKing.id, Position.fromAlgebraic('e1'), Position.fromAlgebraic('e2')));
    game.executeMove(new SimpleMove(blackPawn.id, Position.fromAlgebraic('d7'), Position.fromAlgebraic('d5')));

    const moves = game.generateMovesFor(whitePawn.id);
    const enPassant = moves.find(
      (move) => move instanceof EnPassantMove && move.to.equals(Position.fromAlgebraic('d6')),
    );
    expect(enPassant).toBeDefined();

    game.executeMove(enPassant!);
    const board = game.getBoard();
    expect(board.getPiece(Position.fromAlgebraic('d6'))?.id).toBe(whitePawn.id);
    expect(board.getPiece(Position.fromAlgebraic('d5'))).toBeUndefined();
  });

  test('promotes pawns on the final rank (default queen)', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const whitePawn = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('a7'));
    const game = new Game([whiteKing, blackKing, whitePawn]);

    const moves = game.generateMovesFor(whitePawn.id);
    const promotion = moves.find(
      (move) => move instanceof PromotionMove && move.to.equals(Position.fromAlgebraic('a8')),
    );
    expect(promotion).toBeDefined();

    game.executeMove(promotion!);
    const board = game.getBoard();
    expect(board.getPiece(Position.fromAlgebraic('a8'))?.type).toBe(PieceType.Queen);
    const last = game.moveHistory().at(-1);
    expect(last?.resolution.isPromotion).toBe(true);
  });
});
