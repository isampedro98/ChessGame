export enum Equipo {
  Blanco = 'BLANCO',
  Negro = 'NEGRO',
}

export const equipoOpuesto = (equipo: Equipo): Equipo => (
  equipo === Equipo.Blanco ? Equipo.Negro : Equipo.Blanco
);
