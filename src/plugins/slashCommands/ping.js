export const Slash = {
    name: "ping",
    description: "Pong",
    run: async (client, interaction) => {
        await client.commands.get("ping").run(client, interaction)
    }
}; // Simple /Ping command