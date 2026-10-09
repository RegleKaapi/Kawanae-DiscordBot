import {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} from "discord.js";
import yts from 'yt-search';
import {
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection
} from "@discordjs/voice";

export const MsgCommand = {
    name: "play",
    usage: "<title | url>",
    tags: "downloader",
    description: "Search and play or download music from YouTube",
    aliases: ["play", "lagu"],
    run: async (client, message, args, text) => {
        if (!text) {
            return message.reply({
                content: "Contoh: `.play middle of night`",
                allowedMentions: {
                    repliedUser: false
                }
            });
        }

        try {
            // Search on YouTube
            const search = await yts(text);
            const vid = search.videos.length > 0 ? search.videos[0] : null;

            if (!vid) {
                return message.reply({
                    content: 'Video tidak ditemukan, coba kata kunci atau URL lain.',
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            // Define Buttons
            const playBT = new ButtonBuilder()
                .setCustomId("play")
                .setLabel("Download")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("📥");

            const dlCoverBT = new ButtonBuilder()
                .setCustomId("play_cover")
                .setLabel("Download + Cover")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🖼️");

            const playinvcBT = new ButtonBuilder()
                .setCustomId("playinvoice")
                .setLabel("Play in Voice")
                .setStyle(ButtonStyle.Success)
                .setEmoji("▶️");

            // Attach ALL three buttons to the ActionRow
            const row = new ActionRowBuilder().addComponents(playBT, dlCoverBT, playinvcBT);

            // Construct Embed
            const embed = new EmbedBuilder()
                .setImage(vid.thumbnail)
                .setColor(global.DefaultColor || "#FF0000")
                .setTimestamp()
                .setTitle(vid.title)
                .setDescription(`🔥 Views: ${vid.views.toLocaleString()}\n🕒 Duration: ${vid.timestamp}\n🌀 Uploaded: ${vid.ago}\n🔗 Link: ${vid.url}`)
                .setAuthor({
                    name: vid.author.name,
                    iconURL: client.user.displayAvatarURL()
                })
                .setFooter({
                    text: `Requested by ${message.member?.displayName || message.author.username}`,
                    iconURL: message.author.displayAvatarURL({
                        dynamic: true
                    })
                });

            const msg = await message.reply({
                embeds: [embed],
                components: [row],
                allowedMentions: {
                    repliedUser: false
                }
            });

            // Filter for collector
            const filter = (i) => {
                if (i.user.id !== message.author.id) {
                    i.reply({
                        content: 'Anda tidak memiliki akses untuk menekan tombol ini.',
                        ephemeral: true
                    });
                    return false;
                }
                return true;
            };

            const collector = msg.createMessageComponentCollector({
                filter,
                time: 60 * 1000 // 1 minute
            });

            collector.on('collect', async (interaction) => {
                await interaction.deferUpdate();

                // Standard Download (No Metadata/Cover)
                if (interaction.customId === "play") {
                    playBT.setDisabled(true);
                    dlCoverBT.setDisabled(true);
                    await msg.edit({
                        components: [row]
                    });
                    await message.channel.sendTyping();

                    try {
                        const audio = await global.toAudioYt(vid.url);
                        await addMp3(audio.filepath, vid.title, vid.author.name, "~~by Kanako-Bot");
                        
                        await msg.edit({
                            content: "Berikut lagu Anda:",
                            files: [{
                                attachment: audio.filepath,
                                name: `${vid.title}.mp3`
                            }],
                            allowedMentions: {
                                repliedUser: false
                            }
                        });
                    } catch (err) {
                        console.error("Download Error:", err);
                        await message.channel.send("Gagal mengunduh lagu.");
                    }
                }

                // Download with Thumbnail / Cover Metadata
                if (interaction.customId === "play_cover") {
                    playBT.setDisabled(true);
                    dlCoverBT.setDisabled(true);
                    await msg.edit({
                        components: [row]
                    });
                    await message.channel.sendTyping();

                    try {
                        const thum = (await conn.getFile(vid.thumbnail)).filename;
                        await cropToSquare(thum, thum);

                        const audio = await global.toAudioYt(vid.url);
                        await addMp3(audio.filepath, vid.title, vid.author.name, " ~~by Kanako-Bot", thum);

                        await msg.edit({
                            content: "Berikut lagu Anda (dengan cover album):",
                            files: [{
                                attachment: audio.filepath,
                                name: `${vid.title}.mp3`
                            }],
                            allowedMentions: {
                                repliedUser: false
                            }
                        });
                    } catch (err) {
                        console.error("Download + Cover Error:", err);
                        await message.channel.send("Gagal mengunduh lagu dengan cover.");
                    }
                }

                // Voice Channel Playback
                if (interaction.customId === "playinvoice") {
                    if (!message.member?.voice?.channel?.id) {
                        return await message.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setColor("Red")
                                .setDescription("❌ Anda harus berada di voice channel terlebih dahulu.")
                            ],
                            allowedMentions: {
                                repliedUser: false
                            }
                        });
                    }

                    const connection = getVoiceConnection(message.guild.id);
                    if (!connection) {
                        return await message.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setColor("Red")
                                .setDescription("❌ Bot belum masuk ke voice channel. Ketik **.join** untuk memasukkan bot.")
                            ],
                            allowedMentions: {
                                repliedUser: false
                            }
                        });
                    }

                    playinvcBT.setDisabled(true);
                    await msg.edit({
                        components: [row]
                    });
                    await message.channel.sendTyping();

                    try {
                        const audio = await global.toAudioYt(vid.url);
                        const resource = createAudioResource(audio.filepath || audio.download, {
                            inlineVolume: true
                        });

                        const player = createAudioPlayer();
                        player.play(resource);
                        connection.subscribe(player);

                        await message.channel.send(`🎶 Sekarang memutar: **${vid.title}** di Voice Channel!`);
                    } catch (err) {
                        console.error("Voice Play Error:", err);
                        await message.channel.send("Gagal memutar lagu di Voice Channel.");
                    }
                }
            });

            collector.on('end', async () => {
                playBT.setDisabled(true);
                dlCoverBT.setDisabled(true);
                playinvcBT.setDisabled(true);
                await msg.edit({
                    components: [row]
                }).catch(() => {});
            });

        } catch (error) {
            console.error("Play Command Error:", error);
            await message.reply({
                content: `Terjadi kesalahan: ${error.message || error}`,
                allowedMentions: {
                    repliedUser: false
                }
            });
        }
    }
};