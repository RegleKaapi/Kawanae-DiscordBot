import { EmbedBuilder } from "discord.js";

export default async (client, message, command) => {
    //options
    let owners = (owner_id.some((userID) => userID == (message.user ?? message.author)?.id))
    
    if (command.owner && !owners) {
        dcfail("owner", message)
        return false
    }
    if (command.nsfw && !message.channel.nsfw) {
        dcfail("nsfw", message)
        return false
    }
    else return true
}

async function dcfail(type, message) {
  let msg = {
    owner: 'Perintah ini hanya dapat digunakan oleh **Pemilik Bot**',
    mods: 'Perintah ini hanya dapat digunakan oleh **Moderator Bot**',
    premium: 'Perintah ini hanya untuk pengguna **Premium**',
    nsfw: 'Akses di tolak',
    admin: 'Perintah ini hanya untuk *Admin* grup',
    botAdmin: 'Jadikan bot sebagai *Admin* untuk menggunakan perintah ini'
  }[type]
    if (msg) message.reply({
            allowedMentions: { repliedUser: false },
            embeds: [
                new EmbedBuilder()
                .setColor("#FFF14B")
                //.setTitle('')
                .setDescription(msg)
                .setThumbnail(await conn.profilePictureUrl(conn.user.jid, 'image').catch(_ => client.user.displayAvatarURL()))
                .setTimestamp()
                .setAuthor({
                    name: client.user?.tag,
                    iconURL: client.user.displayAvatarURL()
                })
                .setFooter({
                    text: "Request by "+message.member.displayName,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
            ],
        })
    return true
}