import { Movimiento, ResolucionMovimiento } from '../core/Movimiento';
import type { Pieza } from '../core/Pieza';
import { Tablero } from '../core/Tablero';

export class MovimientoSimple extends Movimiento {
  validar(tablero: Tablero): void {
    const pieza = this.obtenerPiezaParaMover(tablero);
    const destino = tablero.obtenerPieza(this.destino);
    if (destino && destino.perteneceA(pieza.equipo)) {
      throw new Error('El destino contiene una pieza aliada');
    }
  }

  ejecutar(tablero: Tablero): ResolucionMovimiento {
    const pieza = this.obtenerPiezaParaMover(tablero);
    const capturada = tablero.moverPieza(pieza.obtenerPosicion(), this.destino);
    return { piezaCapturada: capturada ?? undefined };
  }

  revertir(tablero: Tablero, resolucion: ResolucionMovimiento): void {
    const pieza = tablero.obtenerPieza(this.destino);
    if (!pieza || pieza.id !== this.piezaId) {
      throw new Error('No hay pieza para revertir el movimiento');
    }

    tablero.moverPieza(this.destino, this.origen);

    if (resolucion.piezaCapturada) {
      resolucion.piezaCapturada.actualizarPosicion(this.destino);
      tablero.colocarPieza(resolucion.piezaCapturada);
    }
  }

  private obtenerPiezaParaMover(tablero: Tablero): Pieza {
    const pieza = tablero.obtenerPieza(this.origen);
    if (!pieza) {
      throw new Error('No hay pieza en la posicion de origen');
    }
    if (pieza.id !== this.piezaId) {
      throw new Error('La pieza en origen no coincide con el movimiento');
    }
    return pieza;
  }
}

