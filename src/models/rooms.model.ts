import { UUID } from "crypto";
import { TYPE } from "./command-types";

export interface UpdateRoom {
  type: TYPE.UPDATE_ROOM;
  data: [
    {
      roomId: UUID;
      roomUsers: [
        {
          name: string;
          index: UUID;
        }
      ];
    }
  ];
  id: 0;
}
