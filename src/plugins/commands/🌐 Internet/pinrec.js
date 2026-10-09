import { 
    EmbedBuilder, 
    ButtonBuilder, 
    ActionRowBuilder, 
    ButtonStyle 
} from "discord.js";
import axios from 'axios';
import * as cheerio from 'cheerio';

export const MsgCommand = {
    name: "pinrec",
    usage: "",
    tags: 'internet',
    description: "Mendapatkan rekomendasi gambar dari Pinterest",
    aliases: ["pinterestrecommend", "pinrec"],
    run: async (client, message) => {
        try {
            let res = await pinterest();

            if (!res || res.length === 0) {
                return message.reply({
                    content: "❌ Gagal mengambil rekomendasi dari Pinterest. Coba lagi nanti.",
                    allowedMentions: { repliedUser: false }
                });
            }

            let idp = 0;

            const nextBT = new ButtonBuilder()
                .setCustomId("next")
                .setLabel(`Next ${idp + 1}/${res.length}`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji("➡️");

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
                    .setTitle("**Pinterest Recommended**")
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
                time: 5 * 60 * 1000 // 5 minutes
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
                    
                    // Reset to 0 and refetch if we reached the end
                    if (idp >= res.length) {
                        res = await pinterest();
                        idp = 0;
                    }

                    nextBT.setLabel(`Next ${idp + 1}/${res.length} ${idp + 1 === res.length ? "(Reset)" : ""}`);

                    await msg.edit({
                        components: [row],
                        embeds: [buildEmbed(idp)],
                        allowedMentions: { repliedUser: false }
                    }).catch(() => {});
                }
            });

            collector.on('end', async (_, reason) => {
                // Don't edit if the message was deleted by user
                if (reason === "deleted") return;

                nextBT.setDisabled(true);
                deleteBT.setDisabled(true);

                await msg.edit({
                    components: [row]
                }).catch(() => {});
            });

        } catch (error) {
            console.error("Pinrec Command Error:", error);
            await message.reply({
                content: "Terjadi kesalahan saat mengambil data Pinterest.",
                allowedMentions: { repliedUser: false }
            });
        }
    }
};

async function pinterest() {
    try {
        const { data } = await axios.get('https://id.pinterest.com/', {
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
            // Upgrade resolution from 236x to 736x
            hasil.push(v.replace(/236/g, '736'));
        });

        if (hasil.length > 0) hasil.shift();
        return hasil;
    } catch (err) {
        console.error("Pinterest Scrape Error:", err);
        return [];
    }
}