import { getVoiceConnection } from "@discordjs/voice";

export const MsgCommand = {
    name: "leave",
    usage: "",
    tags: "voice",
    description: "Disconnect bot from voice channel",
    aliases: ["leave", "dc", "disconnect"],
    run: async (client, message) => {
        const connection = getVoiceConnection(message.guild.id);

        if (!connection) {
            return message.reply({
                content: "❌ Bot tidak sedang berada di voice channel mana pun!",
                allowedMentions: { repliedUser: false }
            });
        }

        try {
            connection.destroy();

            await message.reply({
                content: "👋 Berhasil keluar dari voice channel!",
                allowedMentions: { repliedUser: false }
            });

        } catch (error) {
            console.error("Leave VC Error:", error);
            await message.reply({
                content: "❌ Gagal keluar dari voice channel.",
                allowedMentions: { repliedUser: false }
            });
        }
    }
};
