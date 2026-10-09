import {
    EmbedBuilder
} from "discord.js";
import fetch from 'node-fetch'

export const MsgCommand = {
    name: "facebook",
    usage: "<url>",
    tags: "downloader",
    description: "No Description",
    aliases: ["facebook", "fb"],
    run: async (client, message, args) => {
        if (!args[0] || !args[0].match("facebook")) throw "Masukan Url!\n\n *.fb* with fb url"
        //plugin Facebook require
        let res = await fbdown(args[0])
        let file = await conn.getFile(res.HD ? res.HD : res.Normal_video)
        await message.reply({
            files: [file.filename],
            allowedMentions: {
                repliedUser: false
            }
        })
    }
}