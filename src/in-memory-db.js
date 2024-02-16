

export const players = new Map();
export const arePlayersSetUp = () => players.size === 2;
export const setUpPlayer = ({ name, password, id }) => players.set(id, { name, password });
