import {
    ApplicationCommandOptionType,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} from "discord.js";
import yts from 'yt-search';
import {
    getVoiceConnection,
    createAudioResource,
    createAudioPlayer
} from "@discordjs/voice";
// ... (imports remain the same)

export const Slash = {
    name: "play",
    description: "Play or download music from YouTube",
    options: [{
        name: "query",
        description: "The name or URL of the song",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    // Changed order to (client, interaction) to match your SlashManager
    run: async (client, interaction) => {
        await interaction.deferReply();
        try {
            const text = interaction.options.getString("query");
            let search = await yts(text);
            let vid = (search.videos.length > 0) ? search.videos[0] : null;

            if (!vid) return await interaction.editReply({
                content: 'Video tidak tersedia.'
            });

            const playBT = new ButtonBuilder().setCustomId("play").setLabel("Download").setStyle(ButtonStyle.Primary).setEmoji("📥");
            const row = new ActionRowBuilder().addComponents(playBT);

            const embed = new EmbedBuilder()
                .setImage(vid.thumbnail)
                .setTitle(vid.title)
                .setDescription(`🔥 Views: ${vid.views}\n🕒 Duration: ${vid.timestamp}\n🔗 Link: ${vid.url}`)
                .setFooter({
                    text: `Requested by ${interaction.user.username}`
                });

            let msg = await interaction.editReply({
                embeds: [embed],
                components: [row]
            });

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({
                filter,
                time: 60000
            });

            collector.on('collect', async (i) => {
                // Important: Defer the button click so it doesn't time out
                await i.deferUpdate();

                if (i.customId === "play") {
                    playBT.setDisabled(true);
                    // Use interaction.editReply to update the buttons
                    await interaction.editReply({
                        components: [new ActionRowBuilder().addComponents(playBT, playinvcBT)]
                    });

                    // Use interaction.channel instead of message.channel
                    await interaction.channel.sendTyping();

                    const audio = await global.toAudioYt(vid.url);

                    // Use followUp to send the file after the initial reply
                    await interaction.followUp({
                        content: "Here is your Song.",
                        files: [{
                            attachment: audio.filepath,
                            name: vid.title + ".mp3"
                        }]
                    });
                }
            });
        } catch (error) {
            console.error(error);
            // Handle errors using editReply since we deferred at the start
            if (interaction.deferred) {
                await interaction.editReply({
                    content: "An error occurred."
                });
            }
        }
    }
};