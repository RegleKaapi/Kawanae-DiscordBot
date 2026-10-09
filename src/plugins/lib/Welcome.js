import { EmbedBuilder, AttachmentBuilder } from 'discord.js';

export const LibEvent = {
    name: "welcomemsg",
    type: "guildMemberAdd",
    run: async (member, client) => {
        try {
            // 1. Fetch welcome channel setting from database or fallback to channel ID
            const guildDb = client.db?.data?.guild?.[member.guild.id];

            // Priority: DB custom channel ID -> Channel named "welcome" -> System channel
            const welcomeChannelId = guildDb?.welcomeChannel ||
                member.guild.channels.cache.find(ch => ch.name.includes("welcome") && ch.isTextBased())?.id ||
                member.guild.systemChannelId;

            if (!welcomeChannelId) return;

            const channel = member.guild.channels.cache.get(welcomeChannelId);
            if (!channel) return;

            // 2. Member Avatar & Details
            const avatarUrl = member.user.displayAvatarURL({
                extension: 'png',
                size: 1024
            });
            const memberCount = member.guild.memberCount;

            // 3. Build Embed Message
            const embed = new EmbedBuilder()
                .setColor(global.DefaultColor || "#5865F2")
                .setTitle(`👋 Welcome to ${member.guild.name}!`)
                .setDescription(
                    `Hai ${member}, selamat datang di **${member.guild.name}**!\n\n` +
                    `Jangan lupa untuk membaca peraturan server di channel rules.\n` +
                    `Semoga betah ya!`
                )
                .setThumbnail(avatarUrl)
                .addFields({
                    name: "👤 User",
                    value: `${member.user.username}`,
                    inline: true
                }, {
                    name: "📊 Member Ke-",
                    value: `#${memberCount}`,
                    inline: true
                })
                .setFooter({
                    text: `ID: ${member.id}`,
                    iconURL: member.guild.iconURL() || avatarUrl
                })
                .setTimestamp();

            // 4. Send Welcome Message
            await channel.send({
                content: `Selamat datang ${member}! 🎉`,
                embeds: [embed]
            });

            // 5. Optional: Auto-Assign Default Role (if configured)
            if (guildDb?.autoRole) {
                const role = member.guild.roles.cache.get(guildDb.autoRole);
                if (role) await member.roles.add(role).catch(() => {});
            }

        } catch (error) {
            console.error("Welcome Event Error:", error);
        }
    }
};