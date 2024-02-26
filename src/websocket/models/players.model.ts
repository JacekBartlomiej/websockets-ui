import { UUID } from "crypto";

export interface PlayerBase {
  name: string;
  password: string;
}

export interface Player extends PlayerBase {
  index: UUID;
}
