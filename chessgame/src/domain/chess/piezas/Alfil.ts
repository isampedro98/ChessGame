import type { Movimiento } from '../core/Movimiento';
import { Equipo } from '../core/Equipo';
import { PiezaTipo } from '../core/Pieza';
import { Posicion } from '../core/Posicion';
import { Tablero } from '../core/Tablero';
import { PiezaDeslizable } from './PiezaDeslizable';

const DIRECCIONES: Array<[number, number]> = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

export class Alfil extends PiezaDeslizable {
  constructor(id: string, equipo: Equipo, posicion: Posicion) {
    super(id, equipo, posicion, PiezaTipo.Alfil);
  }

  generarMovimientos(tablero: Tablero): Movimiento[] {
    return this.generarMovimientosLineales(tablero, DIRECCIONES);
  }

  clonar(): Alfil {
    const posicion = this.obtenerPosicion();
    return new Alfil(this.id, this.equipo, Posicion.desdeCoordenadas(posicion.fila, posicion.columna));
  }
}

