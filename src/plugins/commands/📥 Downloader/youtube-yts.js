import { EmbedBuilder } from "discord.js";
import yts from 'yt-search';

export const MsgCommand = {
    name: "yts",
    usage: "<query>",
    tags: "downloader",
    description: "Search for YouTube videos or channels",
    aliases: ["yts", "ytsearch"],
    run: async (client, message, args, text) => {
        // Use text or join args array to get search query
        const query = text || args.join(" ");

        if (!query) {
            return message.reply({
                content: "Cari apa?",
                allowedMentions: { repliedUser: false }
            });
        }

        try {
            const results = await yts(query);
            
            // Limit to top 5 results to avoid hitting Discord's 2000 character limit
            const topResults = results.all.slice(0, 5);

            if (!topResults.length) {
                return message.reply({
                    content: "Tidak ada hasil ditemukan.",
                    allowedMentions: { repliedUser: false }
                });
            }

            const teks = topResults.map(v => {
                switch (v.type) {
                    case 'video':
                        return `**${v.title}** (${v.url})\n` +
                               `Duration: ${v.timestamp} | Uploaded: ${v.ago} | ${v.views.toLocaleString()} views`;
                    case 'channel':
                        return `**${v.name}** (${v.url})\n` +
                               `*${v.subCountLabel} (${v.subCount}) Subscribers* | ${v.videoCount} videos`;
                    default:
                        return null;
                }
            }).filter(Boolean).join('\n\n───────────────────\n\n');

            await message.reply({
                content: teks.length > 2000 ? `${teks.slice(0, 1990)}...` : teks,
                allowedMentions: { repliedUser: false }
            });

        } catch (error) {
            console.error("YouTube search error:", error);
            await message.reply({
                content: "Gagal mencari di YouTube.",
                allowedMentions: { repliedUser: false }
            });
        }
    }
};