import { RawData, WebSocket, WebSocketServer } from "ws";
//TODO: change the name of file to players
import { toReg, players } from "./modules/player";
import { UUID, randomUUID } from "crypto";
import { TYPE } from "./models/command-types";
import {
  addUserToRoom,
  createRoom,
  games,
  rooms,
  saveGame,
  saveShips,
  setGamesPerRooms,
  ships,
  toCreateGame,
  toGameId,
  toRoomId,
  toShips,
  toStartGame,
  toUpdateRooms,
  updateRoomsList,
} from "./modules/rooms";
import { Response } from "./models/response.model";
import { toRequest } from "./modules/request";
import { RoomUser } from "./models/rooms.model";
import { ATTACK_STATUS, Attack, RandomAttack } from "./models/game.model";
import {
  AllUsersSender,
  PlayersSender,
  allShipsKilled,
  cellWasNotAttacked,
  gamesTurn,
  randomAttackToAttack,
  saveGameProgress,
  setUpGameFields,
  switchGameTurn,
  toAllCellsAroundShipCoordinates,
  toAttack,
  toAttackFeedback,
  toFinish,
  toRandomCoordinate,
  toTurn,
  toUpdateWinners,
  updateGameField,
  updateGameProgress,
  updateWinnersList,
} from "./modules/game";

const wss = new WebSocketServer({ port: 3000 });

const connections: { [id: UUID]: WebSocket } = {};

const allUsersSender = new AllUsersSender(connections);

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
    if (parsedData.type === TYPE.ATTACK) {
      handleAttack(parsedData, userId);
    }
    if (parsedData.type === TYPE.RANDOM_ATTACK) {
      handleRandomAttack(parsedData, userId);
    }
  });
});

const handleReg = (ws: WebSocket, parsedData: Response, userId: UUID): void => {
  const reg = toReg(parsedData, userId);
  ws.send(JSON.stringify(reg));
  const updateRooms = toUpdateRooms();
  const updateWinners = toRequest(TYPE.UPDATE_WINNERS, toUpdateWinners());
  allUsersSender.send(updateRooms);
  allUsersSender.send(updateWinners);
};

const handleCreateRoom = (ws: WebSocket, userId: UUID): void => {
  const roomId = createRoom();
  addUserToRoom(roomId, userId);
  const updateRooms = toUpdateRooms();
  const updateWinners = toRequest(TYPE.UPDATE_WINNERS, toUpdateWinners());
  allUsersSender.send(updateRooms);
  allUsersSender.send(updateWinners);
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
    allUsersSender.send(updateRooms);
    if (roomUsers.length === 2) {
      const gameId = randomUUID();
      saveGame(
        gameId,
        roomUsers.map((roomUser) => roomUser.index) as [UUID, UUID]
      );
      setUpGameFields(
        gameId,
        roomUsers.map((roomUser) => roomUser.index) as [UUID, UUID]
      );
      setGamesPerRooms(roomId, gameId);
      roomUsers.forEach(({ index }) => {
        const createGame = toRequest(
          TYPE.CREATE_GAME,
          toCreateGame(index, gameId)
        );
        connections[index].send(createGame);
      });
    }
  } else {
    console.error("There can be maximum 2 players in one room");
  }
};

const handleAddShips = (ws: WebSocket, parsedData: Response, userId: UUID) => {
  const gameId = toGameId(parsedData.data);
  const playerShips = toShips(parsedData.data);
  saveShips(gameId, userId, playerShips);
  saveGameProgress(gameId, ships);
  if (ships.get(gameId)?.size === 2) {
    const players: [UUID, UUID] = games.get(gameId)!;
    switchGameTurn(gameId, userId);
    players.forEach((playerId) => {
      const playerShips = ships.get(gameId)?.get(playerId)!;
      const startGame = toRequest(
        TYPE.START_GAME,
        toStartGame(playerId, playerShips)
      );
      connections[playerId].send(startGame);
      const turn = toRequest(TYPE.TURN, toTurn(userId));
      connections[playerId].send(turn);
    });
  }
};

const handleAttack = (parsedData: Response, userId: UUID) => {
  const gameId = toGameId(parsedData.data);
  if (gamesTurn.get(gameId) === userId) {
    const attack = toAttack(parsedData.data);
    const players: [UUID, UUID] = games.get(attack.gameId)!;
    const playersSender: PlayersSender = new PlayersSender(
      connections,
      players
    );
    const otherPlayerId = players.find(
      (playerId) => playerId !== attack.indexPlayer
    )!;
    if (cellWasNotAttacked(parsedData.data, otherPlayerId)) {
      updateGameField(gameId, otherPlayerId, { x: attack.x, y: attack.y });
      const attackStatus = updateGameProgress(attack);
      const attackFeedback = toRequest(
        TYPE.ATTACK,
        toAttackFeedback(attack, attackStatus)
      );
      playersSender.send(attackFeedback);
      if (attackStatus === ATTACK_STATUS.KILLED) {
        handleKilled(gameId, otherPlayerId, attack, playersSender, userId);
      }
      const currendPlayerMissed = attackStatus === ATTACK_STATUS.MISS;
      const nextPlayer = currendPlayerMissed
        ? otherPlayerId
        : attack.indexPlayer;
      switchGameTurn(attack.gameId, nextPlayer);
      const turn = toRequest(TYPE.TURN, toTurn(nextPlayer));
      playersSender.send(turn);
    }
  }
};

const handleRandomAttack = (parsedData: Response, userId: UUID) => {
  const gameId = toGameId(parsedData.data);
  const players: [UUID, UUID] = games.get(gameId)!;
  const otherPlayerId = players.find((playerId) => playerId !== userId)!;
  const randomCoordinate = toRandomCoordinate(gameId, otherPlayerId);
  const newData = randomAttackToAttack(parsedData, randomCoordinate);
  console.log("newData", newData);
  handleAttack(newData, userId);
};

const handleEndGame = (
  playersSender: PlayersSender,
  userId: UUID,
  gameId: UUID
) => {
  const finish = toRequest(TYPE.FINISH, toFinish(userId));
  playersSender.send(finish);
  updateWinnersList(userId);
  const updateWinners = toRequest(TYPE.UPDATE_WINNERS, toUpdateWinners());
  allUsersSender.send(updateWinners);
  updateRoomsList(gameId);
  const updateRooms = toUpdateRooms();
  allUsersSender.send(updateRooms);
};

const handleKilled = (
  gameId: UUID,
  otherPlayerId: UUID,
  attack: Attack,
  playersSender: PlayersSender,
  userId: UUID
) => {
  const allCellsAroundShipCoordinates = toAllCellsAroundShipCoordinates(attack);
  allCellsAroundShipCoordinates.forEach((coordinate) => {
    updateGameField(gameId, otherPlayerId, coordinate);
    const attackFeedback = toRequest(
      TYPE.ATTACK,
      toAttackFeedback(
        { ...attack, x: coordinate.x, y: coordinate.y },
        ATTACK_STATUS.MISS
      )
    );
    playersSender.send(attackFeedback);
  });
  if (allShipsKilled(gameId, otherPlayerId)) {
    handleEndGame(playersSender, userId, gameId);
    return;
  }
};
