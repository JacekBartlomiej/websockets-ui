
import { UUID } from 'crypto';
import { PlayerBase } from './models/players.model';

export const players: Map<UUID, PlayerBase> = new Map();
//TODO: add response type
const toPlayerResponse = (index: UUID, playerInput: any) => {
    const parsedData = JSON.parse(playerInput.data);
    return ({
        ...playerInput,
        data: JSON.stringify({
            name: parsedData.name,
            index
        })
    })
}

const savePlayer = (data: { name: string, password: string }, index: UUID): Map<UUID, PlayerBase> => players.set(index, { name: data.name, password: data.password });

//TODO: add response type
export const setUpPlayer = (playerInput: any, index: UUID) => {
    savePlayer(JSON.parse(playerInput.data), index);
    return toPlayerResponse(index, playerInput);
}
