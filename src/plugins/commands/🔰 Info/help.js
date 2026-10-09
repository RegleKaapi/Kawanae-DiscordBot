import {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} from "discord.js";
import moment from "moment-timezone";

export const MsgCommand = {
    name: "help",
    tags: "info",
    description: "Menampilkan daftar perintah bot",
    aliases: ["help", "menu"],
    run: async (client, message) => {
        if (!message.guild) {
            return await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription("Not Available in DM")
                ],
                allowedMentions: { repliedUser: false }
            });
        }

        // Helper function to format category lists cleanly and prevent empty field crashes
        const formatCategory = (tag) => {
            const cmds = client.commands
                .filter(cmd => cmd.tags === tag)
                .map(cmd => `${cmd.name} - **${cmd.description || "No Description"}**`);

            if (!cmds.length) return "Tidak ada perintah.";
            const prefix = global.cmenub || "• ";
            return prefix + cmds.join("\n" + prefix);
        };

        try {
            const memberName = message.member?.displayName || message.author.username;
            const userAvatar = message.author.displayAvatarURL({ dynamic: true });

            const embed = new EmbedBuilder()
                .setColor(global.DefaultColor || "#FF0000")
                .setTimestamp()
                .setDescription(`Hai <@${message.author.id}>, ${ucapan()}`)
                .setThumbnail(client.user.displayAvatarURL())
                .addFields(
                    { name: "❏––––––🌸 ANIME––––––", value: formatCategory("anime") },
                    { name: "❏––––––📥 DOWNLOAD––––––", value: formatCategory("downloader") },
                    { name: "❏––––––⚡ EXP––––––", value: formatCategory("xp") },
                    { name: "❏––––––🔰 INFO––––––", value: formatCategory("info") },
                    { name: "❏––––––🌐 INTERNET––––––", value: formatCategory("internet") },
                    { name: "❏––––––⚙️ TOOLS––––––", value: formatCategory("tools") }
                )
                .setAuthor({
                    name: client.user?.tag || client.user?.username,
                    iconURL: client.user.displayAvatarURL()
                })
                .setFooter({
                    text: `Request by ${memberName}`,
                    iconURL: userAvatar
                });

            if (global.cmenua) {
                embed.addFields({ name: "❏––––––", value: global.cmenua });
            }

            await message.reply({
                embeds: [embed],
                allowedMentions: { repliedUser: false }
            });
        } catch (e) {
            console.error("Help Command Error:", e);
            message.reply("Terjadi kesalahan saat membuka menu!");
        }
    }
};

function ucapan() {
    const time = parseInt(moment().tz('Asia/Jakarta').format('HH'), 10);
    if (time >= 4 && time < 10) return "Selamat Pagi 🌄";
    if (time >= 10 && time < 15) return "Selamat Siang ☀️";
    if (time >= 15 && time < 18) return "Selamat Sore 🌇";
    if (time >= 18 || time < 4) return "Selamat Malam 🌙";
    return "Selamat Dinihari ☀️";
}
