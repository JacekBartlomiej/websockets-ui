import { players } from "./in-memory-db";
import { TYPE } from "./models/command-types";
import { Response } from "./models/response.model";
import { AddUserToRoomData, Room, RoomUser } from "./models/rooms.model";
import { UUID, randomUUID } from "crypto";

const rooms: Map<UUID, RoomUser[]> = new Map();

export const toUpdateRooms = (): string => {
  return JSON.stringify({
    type: TYPE.UPDATE_ROOM,
    data: JSON.stringify(
      Array.from(rooms, ([uuid, users]) => ({ roomId: uuid, roomUsers: users } as Room))
    ),
    id: 0,
  } as Response);
};

export const createRoom = (): UUID => {
  const roomId = randomUUID();
  rooms.set(roomId, []);
  return roomId;
};

export const addUserToRoom = (roomId: UUID, userId: UUID): void => {
  const user = players.get(userId);
  const room = rooms.get(roomId);
  if (user && room) {
    const userIsAlreadyInRoom = room.some((user) => user.index === userId);
    if (!userIsAlreadyInRoom) {
      room.push({ name: user.name, index: userId });
      rooms.set(roomId, room);
    }
  }
};

export const toRoomId = (data: string): UUID => {
  return (JSON.parse(data) as AddUserToRoomData).indexRoom;
}
