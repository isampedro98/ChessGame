import { describe, expect, test } from 'vitest';

import { Game } from '@/domain/chess/Game';
import { Position } from '@/domain/chess/core/Position';
import { Team } from '@/domain/chess/core/Team';
import { Bishop, King, Pawn, Rook } from '@/domain/chess/pieces';
import { SimpleMove } from '@/domain/chess/moves/SimpleMove';
import { CastleMove } from '@/domain/chess/moves/CastleMove';
import { EnPassantMove } from '@/domain/chess/moves/EnPassantMove';

describe('legal move edge cases', () => {
  test('pin: piece cannot move off the line and expose own king', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteRook = new Rook('white-rook', Team.White, Position.fromAlgebraic('e2'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('a8'));
    const blackRook = new Rook('black-rook', Team.Black, Position.fromAlgebraic('e8'));
    const game = new Game([whiteKing, whiteRook, blackKing, blackRook]);

    const rookMoves = game.generateMovesFor(whiteRook.id);
    const canMoveSideways = rookMoves.some((move) => move.to.equals(Position.fromAlgebraic('d2')));
    const canSlideOnPinLine = rookMoves.some((move) => move.to.equals(Position.fromAlgebraic('e3')));

    expect(canMoveSideways).toBe(false);
    expect(canSlideOnPinLine).toBe(true);
  });

  test('double check: only king moves are legal', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteRook = new Rook('white-rook', Team.White, Position.fromAlgebraic('h1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('a8'));
    const blackRook = new Rook('black-rook', Team.Black, Position.fromAlgebraic('e8'));
    const blackBishop = new Bishop('black-bishop', Team.Black, Position.fromAlgebraic('b4'));
    const game = new Game([whiteKing, whiteRook, blackKing, blackRook, blackBishop]);

    const rookMoves = game.generateMovesFor(whiteRook.id);
    const kingMoves = game.generateMovesFor(whiteKing.id);

    expect(rookMoves).toHaveLength(0);
    expect(kingMoves.length).toBeGreaterThan(0);
  });

  test('en passant is only legal immediately after the double-step', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteRook = new Rook('white-rook', Team.White, Position.fromAlgebraic('a1'));
    const whitePawn = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('e5'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const blackPawn = new Pawn('black-pawn', Team.Black, Position.fromAlgebraic('d7'));
    const game = new Game([whiteKing, whiteRook, whitePawn, blackKing, blackPawn]);

    game.executeMove(new SimpleMove(whiteRook.id, Position.fromAlgebraic('a1'), Position.fromAlgebraic('a2')));
    game.executeMove(new SimpleMove(blackPawn.id, Position.fromAlgebraic('d7'), Position.fromAlgebraic('d5')));
    game.executeMove(new SimpleMove(whiteKing.id, Position.fromAlgebraic('e1'), Position.fromAlgebraic('e2')));
    game.executeMove(new SimpleMove(blackKing.id, Position.fromAlgebraic('e8'), Position.fromAlgebraic('e7')));

    const moves = game.generateMovesFor(whitePawn.id);
    const enPassant = moves.find(
      (move) => move instanceof EnPassantMove && move.to.equals(Position.fromAlgebraic('d6')),
    );

    expect(enPassant).toBeUndefined();
  });

  test('en passant is rejected when it exposes own king to check', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteRook = new Rook('white-rook', Team.White, Position.fromAlgebraic('a1'));
    const whitePawn = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('e5'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('h8'));
    const blackPawn = new Pawn('black-pawn', Team.Black, Position.fromAlgebraic('d7'));
    const blackRook = new Rook('black-rook', Team.Black, Position.fromAlgebraic('e8'));
    const game = new Game([whiteKing, whiteRook, whitePawn, blackKing, blackPawn, blackRook]);

    game.executeMove(new SimpleMove(whiteRook.id, Position.fromAlgebraic('a1'), Position.fromAlgebraic('a2')));
    game.executeMove(new SimpleMove(blackPawn.id, Position.fromAlgebraic('d7'), Position.fromAlgebraic('d5')));

    const pawnMoves = game.generateMovesFor(whitePawn.id);
    const enPassant = pawnMoves.find(
      (move) => move instanceof EnPassantMove && move.to.equals(Position.fromAlgebraic('d6')),
    );
    const forward = pawnMoves.find((move) => move.to.equals(Position.fromAlgebraic('e6')));

    expect(enPassant).toBeUndefined();
    expect(forward).toBeDefined();
  });

  test('castling is not allowed after king has moved', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteRook = new Rook('white-rook', Team.White, Position.fromAlgebraic('h1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const game = new Game([whiteKing, whiteRook, blackKing]);

    game.executeMove(new SimpleMove(whiteKing.id, Position.fromAlgebraic('e1'), Position.fromAlgebraic('f1')));
    game.executeMove(new SimpleMove(blackKing.id, Position.fromAlgebraic('e8'), Position.fromAlgebraic('f8')));
    game.executeMove(new SimpleMove(whiteKing.id, Position.fromAlgebraic('f1'), Position.fromAlgebraic('e1')));
    game.executeMove(new SimpleMove(blackKing.id, Position.fromAlgebraic('f8'), Position.fromAlgebraic('e8')));

    const kingMoves = game.generateMovesFor(whiteKing.id);
    const castle = kingMoves.find(
      (move) => move instanceof CastleMove && move.to.equals(Position.fromAlgebraic('g1')),
    );
    expect(castle).toBeUndefined();
  });

  test('castling is not allowed after rook has moved', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteRook = new Rook('white-rook', Team.White, Position.fromAlgebraic('h1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const game = new Game([whiteKing, whiteRook, blackKing]);

    game.executeMove(new SimpleMove(whiteRook.id, Position.fromAlgebraic('h1'), Position.fromAlgebraic('h2')));
    game.executeMove(new SimpleMove(blackKing.id, Position.fromAlgebraic('e8'), Position.fromAlgebraic('f8')));
    game.executeMove(new SimpleMove(whiteRook.id, Position.fromAlgebraic('h2'), Position.fromAlgebraic('h1')));
    game.executeMove(new SimpleMove(blackKing.id, Position.fromAlgebraic('f8'), Position.fromAlgebraic('e8')));

    const kingMoves = game.generateMovesFor(whiteKing.id);
    const castle = kingMoves.find(
      (move) => move instanceof CastleMove && move.to.equals(Position.fromAlgebraic('g1')),
    );
    expect(castle).toBeUndefined();
  });
});

