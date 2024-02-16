
import { randomUUID } from 'crypto';

export const players = new Map();
const toPlayerResponse = (index, playerInput) => {
    const parsedData = JSON.parse(playerInput.data);
    return ({
        ...playerInput,
        data: JSON.stringify({
            name: parsedData.name,
            password: parsedData.password,
            index
        })
    })
}
const savePlayer = ({ name, password}, index) => players.set(index, { name, password });
export const setUpPlayer = (playerInput) => {
    const index = randomUUID();
    savePlayer(JSON.parse(playerInput.data), index);
    return toPlayerResponse(index, playerInput)
}
