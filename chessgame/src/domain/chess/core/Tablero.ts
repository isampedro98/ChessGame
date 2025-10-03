import { Equipo } from './Equipo';
import { Pieza } from './Pieza';
import { Posicion } from './Posicion';

export class Tablero {
  private readonly casillas = new Map<string, Pieza>();

  constructor(piezas: Pieza[] = []) {
    piezas.forEach((pieza) => this.colocarPieza(pieza));
  }

  obtenerPieza(posicion: Posicion): Pieza | undefined {
    return this.casillas.get(posicion.toKey());
  }

  obtenerPiezaPorId(id: string): Pieza | undefined {
    for (const pieza of this.casillas.values()) {
      if (pieza.id === id) {
        return pieza;
      }
    }
    return undefined;
  }

  obtenerPiezasPorEquipo(equipo: Equipo): Pieza[] {
    return Array.from(this.casillas.values()).filter((pieza) => pieza.perteneceA(equipo));
  }

  colocarPieza(pieza: Pieza): void {
    const posicion = pieza.obtenerPosicion();
    this.casillas.set(posicion.toKey(), pieza);
  }

  removerPieza(posicion: Posicion): Pieza | undefined {
    const key = posicion.toKey();
    const pieza = this.casillas.get(key);
    if (pieza) {
      this.casillas.delete(key);
    }
    return pieza;
  }

  moverPieza(origen: Posicion, destino: Posicion): Pieza | undefined {
    const pieza = this.obtenerPieza(origen);
    if (!pieza) {
      throw new Error('No hay pieza en la posicion de origen');
    }

    const piezaCapturada = this.removerPieza(destino);
    this.casillas.delete(origen.toKey());
    pieza.actualizarPosicion(destino);
    this.casillas.set(destino.toKey(), pieza);
    return piezaCapturada;
  }

  clonar(): Tablero {
    const piezas = Array.from(this.casillas.values()).map((pieza) => pieza.clonar());
    return new Tablero(piezas);
  }

  estaLibre(posicion: Posicion): boolean {
    return !this.casillas.has(posicion.toKey());
  }

  todasLasPiezas(): Pieza[] {
    return Array.from(this.casillas.values());
  }
}

