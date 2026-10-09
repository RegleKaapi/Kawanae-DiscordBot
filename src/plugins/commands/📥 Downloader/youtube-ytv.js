import { EmbedBuilder } from "discord.js";

export const MsgCommand = {
    name: "ytv",
    usage: "<url>",
    tags: "downloader",
    description: "Download video from YouTube",
    aliases: ["ytv", "ytmp4"],
    run: async (client, message, args) => {
        const url = args[0];

        // 1. Safe URL validation
        if (!url || !/youtu(\.be|be\.com)/i.test(url)) {
            return message.reply({
                content: "Masukkan URL YouTube yang valid. Contoh: `.ytv https://youtu.be/xxx`",
                allowedMentions: { repliedUser: false }
            });
        }

        try {
            // Send feedback status
            const waitMsg = await message.reply({ 
                content: "Mengunduh video, mohon tunggu...", 
                allowedMentions: { repliedUser: false } 
            });

            // Fetch video stream/file
            const file = await global.ytVideo(url);

            if (typeof delay === 'function') await delay(100);

            // Send video attachment
            await message.reply({
                content: "Here is your Video:",
                files: [{
                    attachment: file.filepath || file.download || file,
                    name: `${file.title || 'video'}.mp4`
                }],
                allowedMentions: { repliedUser: false }
            });

            // Clean up status message
            await waitMsg.delete().catch(() => {});

        } catch (error) {
            console.error("YTV Download Error:", error);
            await message.reply({
                content: `Gagal mengunduh video: ${error.message || error}`,
                allowedMentions: { repliedUser: false }
            });
        }
    }
};