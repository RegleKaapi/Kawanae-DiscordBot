import { EmbedBuilder } from "discord.js";
import fetch from 'node-fetch';
import { xpRange, canLevelUp } from "../../../utils/levelling.js"; // Adjust path to levelling.js

export const MsgCommand = {
    name: "profile",
    tags: "xp",
    description: "Melihat info statistik profil & statistik pengguna",
    aliases: ["profile", "pro", "me"],
    run: async (client, message, args) => {
        try {
            // 1. Resolve Target Member / User
            let member = message.mentions.members.first() 
                || (args[0] ? message.guild?.members.cache.get(args[0]) : null) 
                || (args[0] ? await fetchUser(args[0]) : null) 
                || message.member;

            if (!member) {
                return message.reply({
                    content: "❌ User tidak ditemukan.",
                    allowedMentions: { repliedUser: false }
                });
            }

            const targetUser = member.user || member;
            const targetId = targetUser.id;

            // 2. Fetch User Database Entry
            const dbUsers = client.db?.data?.users || {};
            const userDb = dbUsers[targetId] || null;

            // Get avatar URL safely
            let avatarUrl;
            if (typeof targetUser.displayAvatarURL === 'function') {
                avatarUrl = targetUser.displayAvatarURL({ size: 1024 });
            } else {
                avatarUrl = member.avatarImg || `https://cdn.discordapp.com/embed/avatars/${(BigInt(targetId) >> 22n) % 5n}.png`;
            }

            const embed = new EmbedBuilder()
                .setThumbnail(avatarUrl)
                .setColor(global.DefaultColor || "#5865F2")
                .setTimestamp()
                .setAuthor({
                    name: `Profil ${targetUser.globalName || targetUser.global_name || targetUser.username}`,
                    iconURL: avatarUrl
                })
                .setFooter({
                    text: `Requested by ${message.member?.displayName || message.author.username}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                });

            // 3. Render Profile Data
            if (!userDb) {
                // Formatting for Unregistered Users / Bots
                embed.setDescription(`⚠️ User ini belum terdaftar di database.`)
                    .addFields(
                        { name: "👤 User Info", value: `• **Tag:** <@${targetId}>\n• **Username:** ${targetUser.username}\n• **Bot:** ${targetUser.bot ? "Ya 🤖" : "Tidak 👤"}` },
                        { name: "🖼️ Avatar", value: `[Download Avatar](${avatarUrl})` }
                    );
            } else {
                // Calculate Level, EXP Progress, and Leaderboard Rank
                const currentLevel = userDb.level || 0;
                const currentXp = userDb.exp || 0;
                const userRole = userDb.role || "Beginner";
                
                const { min, max, xp: requiredXp } = xpRange(currentLevel, global.multiplier);
                const xpInCurrentLevel = (currentXp - min);
                const isReadyToLevelUp = canLevelUp(currentLevel, currentXp, global.multiplier);

                const progressBar = createProgressBar(xpInCurrentLevel, requiredXp);
                
                // Calculate Rank
                const sortedUsers = Object.entries(dbUsers)
                    .map(([id, u]) => ({ id, exp: u.exp || 0 }))
                    .sort((a, b) => b.exp - a.exp);
                
                const rankIndex = sortedUsers.findIndex(u => u.id === targetId);
                const userRank = rankIndex !== -1 ? `#${rankIndex + 1}` : "N/A";

                embed.addFields(
                    { 
                        name: "👤 Informasi Pengguna", 
                        value: `• **User:** <@${targetId}>\n• **Username:** ${targetUser.username}\n• **Role:** ${userRole}\n• **Rank Server:** ${userRank}` 
                    },
                    { 
                        name: "📊 Statistik Level & EXP", 
                        value: `• **Level:** ${currentLevel} ${isReadyToLevelUp ? "⭐ *(Ready to Level Up!)*" : ""}\n• **EXP:** ${xpInCurrentLevel} / ${requiredXp} (Total: ${currentXp})\n${progressBar}` 
                    },
                    { 
                        name: "💎 Ekonomi & Aset", 
                        value: `❤️ **Health:** ${userDb.health ?? 100} / 100\n💰 **Money:** ${(userDb.money ?? 0).toLocaleString()} Coins\n` 
                    }
                );
            }

            await message.reply({
                embeds: [embed],
                allowedMentions: { repliedUser: false }
            });

        } catch (error) {
            console.error("Profile Command Error:", error);
            await message.reply({
                content: "Terjadi kesalahan saat memuat profil!",
                allowedMentions: { repliedUser: false }
            });
        }
    }
};

/**
 * Creates a text-based progress bar
 */
function createProgressBar(current, target, size = 10) {
    const percentage = Math.min(Math.max(current / target, 0), 1);
    const progress = Math.round(size * percentage);
    const emptyProgress = size - progress;

    const progressText = '█'.repeat(progress);
    const emptyProgressText = '░'.repeat(emptyProgress);
    const percentageText = Math.round(percentage * 100) + '%';

    return `[${progressText}${emptyProgressText}] **${percentageText}**`;
}

/**
 * Fetches user data via Discord API v10 using global.token
 */
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
            id: json.id,
            user: { ...json, globalName: json.global_name },
            avatarImg: avatarImg
        };
    } catch (e) {
        console.error("fetchUser Error:", e);
        return null;
    }
}
