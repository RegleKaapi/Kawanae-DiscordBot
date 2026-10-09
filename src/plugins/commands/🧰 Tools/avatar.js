import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';

export const MsgCommand = {
    name: 'avatar',
    usage: "<@user | ID>",
    tags: 'tools',
    description: "Display user avatar (works for non-server members)",
    aliases: ['avatar', 'av'],
    run: async (client, message, args) => {
        try {
            // 1. Resolve user from Mention, Guild Member, Custom fetchUser (using global.token), or Author
            const target = message.mentions.members.first() 
                || (args[0] ? message.guild?.members.cache.get(args[0]) : null) 
                || (args[0] ? await fetchUser(args[0]) : null) 
                || message.member;

            if (!target || !target.user) {
                return message.reply({
                    content: "❌ User tidak ditemukan.",
                    allowedMentions: { repliedUser: false }
                });
            }

            const user = target.user;
            
            // Construct Avatar URL safely regardless of target type
            const avatarHash = user.avatar;
            const avatarURL = target.avatarImg 
                || (typeof user.displayAvatarURL === 'function' 
                    ? user.displayAvatarURL({ size: 1024 }) 
                    : avatarHash 
                        ? `https://cdn.discordapp.com/avatars/${user.id}/${avatarHash}.${avatarHash.startsWith('a_') ? 'gif' : 'png'}?size=1024` 
                        : `https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> 22n) % 5n}.png`);

            const displayName = user.globalName || user.global_name || user.username;

            const embed = new EmbedBuilder()
                .setTitle(`Avatar for ${displayName}`)
                .setImage(avatarURL)
                .setDescription(`[Direct Image URL](${avatarURL})`)
                .setColor(global.DefaultColor || "#5865F2")
                .setAuthor({
                    name: `${user.username}${user.discriminator && user.discriminator !== '0' ? `#${user.discriminator}` : ''}`,
                    iconURL: avatarURL
                })
                .setTimestamp();

            await message.reply({
                embeds: [embed],
                allowedMentions: { repliedUser: false }
            });

        } catch (error) {
            console.error("Avatar Command Error:", error);
            await message.reply({
                content: "Gagal mengambil avatar user.",
                allowedMentions: { repliedUser: false }
            });
        }
    }
};

async function fetchUser(id) {
    if (!id || isNaN(id)) return null;

    try {
        const response = await fetch(`https://discord.com/api/v10/users/${id}`, {
            headers: {
                'Authorization': 'Bot ' + (global.token || process.env.TOKEN)
            }
        });

        if (!response.ok) return null;

        const json = await response.json();
        const ext = json.avatar?.startsWith('a_') ? 'gif' : 'png';
        const avatarImg = json.avatar 
            ? `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.${ext}?size=1024` 
            : `https://cdn.discordapp.com/embed/avatars/${(BigInt(json.id) >> 22n) % 5n}.png`;

        return {
            user: { 
                ...json, 
                globalName: json.global_name 
            },
            avatarImg: avatarImg
        };
    } catch (e) {
        console.error("fetchUser Error:", e);
        return null;
    }
}