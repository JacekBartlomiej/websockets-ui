import { RawData, WebSocket, WebSocketServer } from "ws";
//TODO: change the name of file to players
import { toReg, players } from "../in-memory-db";
import { UUID, randomUUID } from "crypto";
import { TYPE } from "../models/command-types";
import {
  addUserToRoom,
  createRoom,
  games,
  rooms,
  saveGame,
  saveShips,
  ships,
  toCreateGame,
  toGameId,
  toRoomId,
  toShips,
  toStartGame,
  toUpdateRooms,
} from "../rooms";
import { Response } from "../models/response.model";
import { toRequest } from "../request";
import { RoomUser } from "../models/rooms.model";

const wss = new WebSocketServer({ port: 3000 });

const connections: { [id: UUID]: WebSocket } = {};

wss.on("connection", function connection(ws) {
  const userId = randomUUID();
  connections[userId] = ws;

  connections[userId].on("error", console.error);

  connections[userId].on("message", function message(data: RawData) {
    const parsedData: Response = JSON.parse(data.toString());
    if (parsedData.type === TYPE.REG) {
      handleReg(ws, parsedData, userId);
    }
    if (parsedData.type === TYPE.CREATE_ROOM) {
      handleCreateRoom(ws, userId);
    }
    if (parsedData.type === TYPE.ADD_USER_TO_ROOM) {
      handleAddUserToRoom(ws, parsedData, userId);
    }
    if (parsedData.type === TYPE.ADD_SHIPS) {
      handleAddShips(ws, parsedData, userId);
    }
  });
});

const handleReg = (ws: WebSocket, parsedData: Response, userId: UUID): void => {
  const reg = toReg(parsedData, userId);
  ws.send(JSON.stringify(reg));
  const updateRooms = toUpdateRooms();
  ws.send(updateRooms);
};

const handleCreateRoom = (ws: WebSocket, userId: UUID): void => {
  const roomId = createRoom();
  addUserToRoom(roomId, userId);
  const updateRooms = toUpdateRooms();
  ws.send(updateRooms);
};

const handleAddUserToRoom = (
  ws: WebSocket,
  parsedData: Response,
  userId: UUID
): void => {
  const roomId = toRoomId(parsedData.data);
  const roomUsers: RoomUser[] = rooms.get(roomId)!;
  if (roomUsers.length < 2) {
    addUserToRoom(roomId, userId);
    const updateRooms = toUpdateRooms();
    ws.send(updateRooms);
    if (roomUsers.length === 2) {
      const gameId = randomUUID();
      const createGame = toRequest(
        TYPE.CREATE_GAME,
        toCreateGame(userId, gameId)
      );
      saveGame(
        gameId,
        roomUsers.map((roomUser) => roomUser.index) as [UUID, UUID]
      );
      roomUsers.forEach(({ index }) => connections[index].send(createGame));
    }
  } else {
    console.error("There can be maximum 2 players in one room");
  }
};

const handleAddShips = (ws: WebSocket, parsedData: Response, userId: UUID) => {
  const gameId = toGameId(parsedData.data);
  const playerShips = toShips(parsedData.data);
  saveShips(gameId, userId, playerShips);
  if (ships.get(gameId)?.size === 2) {
    const players: [UUID, UUID] = games.get(gameId)!;
    players.forEach((playerId) => {
      const playerShips = ships.get(gameId)?.get(playerId)!;
      const startGame = toRequest(
        TYPE.START_GAME,
        toStartGame(playerId, playerShips)
      );
      connections[playerId].send(startGame);
    });
  }
};
