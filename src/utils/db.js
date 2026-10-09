export const dbHelper = {
    /**
     * Get or create user profile data
     * @param {string} userId 
     */
    getUser(userId) {
        if (!client.db.data) return null;
        if (!client.db.data.users[userId]) {
            client.db.data.users[userId] = {
                xp: 0,
                level: 1,
                coins: 100,
                lastDaily: 0
            };
        }
        return client.db.data.users[userId];
    },

    /**
     * Get or create guild configuration
     * @param {string} guildId 
     */
    getGuild(guildId) {
        if (!client.db.data || !guildId) return null;
        if (!client.db.data.guild[guildId]) {
            client.db.data.guild[guildId] = {
                prefix: '.',
                welcomeChannel: null,
                autoRole: null
            };
        }
        return client.db.data.guild[guildId];
    },

    /**
     * Save/Write database to disk immediately
     */
    async save() {
        if (client.db.data) {
            await client.db.write().catch(console.error);
        }
    }
};