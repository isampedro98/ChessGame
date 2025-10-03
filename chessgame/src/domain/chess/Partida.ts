import { Equipo, equipoOpuesto } from './core/Equipo';
import type { Movimiento, ResolucionMovimiento } from './core/Movimiento';
import type { Pieza } from './core/Pieza';
import { Tablero } from './core/Tablero';

interface RegistroMovimiento {
  movimiento: Movimiento;
  resolucion: ResolucionMovimiento;
}

export class Partida {
  private readonly tablero: Tablero;
  private turno: Equipo = Equipo.Blanco;
  private readonly historial: RegistroMovimiento[] = [];

  constructor(piezas: Pieza[]) {
    this.tablero = new Tablero(piezas);
  }

  obtenerTablero(): Tablero {
    return this.tablero;
  }

  obtenerTurno(): Equipo {
    return this.turno;
  }

  ejecutarMovimiento(movimiento: Movimiento): void {
    const pieza = this.tablero.obtenerPieza(movimiento.origen);
    if (!pieza) {
      throw new Error('No hay pieza en el origen del movimiento');
    }
    if (pieza.equipo !== this.turno) {
      throw new Error('No es el turno de ese equipo');
    }
    if (pieza.id !== movimiento.piezaId) {
      throw new Error('La pieza indicada no coincide con el movimiento');
    }

    movimiento.validar(this.tablero);
    const resolucion = movimiento.ejecutar(this.tablero);
    this.historial.push({ movimiento, resolucion });
    this.turno = equipoOpuesto(this.turno);
  }

  deshacerUltimoMovimiento(): void {
    const registro = this.historial.pop();
    if (!registro) {
      return;
    }
    registro.movimiento.revertir(this.tablero, registro.resolucion);
    this.turno = equipoOpuesto(this.turno);
  }

  historialMovimientos(): ReadonlyArray<RegistroMovimiento> {
    return this.historial.slice();
  }

  generarMovimientosPara(piezaId: string): Movimiento[] {
    const pieza = this.tablero.obtenerPiezaPorId(piezaId);
    if (!pieza || pieza.equipo !== this.turno) {
      return [];
    }
    return pieza.generarMovimientos(this.tablero);
  }
}

