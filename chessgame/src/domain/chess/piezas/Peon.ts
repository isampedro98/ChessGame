import type { Movimiento } from '../core/Movimiento';
import { Equipo } from '../core/Equipo';
import { Pieza, PiezaTipo } from '../core/Pieza';
import { Posicion } from '../core/Posicion';
import { Tablero } from '../core/Tablero';
import { MovimientoSimple } from '../movimientos/MovimientoSimple';

const FILA_INICIAL_BLANCA = 1;
const FILA_INICIAL_NEGRA = 6;

export class Peon extends Pieza {
  constructor(id: string, equipo: Equipo, posicion: Posicion) {
    super(id, equipo, posicion, PiezaTipo.Peon);
  }

  generarMovimientos(tablero: Tablero): Movimiento[] {
    const movimientos: Movimiento[] = [];
    const direccion = this.equipo === Equipo.Blanco ? 1 : -1;
    const origen = this.obtenerPosicion();

    const pasoAdelante = origen.mover(direccion, 0);
    if (pasoAdelante && tablero.estaLibre(pasoAdelante)) {
      movimientos.push(new MovimientoSimple(this.id, origen, pasoAdelante));

      if (this.estaEnFilaInicial()) {
        const dosPasos = origen.mover(direccion * 2, 0);
        if (dosPasos && tablero.estaLibre(dosPasos)) {
          movimientos.push(new MovimientoSimple(this.id, origen, dosPasos));
        }
      }
    }

    const posiblesCapturas = [origen.mover(direccion, -1), origen.mover(direccion, 1)];
    for (const destino of posiblesCapturas) {
      if (!destino) {
        continue;
      }
      const pieza = tablero.obtenerPieza(destino);
      if (pieza && !pieza.perteneceA(this.equipo)) {
        movimientos.push(new MovimientoSimple(this.id, origen, destino));
      }
    }

    return movimientos;
  }

  clonar(): Peon {
    const posicion = this.obtenerPosicion();
    return new Peon(this.id, this.equipo, Posicion.desdeCoordenadas(posicion.fila, posicion.columna));
  }

  private estaEnFilaInicial(): boolean {
    const fila = this.obtenerPosicion().fila;
    return (
      (this.equipo === Equipo.Blanco && fila === FILA_INICIAL_BLANCA) ||
      (this.equipo === Equipo.Negro && fila === FILA_INICIAL_NEGRA)
    );
  }
}

