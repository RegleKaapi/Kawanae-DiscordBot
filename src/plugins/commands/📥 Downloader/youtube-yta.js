import { EmbedBuilder } from "discord.js";

export const MsgCommand = {
    name: "yta",
    usage: "<url> [hires]",
    tags: "downloader",
    description: "Download audio from YouTube",
    aliases: ["yta", "ytmp3"],
    run: async (client, message, args) => {
        const url = args[0];

        // 1. Validate argument exists and is a YouTube URL
        if (!url || !/youtu(\.be|be\.com)/i.test(url)) {
            return message.reply({
                content: "Masukkan URL YouTube yang valid. Contoh: `!yta https://youtu.be/xxx`",
                allowedMentions: { repliedUser: false }
            });
        }

        let quality = "128K";
        if (args[1]?.toLowerCase() === "hires") quality = "320K";

        try {
            // Send feedback while processing
            const waitMsg = await message.reply({ 
                content: "Mengunduh audio, mohon tunggu...", 
                allowedMentions: { repliedUser: false } 
            });

            const audio = await global.toAudioYt(url, quality);
            const thum = (await conn.getFile(audio.thumbnail)).filename;

            await cropToSquare(thum, thum);
            await delay(100);
            await addMp3(audio.filepath, audio.title, audio.author, " ~~by Kanako-Bot", thum);

            // 2. Fix variable reference: audio.filepath instead of file.filepath
            await message.reply({
                content: "Here is your song:",
                files: [{
                    attachment: audio.filepath,
                    name: `${audio.title || 'audio'}.mp3`
                }],
                allowedMentions: { repliedUser: false }
            });

            // Cleanup processing message
            await waitMsg.delete().catch(() => {});

        } catch (error) {
            console.error("YTA Download Error:", error);
            await message.reply({
                content: `Gagal mengunduh audio: ${error.message || error}`,
                allowedMentions: { repliedUser: false }
            });
        }
    }
};