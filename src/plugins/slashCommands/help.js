export const Slash = {
    name: "help",
    description: "List command this Client",
    run: (client, interaction) => {
        client.commands.get("help").run(client, interaction)
    }
}