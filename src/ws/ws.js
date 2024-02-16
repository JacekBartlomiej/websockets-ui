import { WebSocketServer } from 'ws';
import { arePlayersSetUp, setUpPlayer, players } from '../in-memory-db.js';

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', function connection(ws) {
    
    console.log(players.size);
    console.log('tu!');
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);
        console.log(arePlayersSetUp());
        setUpPlayer(data);
        console.log(players.size);
        console.log(arePlayersSetUp());
    });
});