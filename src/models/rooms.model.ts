import { UUID } from "crypto";
import { TYPE } from "./command-types";
import { Player } from "./players.model";

export interface RoomUser {
  name: string;
  index: UUID;
}

export interface Room {
  roomId: UUID;
  roomUsers: RoomUser[];
}

export interface UpdateRoom {
  type: TYPE.UPDATE_ROOM;
  data: string;
  id: 0;
}
