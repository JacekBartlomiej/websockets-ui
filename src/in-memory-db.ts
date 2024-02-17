
import { UUID, randomUUID } from 'crypto';

export const players = new Map();
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
const savePlayer = (data: { name: string, password: string }, index: UUID) => players.set(index, { name: data.name, password: data.password });
export const setUpPlayer = (playerInput: any) => {
    const index = randomUUID();
    savePlayer(JSON.parse(playerInput.data), index);
    return toPlayerResponse(index, playerInput);
}
