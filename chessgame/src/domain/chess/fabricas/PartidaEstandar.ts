import { Equipo } from '../core/Equipo';
import type { Pieza } from '../core/Pieza';
import { Posicion } from '../core/Posicion';
import { Partida } from '../Partida';
import { Alfil, Caballo, Peon, Reina, Rey, Torre } from '../piezas';

let contadorIds = 0;

const crearId = (equipo: Equipo, prefijo: string): string => {
  contadorIds += 1;
  return equipo.toLowerCase() + '-' + prefijo + '-' + contadorIds;
};

const posicionesIniciales = (equipo: Equipo): Record<string, string> => {
  if (equipo === Equipo.Blanco) {
    return {
      torreIzquierda: 'a1',
      caballoIzquierdo: 'b1',
      alfilIzquierdo: 'c1',
      reina: 'd1',
      rey: 'e1',
      alfilDerecho: 'f1',
      caballoDerecho: 'g1',
      torreDerecha: 'h1',
      filaPeones: '2',
    };
  }
  return {
    torreIzquierda: 'a8',
    caballoIzquierdo: 'b8',
    alfilIzquierdo: 'c8',
    reina: 'd8',
    rey: 'e8',
    alfilDerecho: 'f8',
    caballoDerecho: 'g8',
    torreDerecha: 'h8',
    filaPeones: '7',
  };
};

const crearPiezasParaEquipo = (equipo: Equipo): Pieza[] => {
  const posiciones = posicionesIniciales(equipo);
  const resultado: Pieza[] = [];

  resultado.push(new Torre(crearId(equipo, 'torre'), equipo, Posicion.desdeAlgebraica(posiciones.torreIzquierda)));
  resultado.push(new Caballo(crearId(equipo, 'caballo'), equipo, Posicion.desdeAlgebraica(posiciones.caballoIzquierdo)));
  resultado.push(new Alfil(crearId(equipo, 'alfil'), equipo, Posicion.desdeAlgebraica(posiciones.alfilIzquierdo)));
  resultado.push(new Reina(crearId(equipo, 'reina'), equipo, Posicion.desdeAlgebraica(posiciones.reina)));
  resultado.push(new Rey(crearId(equipo, 'rey'), equipo, Posicion.desdeAlgebraica(posiciones.rey)));
  resultado.push(new Alfil(crearId(equipo, 'alfil'), equipo, Posicion.desdeAlgebraica(posiciones.alfilDerecho)));
  resultado.push(new Caballo(crearId(equipo, 'caballo'), equipo, Posicion.desdeAlgebraica(posiciones.caballoDerecho)));
  resultado.push(new Torre(crearId(equipo, 'torre'), equipo, Posicion.desdeAlgebraica(posiciones.torreDerecha)));

  const columnaBase = 'a'.charCodeAt(0);
  const filaPeones = posiciones.filaPeones;
  for (let i = 0; i < 8; i += 1) {
    const columna = String.fromCharCode(columnaBase + i);
    const notacion = columna + filaPeones;
    resultado.push(new Peon(crearId(equipo, 'peon'), equipo, Posicion.desdeAlgebraica(notacion)));
  }

  return resultado;
};

export const crearPartidaEstandar = (): Partida => {
  contadorIds = 0;
  const piezasBlancas = crearPiezasParaEquipo(Equipo.Blanco);
  const piezasNegras = crearPiezasParaEquipo(Equipo.Negro);
  return new Partida([...piezasBlancas, ...piezasNegras]);
};

