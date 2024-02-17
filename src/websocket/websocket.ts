import { RawData, WebSocket, WebSocketServer } from 'ws';
//TODO: change the name of file to players
import { toReg, players } from '../in-memory-db';
import { UUID, randomUUID } from 'crypto';
import { TYPE } from '../models/command-types';
import { addUserToRoom, createRoom, toUpdateRooms } from '../rooms';

const wss = new WebSocketServer({ port: 3000 });

const connections: {[id: UUID]: WebSocket} = {};

wss.on('connection', function connection(ws) {
    const userId = randomUUID();
    connections[userId] = ws;

    connections[userId].on('error', console.error);

    connections[userId].on('message', function message(data: RawData) {
        const parsedData = JSON.parse(data.toString());
        if (parsedData.type === TYPE.REG) {
            const reg = toReg(parsedData, userId);
            ws.send(JSON.stringify(reg));
            const updateRooms = toUpdateRooms();
            ws.send(updateRooms);
        } if (parsedData.type === TYPE.CREATE_ROOM) {
            const roomId = createRoom();
            addUserToRoom(roomId, userId);
            const updateRooms = toUpdateRooms();
            ws.send(updateRooms);
        }
    });
});