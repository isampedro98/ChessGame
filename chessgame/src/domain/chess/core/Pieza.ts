import type { Movimiento } from './Movimiento';
import type { Tablero } from './Tablero';
import { Equipo } from './Equipo';
import { Posicion } from './Posicion';

export enum PiezaTipo {
  Rey = 'REY',
  Reina = 'REINA',
  Torre = 'TORRE',
  Alfil = 'ALFIL',
  Caballo = 'CABALLO',
  Peon = 'PEON',
}

export abstract class Pieza {
  constructor(
    readonly id: string,
    readonly equipo: Equipo,
    protected posicion: Posicion,
    readonly tipo: PiezaTipo,
  ) {}

  obtenerPosicion(): Posicion {
    return this.posicion;
  }

  actualizarPosicion(posicion: Posicion): void {
    this.posicion = posicion;
  }

  perteneceA(equipo: Equipo): boolean {
    return this.equipo === equipo;
  }

  estaEnPosicion(posicion: Posicion): boolean {
    return this.posicion.equals(posicion);
  }

  abstract generarMovimientos(tablero: Tablero): Movimiento[];
  abstract clonar(): Pieza;
}

