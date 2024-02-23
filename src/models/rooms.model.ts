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
  indexRoom: UUID
}

export interface CreateGame {
  idGame: UUID,
  idPlayer: UUID
}
