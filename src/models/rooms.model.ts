import { UUID } from "crypto";
import { TYPE } from "./command-types";

export interface RoomUser {
  name: string;
  index: UUID;
}

export interface Room {
  roomId: UUID;
  roomUsers: RoomUser[];
}

export interface AddUserToRoomData {
  indexRoom: UUID
}
