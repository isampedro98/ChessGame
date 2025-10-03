import type { Movimiento } from '../core/Movimiento';
import { Pieza } from '../core/Pieza';
import { Posicion } from '../core/Posicion';
import { Tablero } from '../core/Tablero';
import { MovimientoSimple } from '../movimientos/MovimientoSimple';

export abstract class PiezaDeslizable extends Pieza {
  protected generarMovimientosLineales(tablero: Tablero, direcciones: Array<[number, number]>): Movimiento[] {
    const movimientos: Movimiento[] = [];

    for (const [deltaFila, deltaColumna] of direcciones) {
      let destino = this.obtenerPosicion().mover(deltaFila, deltaColumna);
      while (destino) {
        const piezaEnDestino = tablero.obtenerPieza(destino);
        if (!piezaEnDestino) {
          movimientos.push(this.crearMovimientoSimple(destino));
        } else {
          if (!piezaEnDestino.perteneceA(this.equipo)) {
            movimientos.push(this.crearMovimientoSimple(destino));
          }
          break;
        }
        destino = destino.mover(deltaFila, deltaColumna);
      }
    }

    return movimientos;
  }

  protected crearMovimientoSimple(destino: Posicion): Movimiento {
    return new MovimientoSimple(this.id, this.obtenerPosicion(), destino);
  }
}

