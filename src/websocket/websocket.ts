import { RawData, WebSocketServer } from 'ws';
//TODO: change the name of file to players
import { setUpPlayer, players } from '../in-memory-db';

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', function connection(ws) {

    ws.on('error', console.error);

    ws.on('message', function message(data: RawData) {
        const parsedData = JSON.parse(data.toString());
        if (parsedData.type === 'reg') {
            const playerResponse = setUpPlayer(parsedData);
            console.log('players.size', players.size);
            ws.send(JSON.stringify(playerResponse));
        }
    });
});