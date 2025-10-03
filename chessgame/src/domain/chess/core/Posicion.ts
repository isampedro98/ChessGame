export class Posicion {
  private static readonly limiteInferior = 0;
  private static readonly limiteSuperior = 7;

  constructor(readonly fila: number, readonly columna: number) {
    Posicion.validarRango(fila);
    Posicion.validarRango(columna);
  }

  static desdeCoordenadas(fila: number, columna: number): Posicion {
    return new Posicion(fila, columna);
  }

  static desdeAlgebraica(notacion: string): Posicion {
    if (!/^([a-h][1-8])$/i.test(notacion)) {
      throw new Error('Notacion invalida: ' + notacion);
    }

    const columna = notacion[0].toLowerCase().charCodeAt(0) - 97;
    const fila = Number.parseInt(notacion[1], 10) - 1;
    return new Posicion(fila, columna);
  }

  mover(deltaFila: number, deltaColumna: number): Posicion | null {
    const nuevaFila = this.fila + deltaFila;
    const nuevaColumna = this.columna + deltaColumna;

    if (!Posicion.enRango(nuevaFila) || !Posicion.enRango(nuevaColumna)) {
      return null;
    }

    return new Posicion(nuevaFila, nuevaColumna);
  }

  equals(otra: Posicion): boolean {
    return this.fila === otra.fila && this.columna === otra.columna;
  }

  toKey(): string {
    return this.fila + ',' + this.columna;
  }

  toAlgebraica(): string {
    const letra = String.fromCharCode(97 + this.columna);
    return letra + String(this.fila + 1);
  }

  private static validarRango(valor: number) {
    if (!Posicion.enRango(valor)) {
      throw new Error('Posicion fuera de rango: ' + valor);
    }
  }

  private static enRango(valor: number): boolean {
    return Number.isInteger(valor) && valor >= Posicion.limiteInferior && valor <= Posicion.limiteSuperior;
  }
}

