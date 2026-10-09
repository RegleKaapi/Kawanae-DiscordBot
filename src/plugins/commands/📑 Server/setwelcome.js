import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

export const MsgCommand = {
    name: "setwelcome",
    usage: "<#channel | off>",
    tags: "tools",
    description: "Set channel untuk pesan welcome member baru",
    aliases: ["setwelcome", "welcomechannel"],
    run: async (client, message, args) => {
        // Permission Check
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.reply("❌ Anda membutuhkan izin `Manage Guild` untuk menggunakan perintah ini.");
        }

        const targetChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

        if (args[0]?.toLowerCase() === "off") {
            if (client.db?.data?.guild?.[message.guild.id]) {
                client.db.data.guild[message.guild.id].welcomeChannel = null;
            }
            return message.reply("✅ Pesan welcome telah dinonaktifkan.");
        }

        if (!targetChannel || !targetChannel.isTextBased()) {
            return message.reply("Contoh penggunaan: `.setwelcome #welcome-channel` atau `.setwelcome off`");
        }

        // Save to LowDB
        if (client.db?.data) {
            if (!client.db.data.guild[message.guild.id]) {
                client.db.data.guild[message.guild.id] = {};
            }
            client.db.data.guild[message.guild.id].welcomeChannel = targetChannel.id;
        }

        await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#57F287")
                    .setTitle("✅ Welcome Channel Berhasil Diatur")
                    .setDescription(`Pesan welcome akan dikirim ke ${targetChannel}`)
            ],
            allowedMentions: { repliedUser: false }
        });
    }
};
