import {
    ApplicationCommandOptionType,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} from "discord.js";
import {
    Pixiv
} from '@ibaraki-douji/pixivts';

export const Slash = {
    name: "pixivdl",
    description: "Mencari gambar character dari Pixiv",
    options: [{
        name: "query",
        description: "ID or URL illustration",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    run: async (client, interaction) => {
        // 1. Defer immediately because Pixiv API calls take time
        //await interaction.deferReply();

        try {
            const text = interaction.options.getString("query");
            client.commands.get("pixivdl").run(client, interaction, [text])
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
