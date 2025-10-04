export enum Team {
  White = 'WHITE',
  Black = 'BLACK',
}

export const oppositeTeam = (team: Team): Team => (
  team === Team.White ? Team.Black : Team.White
);
