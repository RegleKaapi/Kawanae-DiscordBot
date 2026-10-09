import { 
    EmbedBuilder, 
    ButtonBuilder, 
    ActionRowBuilder, 
    ButtonStyle 
} from "discord.js";
import axios from 'axios';
import * as cheerio from 'cheerio';

export const MsgCommand = {
    name: "pinterest",
    usage: "<query>",
    tags: 'internet',
    description: "Mendapatkan gambar dari Pinterest berdasarkan kata kunci",
    aliases: ["pinterest", "pin"],
    run: async (client, message, args, text) => {
        // 1. Safe query validation
        if (!text) {
            return message.reply({
                content: "Masukkan kata kunci pencarian! Contoh: `.pin anime wallpaper`",
                allowedMentions: { repliedUser: false }
            });
        }

        try {
            const res = await pinterest(text);

            // 2. Handle empty results safely
            if (!res || res.length === 0) {
                return message.reply({
                    content: `❌ Tidak ada hasil ditemukan untuk: **${text}**`,
                    allowedMentions: { repliedUser: false }
                });
            }

            let idp = 0;

            const nextBT = new ButtonBuilder()
                .setCustomId("next")
                .setLabel(`Next ${idp + 1}/${res.length}`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji("➡️")
                .setDisabled(res.length <= 1);

            const deleteBT = new ButtonBuilder()
                .setCustomId("deleteN")
                .setLabel("Delete")
                .setStyle(ButtonStyle.Danger)
                .setEmoji("🗑️");

            const row = new ActionRowBuilder().addComponents(nextBT, deleteBT);

            const buildEmbed = (index) => {
                return new EmbedBuilder()
                    .setImage(res[index])
                    .setColor(global.DefaultColor || "#E60023")
                    .setTimestamp()
                    .setTitle(`**Pinterest Result:** ${text}`)
                    .setDescription(`[Url Image](${res[index]})`)
                    .setAuthor({
                        name: client.user?.username || "Bot",
                        iconURL: client.user?.displayAvatarURL()
                    })
                    .setFooter({
                        text: `Request by ${message.member?.displayName || message.author.username}`,
                        iconURL: message.author.displayAvatarURL({ dynamic: true })
                    });
            };

            const msg = await message.reply({
                embeds: [buildEmbed(0)],
                components: [row],
                allowedMentions: { repliedUser: false }
            });

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
                time: 10 * 60 * 1000 // 10 minutes
            });

            collector.on('collect', async (interaction) => {
                if (!interaction) return;
                await interaction.deferUpdate();

                if (interaction.customId === "deleteN") {
                    collector.stop("deleted");
                    return await msg.delete().catch(() => {});
                }

                if (interaction.customId === "next") {
                    idp++;

                    nextBT.setLabel(`Next ${idp + 1}/${res.length}`);
                    nextBT.setDisabled(idp + 1 >= res.length);

                    await msg.edit({
                        components: [row],
                        embeds: [buildEmbed(idp)],
                        allowedMentions: { repliedUser: false }
                    }).catch(() => {});
                }
            });

            collector.on('end', async (_, reason) => {
                // 3. Prevent editing if message was deleted
                if (reason === "deleted") return;

                nextBT.setDisabled(true);
                deleteBT.setDisabled(true);

                await msg.edit({
                    components: [row]
                }).catch(() => {});
            });

        } catch (error) {
            console.error("Pinterest Command Error:", error);
            await message.reply({
                content: "Terjadi kesalahan saat mencari gambar di Pinterest.",
                allowedMentions: { repliedUser: false }
            });
        }
    }
};

async function pinterest(query) {
    try {
        // 4. Encode search query for safe HTTP requests
        const encodedQuery = encodeURIComponent(query);
        const { data } = await axios.get(`https://id.pinterest.com/search/pins/?autologin=true&q=${encodedQuery}`, {
            headers: {
                "cookie": global.webcookies?.pinterest || "",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        const $ = cheerio.load(data);
        const result = [];
        const hasil = [];

        $('div > a').get().forEach(b => {
            const link = $(b).find('img').attr('src');
            if (link) result.push(link);
        });

        result.forEach(v => {
            if (!v || v.includes("thumb") || v.includes("75_RS")) return;
            // Upgrade resolution to 736x
            hasil.push(v.replace(/236/g, '736'));
        });

        if (hasil.length > 0) hasil.shift();
        return hasil;
    } catch (err) {
        console.error("Pinterest Scrape Error:", err);
        return [];
    }
}