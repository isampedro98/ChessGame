import type { Movimiento } from '../core/Movimiento';
import { Equipo } from '../core/Equipo';
import { Pieza, PiezaTipo } from '../core/Pieza';
import { Posicion } from '../core/Posicion';
import { Tablero } from '../core/Tablero';
import { MovimientoSimple } from '../movimientos/MovimientoSimple';

const DESPLAZAMIENTOS: Array<[number, number]> = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export class Rey extends Pieza {
  constructor(id: string, equipo: Equipo, posicion: Posicion) {
    super(id, equipo, posicion, PiezaTipo.Rey);
  }

  generarMovimientos(tablero: Tablero): Movimiento[] {
    const movimientos: Movimiento[] = [];

    for (const [deltaFila, deltaColumna] of DESPLAZAMIENTOS) {
      const destino = this.obtenerPosicion().mover(deltaFila, deltaColumna);
      if (!destino) {
        continue;
      }
      const piezaEnDestino = tablero.obtenerPieza(destino);
      if (!piezaEnDestino || !piezaEnDestino.perteneceA(this.equipo)) {
        movimientos.push(new MovimientoSimple(this.id, this.obtenerPosicion(), destino));
      }
    }

    return movimientos;
  }

  clonar(): Rey {
    const posicion = this.obtenerPosicion();
    return new Rey(this.id, this.equipo, Posicion.desdeCoordenadas(posicion.fila, posicion.columna));
  }
}

