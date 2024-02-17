import { RawData, WebSocket, WebSocketServer } from 'ws';
//TODO: change the name of file to players
import { setUpPlayer, players } from '../in-memory-db';
import { UUID, randomUUID } from 'crypto';
import { TYPE } from '../models/command-types';

const wss = new WebSocketServer({ port: 3000 });

const connections: {[id: UUID]: WebSocket} = {};

wss.on('connection', function connection(ws) {
    const id = randomUUID();
    connections[id] = ws;

    connections[id].on('error', console.error);

    connections[id].on('message', function message(data: RawData) {
        const parsedData = JSON.parse(data.toString());
        if (parsedData.type === TYPE.REG) {
            const playerResponse = setUpPlayer(parsedData, id);
            ws.send(JSON.stringify(playerResponse));
        } if (parsedData.type === TYPE.CREATE_ROOM) {
            const playerName = players.get(id)?.name;
            console.log(`Player ${playerName} created room`)
        }
    });
});