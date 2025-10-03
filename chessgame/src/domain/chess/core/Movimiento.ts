import type { Pieza } from './Pieza';
import { Posicion } from './Posicion';
import type { Tablero } from './Tablero';

export interface ResolucionMovimiento {
  piezaCapturada?: Pieza;
  esCoronacion?: boolean;
  piezaPromocionada?: Pieza;
}

export abstract class Movimiento {
  constructor(
    readonly piezaId: string,
    readonly origen: Posicion,
    readonly destino: Posicion,
  ) {}

  descripcion(): string {
    return this.origen.toAlgebraica() + ' -> ' + this.destino.toAlgebraica();
  }

  abstract validar(tablero: Tablero): void;
  abstract ejecutar(tablero: Tablero): ResolucionMovimiento;
  abstract revertir(tablero: Tablero, resolucion: ResolucionMovimiento): void;
}

