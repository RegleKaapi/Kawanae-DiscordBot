import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import { Pixiv } from '../../../utils/pixiv.js'

const pixiv = new Pixiv();
const userAgent = 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36';
pixiv.staticLogin(global.pixivCookie, userAgent);

export const MsgCommand = {
    name: "pixivrec",
    usage: "<chara/url>",
    tags: "anime",
    description: "Gambar Character yg kamu cari!!",
    //aliases: ["pixivrec"],
    run: async (client, message, text, interaction) => {
        let resB
        let pixUrl
        let idp
        resB = await pixiv.getRecommendIllusts(text, {
            limit: 60
        })
        if (!resB.length) throw `Tag's "${query}" not found :/`
        idp = 0
        let res = await pixivRecIlust(idp)
        pixUrl = res.url

        const viewAllBT = new ButtonBuilder()
            .setCustomId("viewall")
            .setLabel("View All")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📜")
            .setDisabled(res.page == 1)

        const randomBT = new ButtonBuilder()
            .setCustomId("random")
            .setLabel("Random")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🔀")

        const nextBT = new ButtonBuilder()
            .setCustomId("next")
            .setLabel(`Next ${idp+1}/${res.totalPage}`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("➡️")

        const deleteBT = new ButtonBuilder()
            .setCustomId("deleteN")
            .setLabel(`Delete`)
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🗑️")

        const recillustBT = new ButtonBuilder()
            .setCustomId("recillust")
            .setLabel(`Recommend`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🔥")

        let row
        if (res.totalPage) row = new ActionRowBuilder().addComponents(viewAllBT, nextBT, randomBT, recillustBT, deleteBT)
        else row = new ActionRowBuilder().addComponents(viewAllBT)
        let msg = await interaction.reply({
            components: [row],
            embeds: [
                new EmbedBuilder()
                .setImage(res.image.small[0])
                .setColor(pickRandom(global.RandomColor))
                .setTimestamp()
                .setTitle(`${res.caption} ${res.ai?"<:AI:1346830399749230612>":""}`)
                .setDescription(`Page 1 / ${res.page} \nTags: ${res.tags} \nImage: [High](${res.image.original[0]}), [Regular](${res.image.regular[0]}), [Small](${res.image.small[0]}) \n[Pixiv](${res.url})`)
                .setAuthor({
                    name: res.artist,
                    iconURL: res.user?.profileImg || client.user.displayAvatarURL()
                })
                .setFooter({
                    text: "Request by " + message.member.displayName,
                    iconURL: message.author.displayAvatarURL({
                        dynamic: true
                    })
                })
            ],
            allowedMentions: {
                repliedUser: false
            }
        })

        const filter = (i) => {
            if (i.user.id !== message.author.id) {
                i.reply({
                    content: 'You are not authorized to use this button.',
                    ephemeral: true
                });
                return false;
            }
            return true;
        }
        const collector = msg.createMessageComponentCollector({
            filter,
            time: 1 * 60 * 60 * 1000
        });

        collector.on('collect', async (interaction) => {
            if (!interaction) return
            await interaction.deferUpdate()
            if (interaction.customId == "viewall") {
                viewAllBT.setDisabled(true)
                msg.edit({
                    components: [row]
                })
                let res = await pixivDl(pixUrl)
                for (let i = 0; i < res.page; i++) {
                    await message.channel.send({
                        components: [new ActionRowBuilder().addComponents(deleteBT)],
                        embeds: [
                            new EmbedBuilder()
                            .setImage(res.image.regularAlt[i])
                            .setColor(pickRandom(global.RandomColor))
                            .setTimestamp()
                            .setTitle(`${res.caption} ${res.ai?"<:AI:1346830399749230612>":""}`)
                            .setDescription(`Page ${i + 1} / ${res.page} \nTags: ${res.tags} \nImage: [High](${res.image.original[i]}), [Regular](${res.image.regular[i]}), [Small](${res.image.small[i]}) \n[Pixiv](${res.url})`)
                            .setAuthor({
                                name: res.artist,
                                iconURL: res.user?.profileImg || client.user.displayAvatarURL()
                            })
                            .setFooter({
                                text: "Request by " + message.member.displayName,
                                iconURL: message.author.displayAvatarURL({
                                    dynamic: true
                                })
                            })
                        ],
                    })
                }
                //client.commands.get("pixivreso").run(client, message, pixUrl, msg)
            }
            if (interaction.customId == "random") {
                let res = await pixivRecIlust()
                pixUrl = res.url
                idp = res.currentLength
                viewAllBT.setDisabled(res.page == 1)
                nextBT.setLabel(`Next ${idp+1}/${res.totalPage}`)
                nextBT.setDisabled(idp == res.totalPage)
                msg.edit({
                    components: [row],
                    embeds: [
                        new EmbedBuilder()
                        .setImage(res.image.small[0])
                        .setColor(pickRandom(global.RandomColor))
                        .setTimestamp()
                        .setTitle(`${res.caption} ${res.ai?"<:AI:1346830399749230612>":""}`)
                        .setDescription(`Page 1 / ${res.page} \nTags: ${res.tags} \nImage: [High](${res.image.original[0]}), [Regular](${res.image.regular[0]}), [Small](${res.image.small[0]}) \n[Pixiv](${res.url})`)
                        .setAuthor({
                            name: res.artist,
                            iconURL: res.user?.profileImg || client.user.displayAvatarURL()
                        })
                        .setFooter({
                            text: "Request by " + message.member.displayName,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    ],
                })
            }
            if (interaction.customId == "next") {
                idp++
                let res = await pixivRecIlust(idp)
                pixUrl = res.url
                viewAllBT.setDisabled(res.page == 1)
                nextBT.setLabel(`Next ${idp+1}/${res.totalPage}`)
                nextBT.setDisabled((idp + 1) == res.totalPage)
                msg.edit({
                    components: [row],
                    embeds: [
                        new EmbedBuilder()
                        .setImage(res.image.small[0])
                        .setColor(pickRandom(global.RandomColor))
                        .setTimestamp()
                        .setTitle(`${res.caption} ${res.ai?"<:AI:1346830399749230612>":""}`)
                        .setDescription(`Page 1 / ${res.page} \nTags: ${res.tags} \nImage: [High](${res.image.original[0]}), [Regular](${res.image.regular[0]}), [Small](${res.image.small[0]}) \n[Pixiv](${res.url})`)
                        .setAuthor({
                            name: res.artist,
                            iconURL: res.user?.profileImg || client.user.displayAvatarURL()
                        })
                        .setFooter({
                            text: "Request by " + message.member.displayName,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    ],
                })
            }
            if (interaction.customId == "recillust") {
                let res = await pixivRecIlust(idp)
                client.commands.get("pixivrec").run(client, message, res.id, msg)
            }
            if (interaction.customId == "deleteN") {
                await collector.stop()
                msg.delete()
            }
        })

        collector.on('end', async (interaction) => {
            viewAllBT?.setDisabled(true)
            randomBT?.setDisabled(true)
            nextBT?.setDisabled(true)
            recillustBT?.setDisabled(true)
            deleteBT?.setCustomId("delete")
            msg.edit({
                components: [row]
            })
        })
        async function pixivRecIlust(idx, limit) {
            let idp = (idx ?? ~~(Math.random() * resB.length))
            let totalPage = resB.length
            let res = await pixiv.getIllustByID(resB[idp].id)
            let baseImg = "https://i.pixiv.re"
            let original = []
            let regular = []
            let small = []
            for (let x = 0; x < res.urls.length; x++) {
                original.push(baseImg + new URL(res.urls[x].original).pathname)
                regular.push(baseImg + new URL(res.urls[x].regular).pathname)
                small.push(baseImg + new URL(res.urls[x].small).pathname)
            }
            return {
                artist: res.user.name,
                totalPage: totalPage,
                currentLength: idp,
                ai: res.AI,
                id: res.illustID,
                url: "https://www.pixiv.net/en/artworks/" + res.illustID,
                page: res.urls.length,
                caption: res.title,
                tags: res.tags.tags.map(v => v.tag),
                image: {
                    original,
                    regular,
                    small
                }
            }
        }
    }
}

async function pixivDl(query, idx, isNsfw, pages) {
    const isNumber = x => typeof x === 'number' && !isNaN(x)
    if (query.match("https://") || isNumber(parseInt(query))) {
        if (!(/pixiv.net\/en\/artworks\/[0-9]+/i.test(query) || isNumber(parseInt(query)))) throw 'Invalid Pixiv Url'
        query = query.replace(/\D/g, '')
        let res = await pixiv.getIllustByID(query).catch(() => null)
        if (!res) throw `ID "${query}" not found :/`
        let baseImg = "https://i.pixiv.re"
        let original = []
        let regular = []
        let small = []
        let regularAlt = []
        for (let x = 0; x < res.urls.length; x++) {
            original.push(baseImg + new URL(res.urls[x].original).pathname)
            regular.push(baseImg + new URL(res.urls[x].regular).pathname)
            regularAlt.push("https://i.pixiv.re/c/1200x1200_80_webp/"+(new URL(res.urls[x].regular).pathname))
            small.push(baseImg + new URL(res.urls[x].small).pathname)
        }
        return {
            artist: res.user.name,
            ai: res.AI,
            id: res.illustID,
            url: "https://www.pixiv.net/en/artworks/" + res.illustID,
            page: res.urls.length,
            caption: res.title,
            tags: res.tags.tags.map(v => v.tag),
            image: {
                original,
                regular,
                regularAlt,
                small
            },
            user: res.user
        }
    } else {
        let modes = (global.isANsfw && isNsfw ? "r18" : isNsfw ? "all" : "safe")
        let res = await pixiv.getIllustsByTag(query, {
            mode: modes,
            page: pages || global.Page
        })
        if (!res.length) throw `Tag's "${query}" not found :/`
        let idp = (idx ?? ~~(Math.random() * res.length))
        let totalPage = res.length
        res = await pixiv.getIllustByID(res[idp].id)
        let baseImg = "https://i.pixiv.re"
        let original = []
        let regular = []
        let small = []
        let regularAlt = []
        for (let x = 0; x < res.urls.length; x++) {
            original.push(baseImg + new URL(res.urls[x].original).pathname)
            regular.push(baseImg + new URL(res.urls[x].regular).pathname)
            regularAlt.push("https://i.pixiv.re/c/1200x1200_80_webp/"+(new URL(res.urls[x].regular).pathname))
            small.push(baseImg + new URL(res.urls[x].small).pathname)
        }
        return {
            artist: res.user.name,
            totalPage: totalPage,
            currentLength: idp,
            ai: res.AI,
            id: res.illustID,
            url: "https://www.pixiv.net/en/artworks/" + res.illustID,
            page: res.urls.length,
            caption: res.title,
            tags: res.tags?.tags?.map(v => v.tag),
            image: {
                original,
                regular,
                regularAlt,
                small
            },
            user: res.user
        }
    }
}