import chalk from 'chalk';
import { AttachmentBuilder } from 'discord.js';
import { canLevelUp } from "../../utils/levelling.js"; // Adjust relative path to levelling.js

export const LibEvent = {
    name: "expsystem",
    type: "messageCreate",
    ignore: false,
    run: async (message, client) => {
        // Ignore bots and direct messages
        if (!message || message.author?.bot || !message.guild) return;

        try {
            if (!client.db?.data?.users) return;

            const user = client.db.data.users[message.author.id];
            if (!user) return; // Wait until initialized by databaseDc

            // 1. Passive EXP Gain per message
            user.exp += Math.floor(Math.random() * 10) + 5; // Gains 5 - 15 EXP

            // 2. Level Up Check
            if (canLevelUp(user.level, user.exp, global.multiplier)) {
                let before = user.level * 1;

                // Handle multi-level jumps in one go
                while (canLevelUp(user.level, user.exp, global.multiplier)) {
                    user.level++;
                }

                if (before !== user.level) {
                    // Level-up Rewards
                    user.coins = (user.coins || 0) + 50;
                    user.money = (user.money || 0) + 1000;
                    const userRole = user.role || "Beginner";

                    const str = [
                        `🎉 **C O N G R A T S** 🎉`,
                        `<@${message.author.id}> naik level!`,
                        `**${before}** ➔ **${user.level}** [ *${userRole}* ]`,
                        ``,
                        `🎁 **Hadiah:** \`+50 Coins\` | \`+1,000 Money\``
                    ].join('\n');

                    await message.reply({
                        content: str,
                        allowedMentions: { repliedUser: false }
                    }).catch(() => {});
                }
            }
        } catch (error) {
            console.error(chalk.red('[EXP System Error]:'), error);
        }
    }
};