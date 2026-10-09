import { EmbedBuilder } from "discord.js";
import { cpus as _cpus, totalmem, freemem } from 'os'
import util from 'util'
import os from 'os'
import fs from 'fs'
import fetch from 'node-fetch'
import { sizeFormatter } from 'human-readable'
import { performance } from 'perf_hooks'
let format = sizeFormatter({
    std: 'JEDEC', // 'SI' (default) | 'IEC' | 'JEDEC'
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
})

export const MsgCommand = {
    name: "ping",
    tags: 'tools',
    description: "Statistik bot discord",
    aliases: ["ping", "stats"],
    run: async (client, message) => {
        let old = performance.now()
        let _muptime
        if (process.send) {
            process.send('uptime')
            _muptime = await new Promise(resolve => {
                process.once('message', resolve)
                setTimeout(resolve, 1000)
            }) * 1000
        }
        let neww = performance.now()
        let speed = neww - old
        const used = process.memoryUsage()
        const latency = new Date() - message.createdTimestamp

        let str = `
**🔴 Ping:** ${Math.round(neww - old)} ms
**🌐 WebSocket:** ${client.ws.ping} ms (Discord.js)
**⏰ RunTime:** ${_muptime.toTimeString()}
**💾 Ram:** ${format(totalmem() - freemem())} / ${format(totalmem())}
**📀 FreeRam:** ${format(freemem())}
**💻 Platform:** ${os.platform()}
**🧿 Server:** ${os.hostname()}

**NodeJS Memory Usage**
${'```' + Object.keys(used).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v => v.length)), ' ')}: ${format(used[key])}`).join('\n') + '```'
}
`.trim()

        message.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(global.DefaultColor)
                .setTitle('Statistics Bot')
                .setThumbnail(await conn.profilePictureUrl(conn.user.jid, 'image').catch(_ => client.user.displayAvatarURL()))
                .setTimestamp()
                .setAuthor({
                    name: client.user?.tag,
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(str)
                .setFooter({
                    text: "Request by " + (message.member?.displayName || message.user.globalName),
                    iconURL: (message?.author?.displayAvatarURL({
                        dynamic: true
                    }) || message?.user?.displayAvatarURL({
                        dynamic: true
                    }))
                })
            ],
            allowedMentions: { repliedUser: false }
        })
    }
};