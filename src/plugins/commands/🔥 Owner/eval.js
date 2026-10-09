import { inspect, format } from "util";
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, Events, WebhookClient } from "discord.js";
import discord from "discord.js"
import { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection, StreamType } from "@discordjs/voice";
import chalk from 'chalk'
import { ActivityType } from "discord.js";
import { readdirSync, watch, readFileSync } from 'fs'
import { unwatchFile, watchFile } from 'fs'
import fs from 'fs'

export const MsgCommand = {
    name: "eval",
    tags: 'owner',
    owner: true,
    aliases: ["eval"],
    run: async (client, message, args, text, command) => {
    
        const deleteMessageComponent = new ActionRowBuilder().addComponents(new ButtonBuilder()
          .setCustomId("deleteOutput")
          .setLabel("Delete Output")
          .setStyle(ButtonStyle.Danger));

        let whs = await client.channels.cache.get("1244687200747130980").fetchWebhooks()
        let code = text.trim()
        let depth = 0;
        const originalCode = code;
        
        if (!code) {
            message.reply({ content: "Please specify something to Evaluate", allowedMentions: { repliedUser: false }});
            return;
        }

        try {
            if (originalCode.includes("--str")) code = `${code.replace("--str", "").trim()}.toString()`;
            if (originalCode.includes("--send")) code = `message.channel.send(${code.replace("--send", "").trim()})`;
            if (originalCode.includes("--async")) code = `(async () => {${code.replace("--async", "").trim()}})()`;
            if (originalCode.includes("--depth=")) depth = Number(originalCode.split("--depth=")[1]);

            code = code.split("--depth=")[0];
            code = code.replace("--silent", "").trim();
            code = await eval(code);
            code = inspect(code, { depth: depth });

            if (String(code).length > 4000) code = "Output is too long";
            if (String(code).includes((client?.token ?? ""))) code = "This message contained client's token.";
            if (originalCode.includes("--silent")) return;
            else message.reply({
                content: `\`\`\`js\n${code}\n\`\`\``,
                components: [deleteMessageComponent],
                allowedMentions: {
                    repliedUser: false
                }
            })
        }
        catch (e) {
            console.log(e)
            message.channel.send({
                content: `\`\`\`js\n${e}\n\`\`\``,
                components: [deleteMessageComponent]
            })
        }
    }
}; // Eval code using message command.
