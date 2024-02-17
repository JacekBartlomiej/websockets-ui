
import { UUID, randomUUID } from 'crypto';

//TODO: add Map type
export const players = new Map();
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
//TODO: add response type
const savePlayer = (data: { name: string, password: string }, index: UUID) => players.set(index, { name: data.name, password: data.password });
//TODO: add response type
export const setUpPlayer = (playerInput: any) => {
    const index = randomUUID();
    savePlayer(JSON.parse(playerInput.data), index);
    return toPlayerResponse(index, playerInput);
}
