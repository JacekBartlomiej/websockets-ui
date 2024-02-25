import { UUID } from "crypto";
import {
  ATTACK_STATUS,
  Attack,
  AttackFeedback,
  Coordinate,
  CoordinateStatus,
  Finish,
  RandomAttack,
  Turn,
} from "../models/game.model";
import { Ship } from "../models/rooms.model";
import { toGameId } from "./rooms";
import { Response } from "../models/response.model";

export const gamesProgress: Map<
  UUID,
  Map<UUID, CoordinateStatus[][]>
> = new Map();
export const gamesTurn: Map<UUID, UUID> = new Map();
export const gamesAvailableCells: Map<
  UUID,
  Map<UUID, Coordinate[]>
> = new Map();

export const switchGameTurn = (gameId: UUID, playerId: UUID): void => {
  gamesTurn.set(gameId, playerId);
};

export const toAttack = (attackString: string): Attack =>
  JSON.parse(attackString);

export const updateGameProgress = (attack: Attack): ATTACK_STATUS => {
  const hitCoordinate = { x: attack.x, y: attack.y };
  const attackedShips = toAttackedShips(attack, gamesProgress);
  const shotShip = attackedShips.find((ship) =>
    isShipShot(hitCoordinate, ship)
  );
  if (shotShip) {
    markShipAsShot(hitCoordinate, shotShip);
    const shipKilled = isShipKilled(shotShip);
    if (shipKilled) {
      return ATTACK_STATUS.KILLED;
    } else {
      return ATTACK_STATUS.SHOT;
    }
  }
  return ATTACK_STATUS.MISS;
};

const toAttackedShips = (
  attack: Attack,
  gamesProgress: Map<UUID, Map<UUID, CoordinateStatus[][]>>
): CoordinateStatus[][] =>
  Array.from(gamesProgress.get(attack.gameId)!).find(
    ([playerId, ships]) => playerId !== attack.indexPlayer
  )![1];

export const toAttackFeedback = (
  attack: Attack,
  attackStatus: ATTACK_STATUS
): AttackFeedback => {
  return {
    position: {
      x: attack.x,
      y: attack.y,
    },
    currentPlayer: attack.indexPlayer,
    status: attackStatus,
  };
};

export const toTurn = (playerId: UUID): Turn => {
  return {
    currentPlayer: playerId,
  };
};

export const saveGameProgress = (
  gameId: UUID,
  ships: Map<UUID, Map<UUID, Ship[]>>
): void => {
  const gameShips = ships.get(gameId)!;
  const gameProgress = toGameProgress(gameShips);
  gamesProgress.set(gameId, gameProgress);
};

export const toGameProgress = (
  gameShips: Map<UUID, Ship[]>
): Map<UUID, CoordinateStatus[][]> => {
  return new Map(
    Array.from(gameShips).map(([userId, ships]) => [
      userId,
      ships.map((ship) => toShipStatus(toShipCoordinates(ship))),
    ])
  );
};

const toShipCoordinates = (ship: Ship): Coordinate[] => {
  const coordinates = [{ x: ship.position.x, y: ship.position.y }];
  for (let i = 1; i < ship.length; i++) {
    if (ship.direction) {
      coordinates.push({ x: ship.position.x, y: ship.position.y + i });
    } else {
      coordinates.push({ x: ship.position.x + i, y: ship.position.y });
    }
  }
  return coordinates;
};

const toShipStatus = (shipCoordinates: Coordinate[]): CoordinateStatus[] => {
  return shipCoordinates.map((coordinate) => ({ ...coordinate, shot: false }));
};

const toPlayerShipsStatus = (
  gameId: UUID,
  playerId: UUID,
  gamesProgress: Map<UUID, Map<UUID, CoordinateStatus[][]>>
): CoordinateStatus[][] => {
  return gamesProgress.get(gameId)!.get(playerId)!;
};

const markShipAsShot = (
  coordinate: Coordinate,
  shipStatus: CoordinateStatus[]
): CoordinateStatus[] => {
  const hitCoordinate = shipStatus.find(
    (coordinateStatus) =>
      coordinateStatus.x === coordinate.x && coordinateStatus.y === coordinate.y
  )!;
  hitCoordinate.shot = true;
  return shipStatus;
};

const isShipShot = (
  hitCoordinate: Coordinate,
  shipCoordinates: Coordinate[]
): Coordinate | undefined => {
  return shipCoordinates.find(
    (coordinate) =>
      coordinate.x === hitCoordinate.x && coordinate.y === hitCoordinate.y
  );
};

const isShipKilled = (shipStatus: CoordinateStatus[]): boolean => {
  return shipStatus.every((coordinateStatus) => coordinateStatus.shot);
};

export const toAllCellsAroundShipCoordinates = (
  attack: Attack
): Coordinate[] => {
  const hitCoordinate = { x: attack.x, y: attack.y };
  const attackedShips = toAttackedShips(attack, gamesProgress);
  const shotShip = attackedShips.find((ship) =>
    isShipShot(hitCoordinate, ship)
  )!;
  const shipDirection = shotShip.length > 1 && shotShip[0].y !== shotShip[1].y;
  let coordinates: Coordinate[] = [];
  if (shipDirection) {
    if (shotShip[0].x > 0) {
      const leftBorderCoordinates = shotShip.map((coordinateStatus) => ({
        x: coordinateStatus.x - 1,
        y: coordinateStatus.y,
      }))!;
      coordinates = [...coordinates, ...leftBorderCoordinates];
    }
    if (shotShip[0].x < 9) {
      const rightBorderCoordinates = shotShip.map((coordinateStatus) => ({
        x: coordinateStatus.x + 1,
        y: coordinateStatus.y,
      }))!;
      coordinates = [...coordinates, ...rightBorderCoordinates];
    }
    if (shotShip[0].y > 0) {
      const topBorderCoordinate = { x: shotShip[0].x, y: shotShip[0].y - 1 };
      coordinates = [...coordinates, topBorderCoordinate];
    }
    if (shotShip[shotShip.length - 1].y < 9) {
      const bottomBorderCoordinate = {
        x: shotShip[0].x,
        y: shotShip[shotShip.length - 1].y + 1,
      };
      coordinates = [...coordinates, bottomBorderCoordinate];
    }
    if (shotShip[0].x > 0 && shotShip[0].y > 0) {
      coordinates = [
        ...coordinates,
        { x: shotShip[0].x - 1, y: shotShip[0].y - 1 },
      ];
    }
    if (shotShip[0].x < 9 && shotShip[0].y > 0) {
      coordinates = [
        ...coordinates,
        { x: shotShip[0].x + 1, y: shotShip[0].y - 1 },
      ];
    }
    if (shotShip[0].x > 0 && shotShip[shotShip.length - 1].y < 9) {
      coordinates = [
        ...coordinates,
        { x: shotShip[0].x - 1, y: shotShip[shotShip.length - 1].y + 1 },
      ];
    }
    if (shotShip[0].x < 9 && shotShip[shotShip.length - 1].y < 9) {
      coordinates = [
        ...coordinates,
        { x: shotShip[0].x + 1, y: shotShip[shotShip.length - 1].y + 1 },
      ];
    }
  } else {
    if (shotShip[0].y > 0) {
      const topBorderCoordinates = shotShip.map((coordinateStatus) => ({
        x: coordinateStatus.x,
        y: coordinateStatus.y - 1,
      }))!;
      coordinates = [...coordinates, ...topBorderCoordinates];
    }
    if (shotShip[0].y < 9) {
      const bottomBorderCoordinates = shotShip.map((coordinateStatus) => ({
        x: coordinateStatus.x,
        y: coordinateStatus.y + 1,
      }))!;
      coordinates = [...coordinates, ...bottomBorderCoordinates];
    }
    if (shotShip[0].x > 0) {
      const leftBorderCoordinate = { x: shotShip[0].x - 1, y: shotShip[0].y };
      coordinates = [...coordinates, leftBorderCoordinate];
    }
    if (shotShip[shotShip.length - 1].x < 9) {
      const rightBorderCoordinate = {
        x: shotShip[shotShip.length - 1].x + 1,
        y: shotShip[0].y,
      };
      coordinates = [...coordinates, rightBorderCoordinate];
    }
    if (shotShip[0].x > 0 && shotShip[0].y > 0) {
      coordinates = [
        ...coordinates,
        { x: shotShip[0].x - 1, y: shotShip[0].y - 1 },
      ];
    }
    if (shotShip[shotShip.length - 1].x < 9 && shotShip[0].y > 0) {
      coordinates = [
        ...coordinates,
        { x: shotShip[shotShip.length - 1].x + 1, y: shotShip[0].y - 1 },
      ];
    }
    if (shotShip[shotShip.length - 1].x < 9 && shotShip[0].y < 9) {
      coordinates = [
        ...coordinates,
        { x: shotShip[shotShip.length - 1].x + 1, y: shotShip[0].y + 1 },
      ];
    }
    if (shotShip[0].x > 0 && shotShip[0].y < 9) {
      coordinates = [
        ...coordinates,
        { x: shotShip[0].x - 1, y: shotShip[0].y + 1 },
      ];
    }
  }
  return coordinates;
};

const toGameField = (): Array<Coordinate> => {
  const gameField: Array<Coordinate> = [];
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      gameField.push({ x, y });
    }
  }
  return gameField;
};

export const setUpGameFields = (gameId: UUID, players: [UUID, UUID]): void => {
  const playersFields = new Map(
    players.map((playerId) => [playerId, toGameField()])
  );
  gamesAvailableCells.set(gameId, playersFields);
};

export const updateGameField = (
  gameId: UUID,
  playerId: UUID,
  coordinate: Coordinate
): void => {
  const gameField = gamesAvailableCells.get(gameId)?.get(playerId)!;
  const newGameField = gameField.filter(
    (cell) => !(cell.x === coordinate.x && cell.y === coordinate.y)
  );
  gamesAvailableCells.get(gameId)?.set(playerId, newGameField);
};

export const toRandomCoordinate = (
  gameId: UUID,
  playerId: UUID
): Coordinate => {
  const gameField = gamesAvailableCells.get(gameId)?.get(playerId)!;
  const random = Math.floor(Math.random() * gameField.length);
  const randomCoordinate = JSON.parse(JSON.stringify(gameField[random]));
  return randomCoordinate;
};

export const randomAttackToAttack = (
  parsedData: Response,
  coordinate: Coordinate
): Response => {
  const newData = JSON.stringify({
    ...(JSON.parse(parsedData.data) as RandomAttack),
    ...coordinate,
  });
  parsedData.data = newData;
  return parsedData;
};

export const cellWasNotAttacked = (data: string, otherPlayerId: UUID): boolean => {
  const { gameId, x, y } = JSON.parse(data) as Attack;
  const gameField = gamesAvailableCells.get(gameId)?.get(otherPlayerId)!;
  return gameField.some((cell) => cell.x === x && cell.y === y);
};

export const toFinish = (playerId: UUID): Finish => {
  return {
    winPlayer: playerId,
  };
};

export const allShipsKilled = (gameId: UUID, otherPlayerId: UUID): boolean => {
  return gamesProgress
    .get(gameId)!
    .get(otherPlayerId)!
    .flat()
    .every((coordinateStatus) => coordinateStatus.shot);
};
