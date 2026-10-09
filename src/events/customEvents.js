import chalk from 'chalk'
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";

export const Event = {
    name: "customEvents",
    customEvent: true,
    run: async (client, ) => {
        client.on("messageCreate", async message => {
            if (!message.guild) return

            //Print for discord
            if (!message.content) return
            let typem = message.content ? 'Message' : (message.embeds && message.author.bot) ? 'Embed' : message.attachments ? 'Media' : 'Unknown'
            let commandName = message.content.toLowerCase().slice(PREFIX.length).trim().split(" ")[0]
            let isAccept = client.commands.find(cmd => cmd.aliases === commandName || cmd.aliases?.includes(commandName)) || null
            let command = client.commands.get(isAccept?.name)
            console.log(`
\n▣ ${chalk.blueBright(client.user?.tag)}\n│⏰ ${chalk.black(chalk.bgGreen(new Date))}\n│🔰 ${chalk.yellow(message.guild.id+' - '+message.guild.name)}\n│📑 ${chalk.yellow(message.channel.id+' - #'+message.channel.name)}\n│👤 ${chalk.yellow(message.author.id+' - @'+message.author.tag)}\n│💬 ${chalk.black(chalk.bgRed(`${typem}`))}
▣──────···
${command ? chalk.cyan(message.content) : message.content}\n\nㅤ
`.trim())
            //End
            //console.log(client.on())
        })
        client.on("interactionCreate", async interaction => {
            if (!interaction.isModalSubmit()) return

            //Suggest
            let suggest1 = interaction.fields.getTextInputValue('suggestinput')
            let suggest2 = interaction.fields.getTextInputValue('suggestinput2')

            client.channels.cache.get("1181618795488497804").createWebhook({
                name: interaction.user.displayName,
                avatar: await interaction.user.displayAvatarURL()
            }).then(async web => {
                await web.send({
                    embeds: [
                        new EmbedBuilder()
                        .setColor("Random")
                        .setTimestamp()
                        //.setTitle(title)
                        .addFields({
                            name: "💭 Suggestion",
                            value: suggest1
                        }, {
                            name: "📄 Description",
                            value: suggest2 ? suggest2 : "Nothing"
                        })
                        .setAuthor({
                            name: interaction.user.displayName,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setFooter({
                            text: "Created by " + interaction.user.displayName,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    ],
                })
                web.delete();
            })
        })
    }
}