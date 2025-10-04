import { Equipo, type Pieza, PiezaTipo, type Movimiento, type ResolucionMovimiento } from '@/domain/chess';

export const simbolosPorTipo: Record<PiezaTipo, string> = {
  [PiezaTipo.Rey]: 'K',
  [PiezaTipo.Reina]: 'Q',
  [PiezaTipo.Torre]: 'R',
  [PiezaTipo.Alfil]: 'B',
  [PiezaTipo.Caballo]: 'N',
  [PiezaTipo.Peon]: 'P',
};

export const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const simboloDePieza = (pieza: Pieza): string => {
  const base = simbolosPorTipo[pieza.tipo];
  return pieza.perteneceA(Equipo.Blanco) ? base : base.toLowerCase();
};

export const claseDePieza = (pieza: Pieza): string =>
  pieza.perteneceA(Equipo.Blanco)
    ? 'bg-white/10 text-slate-50 ring-1 ring-white/40'
    : 'bg-slate-200 text-slate-900';

export const nombreEquipo = (equipo: Equipo): string =>
  equipo === Equipo.Blanco ? 'Blancas' : 'Negras';

export type MovimientoDetallado = {
  titulo: string;
  detalles: string[];
};

export const describirMovimiento = (
  indice: number,
  movimiento: Movimiento,
  pieza: Pieza | undefined,
  resolucion: ResolucionMovimiento,
): MovimientoDetallado => {
  const etiquetaPieza = pieza ? simboloDePieza(pieza) : '';
  const titulo = `${indice + 1}. ${etiquetaPieza ? `${etiquetaPieza} ` : ''}${movimiento.descripcion()}`;

  const detalles: string[] = [];
  if (resolucion.piezaCapturada) {
    detalles.push(
      `Captura ${simboloDePieza(resolucion.piezaCapturada)} en ${movimiento.destino.toAlgebraica()}`,
    );
  }
  if (resolucion.esCoronacion && resolucion.piezaPromocionada) {
    detalles.push(`Corona a ${simboloDePieza(resolucion.piezaPromocionada)}`);
  }

  return { titulo, detalles };
};
