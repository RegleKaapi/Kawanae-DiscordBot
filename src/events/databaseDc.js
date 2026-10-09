import chalk from 'chalk';

const isNumber = x => typeof x === 'number' && !isNaN(x);

export const Event = {
    name: "databaseDc",
    customEvent: true,
    run: async (client) => {
        client.on("messageCreate", async (message) => {
            if (!message || message.author?.bot || !message.guild) return;

            try {
                if (!client.db?.data) return;

                const db = client.db.data;
                const userId = message.author.id;
                const guildId = message.guild.id;

                // 1. Initialize User Defaults
                if (!db.users) db.users = {};
                let user = db.users[userId];

                if (typeof user !== 'object') user = db.users[userId] = {};
                if (user) {
                    if (!isNumber(user.exp)) user.exp = 0;
                    if (!isNumber(user.limit)) user.limit = 10;
                    if (!isNumber(user.coins)) user.coins = 100;
                    if (!isNumber(user.money)) user.money = 100;
                    if (!isNumber(user.level)) user.level = 0;
                    if (!('name' in user)) user.name = message.author.username;
                }

                // 2. Initialize Guild Defaults
                if (!db.guild) db.guild = {};
                let guild = db.guild[guildId];

                if (typeof guild !== 'object') guild = db.guild[guildId] = {};
                if (guild) {
                    if (!('prefix' in guild)) guild.prefix = '.';
                    if (!('welcome' in guild)) guild.welcome = false;
                    if (!('mute' in guild)) guild.mute = false;
                }

            } catch (error) {
                console.error(chalk.red('[Database Error]:'), error);
            }
        });
    }
};