import { WebSocketServer } from 'ws';
import { setUpPlayer, players } from '../in-memory-db.js';

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', function connection(ws) {

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'reg') {
            const playerResponse = setUpPlayer(parsedData);
            console.log('players.size', players.size);
            ws.send(JSON.stringify(playerResponse));
        }
    });
});