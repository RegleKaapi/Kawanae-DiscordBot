import {
    joinVoiceChannel,
    getVoiceConnection,
    VoiceConnectionStatus,
    entersState
} from "@discordjs/voice";

export const MsgCommand = {
    name: "join",
    usage: "",
    tags: "voice",
    description: "Connect bot to your voice channel",
    aliases: ["join", "connect"],
    run: async (client, message) => {
        const voiceChannel = message.member?.voice?.channel;

        if (!voiceChannel) {
            return message.reply({
                content: "❌ Anda harus berada di voice channel terlebih dahulu!",
                allowedMentions: {
                    repliedUser: false
                }
            });
        }

        const existingConnection = getVoiceConnection(message.guild.id);
        if (existingConnection) {
            return message.reply({
                content: `⚠️ Bot sudah berada di voice channel **<#${existingConnection.joinConfig.channelId}>**!`,
                allowedMentions: {
                    repliedUser: false
                }
            });
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false,
            });

            // Handle auto-reconnect on disconnects or network changes
            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                    ]);
                } catch (e) {
                    if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                        connection.destroy();
                    }
                }
            });

            await message.reply({
                content: `✅ Berhasil bergabung ke voice channel **<#${voiceChannel.id}>**!`,
                allowedMentions: {
                    repliedUser: false
                }
            });

        } catch (error) {
            console.error("Join VC Error:", error);
            await message.reply({
                content: "❌ Gagal bergabung ke voice channel.",
                allowedMentions: {
                    repliedUser: false
                }
            });
        }
    }
};
