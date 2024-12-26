export interface Server {
  id: number;
  name: string;
  image: string;
}

export const servers: Server[] = [
  { id: 1, name: "BL4CKLIST", image: "https://cdn.discordapp.com/icons/616655040614236160/a_b324dc6561660fd147e1cb7e04086b65.gif?size=64" },
  { id: 2, name: "Test-Server", image: "https://cdn.discordapp.com/icons/787672220503244800/53fb0a8ba438e4a2420e0a8b7ea2c179.png?size=64" },
  { id: 3, name: "Global-Team", image: "https://cdn.discordapp.com/icons/671065574821986348/313528b52bc81e964c3bd6c1bb406b9b.png?size=64" }
]
