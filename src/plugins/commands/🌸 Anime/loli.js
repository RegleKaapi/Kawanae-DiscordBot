import { EmbedBuilder } from "discord.js";
import fetch from 'node-fetch'
import fs from 'fs'

export const MsgCommand = {
    name: "loli",
    //tags: "anime",
    description: "Pedo lo -_-",
    aliases: ["loli"],
    run: async (client, message, args) => {
        //const res = (await axios.get(`https://raw.githubusercontent.com/Sayaorang-P/Test/main/loli.json`)).data;
        const res = JSON.parse(fs.readFileSync('./src/img/loli.json', 'utf-8'))
        const haha = await res[Math.floor(res.length * Math.random())]
        await message.reply({
            content: haha,
            allowedMentions: { repliedUser: false }
        })
    }
}