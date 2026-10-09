import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";

export const MsgCommand = {
    name: "delete",
    usage: "<reply text>",
    tags: "tools",
    description: "Reply pesan bot yg ingin di hapus",
    aliases: ["delete", "del", "d"],
    run: async (client, message, args, text) => {
        if (!message.reference) return message.reply({ content: "Reply pesan bot yg ingin di hapus!", allowedMentions: { repliedUser: false }})
        let m = await message.channel.messages.fetch(message.reference.messageId)
        if (!(m.author.id == client.user.id)) return m.reply({ content: "Hanya pesan bot yg dapat di hapus!", allowedMentions: { repliedUser: false } }).then(msg => { setTimeout(() => msg.delete(), 5000) }), message.delete()
        message.delete()
        m.delete()
    }
}
