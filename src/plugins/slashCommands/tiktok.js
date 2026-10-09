import {
    ApplicationCommandOptionType,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} from "discord.js";

export const Slash = {
    name: "tiktok",
    description: "Mengunduh video dari TikTok.",
    options: [{
        name: "query",
        description: "Url/Link TikTok",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    run: async (client, interaction) => {
        // 1. Defer immediately because Pixiv API calls take time
        try {
            const text = interaction.options.getString("query");
            client.commands.get("tiktok").run(client, interaction, [text])
        } catch (error) {
            console.error(error);
            const errContent = {
                content: `Error: ${error.message || error}`,
                ephemeral: true
            };
            interaction.deferred ? await interaction.editReply(errContent) : await interaction.reply(errContent);
        }
    }
};
