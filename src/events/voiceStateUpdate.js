import {
    getVoiceConnection
} from "@discordjs/voice";

const leaveTimeoutMap = new Map();

export const Event = {
    name: "voiceStateUpdate",
    run: async (oldState, newState) => {
        const guildId = oldState.guild.id;
        const connection = getVoiceConnection(guildId);
        if (!connection) return;

        const botChannelId = connection.joinConfig.channelId;
        const channel = oldState.guild.channels.cache.get(botChannelId);
        if (!channel) return;

        const humanMembers = channel.members.filter(member => !member.user.bot);

        if (humanMembers.size === 0) {
            // If empty, start timer to leave in 30 seconds
            if (!leaveTimeoutMap.has(guildId)) {
                const timeout = setTimeout(() => {
                    const currentConnection = getVoiceConnection(guildId);
                    if (currentConnection) currentConnection.destroy();
                    leaveTimeoutMap.delete(guildId);
                }, 30 * 1000); // 30 seconds

                leaveTimeoutMap.set(guildId, timeout);
            }
        } else {
            // If a human rejoins before timeout, cancel auto-leave
            if (leaveTimeoutMap.has(guildId)) {
                clearTimeout(leaveTimeoutMap.get(guildId));
                leaveTimeoutMap.delete(guildId);
            }
        }
    }
}