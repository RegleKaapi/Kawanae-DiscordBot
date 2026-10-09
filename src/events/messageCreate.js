import commandOptionsChecker from "../structures/commandOptions/processor.js";
import options from "../structures/commands.js";
import chalk from 'chalk';
import { format } from 'util';

export const Event = {
    name: "messageCreate",
    run: async (message, client) => {
        if (!message || message.author?.bot) return;

        // 1. Initialize user database record if missing
        if (client.db?.data?.users) {
            if (!client.db.data.users[message.author.id]) {
                client.db.data.users[message.author.id] = {
                    exp: 0,
                    level: 1,
                    coins: 100
                };
            }
            // Add passive message EXP
            client.db.data.users[message.author.id].exp += 10;
        }

        const content = message.content || "";

        // Auto-run Instagram downloader on link detection
        if (content.startsWith("https://") && /ins/gi.test(content)) {
            const igCmd = client.commands.get("instagram");
            if (igCmd) igCmd.run(client, message, content.split(" "));
        }

        // Auto-reaction trigger
        if (/loli/gi.test(content)) {
            message.react("🍭").catch(() => {});
        }

        // 2. Determine active prefix
        const prefixes = Array.isArray(global.PREFIX) ? global.PREFIX : [global.PREFIX || "."];
        const prefix = prefixes.find(p => content.startsWith(p));
        if (!prefix) return;

        // Extract command name and args
        const args = content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        // 3. Find command by name or alias
        const command = client.commands.get(commandName) || 
            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        const text = args.join(' ').trim();
        const extra = { message, args, text, commandName };

        try {
            // Check DM restrictions
            if (!message.guild && !command.allowInDms) return;

            const cmdop = await options(client, message, command, "MessageCommand");
            const pcoc = await commandOptionsChecker(client, message, command, "MessageCommand");

            if (cmdop && pcoc) {
                await message.channel.sendTyping().catch(() => {});
                await command.run(client, message, args, text, extra);
            }
        } catch (e) {
            console.error("Command Execution Error:", e);
            const formattedError = format(e);

            await message.reply({
                content: `\`\`\`js\n${formattedError.slice(0, 1900)}\n\`\`\``,
                allowedMentions: { repliedUser: false }
            }).catch(() => {});
        }
    }
};