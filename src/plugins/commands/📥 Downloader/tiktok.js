import {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    AttachmentBuilder
} from "discord.js";
import axios from 'axios';

export const MsgCommand = {
    name: "tiktok",
    usage: "<url>",
    tags: "downloader",
    description: "Download video from TikTok with description as filename",
    aliases: ["tiktok", "tt"],
    run: async (client, message, args) => {
        const url = args[0];

        if (!url || !/tiktok\.com/i.test(url)) {
            return message.reply({
                content: "Masukkan URL TikTok yang valid! Contoh: `.tt https://vt.tiktok.com/xxxx`",
                allowedMentions: { repliedUser: false }
            });
        }

        try {
            const waitMsg = await message.reply({
                content: "Mengunduh video TikTok, mohon tunggu...",
                allowedMentions: { repliedUser: false }
            });

            const maximus = await getTikTokVideo(url);

            if (!maximus || !maximus.videoAlt) {
                return waitMsg.edit("❌ Gagal mengambil data video TikTok.");
            }

            // Clean title to create a valid file name (remove special characters and spaces)
            const cleanTitle = (maximus.title || "tiktok_video")
                .replace(/[\n\r]/g, " ")
                .replace(/[^a-zA-Z0-9_\-\s]/g, "")
                .trim()
                .replace(/\s+/g, "_")
                .slice(0, 50); // Limit length for file system safety

            const fileName = `${cleanTitle || "tiktok_video"}.mp4`;

            const buttonLink = new ButtonBuilder()
                .setLabel("Link Video")
                .setStyle(ButtonStyle.Link)
                .setURL(maximus.videoAlt)
                .setEmoji("🔗");

            const row = new ActionRowBuilder().addComponents(buttonLink);

            // Fetch file buffer or URL and pass with custom name
            let fileAttachment;
            if (typeof conn !== 'undefined' && conn.getFile) {
                const fileData = await conn.getFile(maximus.videoAlt);
                fileAttachment = new AttachmentBuilder(fileData.data || fileData.filename || maximus.videoAlt, { name: fileName });
            } else {
                fileAttachment = new AttachmentBuilder(maximus.videoAlt, { name: fileName });
            }

            await message.reply({
                content: `${maximus.title ? `**${maximus.title.slice(0, 1900)}**\n\n` : ''}<${maximus.videoAlt}>`,
                files: [fileAttachment],
                components: [row],
                allowedMentions: { repliedUser: false }
            });

            await waitMsg.delete().catch(() => {});

        } catch (error) {
            console.error("TikTok Command Error:", error);
            await message.reply({
                content: "Terjadi kesalahan saat mengunduh video TikTok.",
                allowedMentions: { repliedUser: false }
            });
        }
    }
};

/**
 * Fetches TikTok video data using the TikWM API
 * @param {string} videoUrl - The TikTok video URL
 */
async function getTikTokVideo(videoUrl) {
    const apiBase = "https://www.tikwm.com/api/";
    
    try {
        const requestUrl = `${apiBase}?url=${encodeURIComponent(videoUrl)}`;

        const response = await axios.get(requestUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });
        
        const result = response.data;

        if (result && result.code === 0) {
            const data = result.data;
            
            return {
                title: data.title,
                videoAlt: `https://www.tikwm.com/video/media/play/${data.id}.mp4`,
                videoNoWatermark: data.play,
                videoWatermark: data.wmplay,
                music: data.music,
                cover: data.cover,
                author: data.author?.nickname || "Unknown"
            };
        } else {
            throw new Error(`API Error: ${result?.msg || "Unknown error"}`);
        }

    } catch (error) {
        if (error.response) {
            console.error(`Failed to fetch video (HTTP ${error.response.status}):`, error.message);
        } else {
            console.error("Failed to fetch video (Network Error):", error.message);
        }
        return null;
    }
}