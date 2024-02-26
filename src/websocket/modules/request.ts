import { TYPE } from "../models/command-types";
import { AttackFeedback, Finish, Turn, UpdateWinner } from "../models/game.model";
import { Response } from "../models/response.model";
import { AddUserToRoom, CreateGame, StartGame, UpdateRoom } from "../models/rooms.model";

export type RequestData = UpdateRoom | AddUserToRoom | CreateGame | StartGame | AttackFeedback | Turn | Finish | UpdateWinner[];

export type Request = Response;

export const toRequest = (type: TYPE, data: RequestData): string =>
  JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0,
  } as Request);
