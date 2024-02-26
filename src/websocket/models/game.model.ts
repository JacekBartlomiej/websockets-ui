import { UUID } from "crypto";

export interface Coordinate {
  x: number;
  y: number;
}

export interface CoordinateStatus extends Coordinate {
  shot: boolean;
}

export interface Attack extends Coordinate {
  gameId: UUID;
  indexPlayer: UUID;
}

export enum ATTACK_STATUS {
  MISS = "miss",
  KILLED = "killed",
  SHOT = "shot",
}

export interface AttackFeedback {
  position: Coordinate;
  currentPlayer: UUID;
  status: ATTACK_STATUS;
}

export interface Turn {
  currentPlayer: UUID;
}

export interface RandomAttack {
  gameId: UUID;
  indexPlayer: UUID;
}

export interface Finish {
  winPlayer: UUID;
}

export interface UpdateWinner {
  name: string;
  wins: number;
}
