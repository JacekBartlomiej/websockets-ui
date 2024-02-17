import { players } from "./in-memory-db";
import { TYPE } from "./models/command-types";
import { RoomUser, UpdateRoom } from "./models/rooms.model";
import { UUID, randomUUID } from "crypto";

const rooms: Map<UUID, RoomUser[]> = new Map();

export const toUpdateRooms = (): string => {
  return JSON.stringify({
    type: TYPE.UPDATE_ROOM,
    data: JSON.stringify(
      Array.from(rooms, ([uuid, users]) => ({ uuid, roomUsers: users }))
    ),
    id: 0,
  } as UpdateRoom);
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
