import { UUID } from "crypto";
import { TYPE } from "./command-types";

export interface RoomUser {
  name: string;
  index: UUID;
}

export interface UpdateRoom {
  roomId: UUID;
  roomUsers: RoomUser[];
}

export interface AddUserToRoom {
  indexRoom: UUID;
}

export interface CreateGame {
  idGame: UUID;
  idPlayer: UUID;
}

export interface GameSetup {
  players: [UUID, UUID];
  addShips: [];
}

export interface AddShips {
  gameId: UUID;
  ships: Ship[];
  indexPlayer: UUID;
}

export interface Ship {
  position: ShipPosition;
  direction: boolean;
  type: SHIP_TYPE;
  length: number;
}

export enum SHIP_TYPE {
  HUGE = "huge",
  MEDIUM = "medium",
  LARGE = "large",
  SMALL = "small",
}

export interface ShipPosition {
  x: number;
  y: number;
}

export interface StartGame {
  ships: Ship[];
  currentPlayerIndex: UUID;
}
