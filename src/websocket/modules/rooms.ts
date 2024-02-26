import { players } from "./player";
import { TYPE } from "../models/command-types";
import { Response } from "../models/response.model";
import {
  AddUserToRoom,
  UpdateRoom,
  RoomUser,
  CreateGame,
  AddShips,
  Ship,
  StartGame,
} from "../models/rooms.model";
import { UUID, randomUUID } from "crypto";

export const rooms: Map<UUID, RoomUser[]> = new Map();
export const games: Map<UUID, [UUID, UUID]> = new Map();
export const ships: Map<UUID, Map<UUID, Ship[]>> = new Map();
export const gamesPerRooms: Map<UUID, UUID> = new Map();

export const setGamesPerRooms = (roomId: UUID, gameId: UUID): void => {
  gamesPerRooms.set(gameId, roomId);
}

export const updateRoomsList = (gameId: UUID): void => {
  const roomId = gamesPerRooms.get(gameId)!;
  gamesPerRooms.delete(gameId);
  rooms.delete(roomId);
}


export const toUpdateRooms = (): string => {
  return JSON.stringify({
    type: TYPE.UPDATE_ROOM,
    data: JSON.stringify(
      Array.from(
        rooms,
        ([uuid, users]) => ({ roomId: uuid, roomUsers: users } as UpdateRoom)
      )
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
  return (JSON.parse(data) as AddUserToRoom).indexRoom;
};

//TODO: create one method where you use type and data
export const toCreateGame = (playerId: UUID, gameId: UUID): CreateGame => {
  return {
    idPlayer: playerId,
    idGame: gameId,
  };
};

export const saveGame = (gameId: UUID, players: [UUID, UUID]): void => {
  games.set(gameId, players);
};

export const toGameId = (data: string): UUID => {
  return (JSON.parse(data) as AddShips).gameId;
};

export const saveShips = (
  gameId: UUID,
  playerId: UUID,
  playerShips: Ship[]
): void => {
  let gameMap = ships.get(gameId);
  if (!gameMap) {
    gameMap = new Map();
    ships.set(gameId, gameMap);
  }
  gameMap.set(playerId, playerShips);
};

export const toShips = (data: string): Ship[] => {
  return (JSON.parse(data) as AddShips).ships;
}

export const toStartGame = (playerId: UUID, ships: Ship[]): StartGame => {
  return {
    ships,
    currentPlayerIndex: playerId
  }
}
