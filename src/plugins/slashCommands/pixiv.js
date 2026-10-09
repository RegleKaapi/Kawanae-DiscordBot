import {
    ApplicationCommandOptionType,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} from "discord.js";
import {
    Pixiv
} from '@ibaraki-douji/pixivts';

const pixiv = new Pixiv();
const userAgent = 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36';
pixiv.staticLogin(global.pixivCookie, userAgent);

export const Slash = {
    name: "pixiv",
    description: "Mencari gambar character dari Pixiv",
    options: [{
        name: "query",
        description: "Nama karakter atau URL Pixiv",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    run: async (client, interaction) => {
        // 1. Defer immediately because Pixiv API calls take time
        await interaction.deferReply();

        try {
            const text = interaction.options.getString("query");
            let [tag, pages] = text.split("|");

            // 2. Fetch Initial Data
            let res = await pixivDl(tag, 0, interaction.channel.nsfw, pages);
            let pixUrl = res.url;
            let idp = 0;

            // 3. Build Components
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
                .setLabel(`Next ${idp + 1}/${res.totalPage}`)
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
            if (res.totalPage) row = new ActionRowBuilder().addComponents(viewAllBT, nextBT, randomBT, deleteBT)
            else row = new ActionRowBuilder().addComponents(viewAllBT, deleteBT)

            const createEmbed = (currentRes, currentIdp) => {
                return new EmbedBuilder()
                    .setImage(currentRes.image.small[0])
                    .setColor(global.RandomColor ? pickRandom(global.RandomColor) : "Blue")
                    .setTimestamp()
                    .setTitle(`${currentRes.caption} ${currentRes.ai ? "<:AI:1346830399749230612>" : ""}`)
                    .setDescription(`Page 1 / ${currentRes.page} \nTags: ${currentRes.tags.join(", ")} \nImage: [High](${currentRes.image.original[0]}), [Regular](${currentRes.image.regular[0]}), [Small](${currentRes.image.small[0]}) \n[Pixiv](${currentRes.url})`)
                    .setAuthor({
                        name: currentRes.artist,
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setFooter({
                        text: "Requested by " + interaction.user.displayName,
                        iconURL: interaction.user.displayAvatarURL()
                    });
            };

            const msg = await interaction.editReply({
                embeds: [createEmbed(res, idp)],
                components: [row]
            });

            // 4. Interaction Collector
            const filter = (i) => i.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({
                filter,
                time: 3600000
            });

            collector.on('collect', async (i) => {
                await i.deferUpdate();

                if (i.customId === "next") {
                    idp++;
                    res = await pixivDl(tag, idp, interaction.channel.nsfw, pages);
                    viewAllBT.setDisabled(res.page == 1)
                    nextBT.setDisabled((idp + 1) == res.totalPage)
                    nextBT.setLabel(`Next ${idp + 1}/${res.totalPage}`)
                    await interaction.editReply({
                        embeds: [createEmbed(res, idp)],
                        components: [row]
                    });
                }

                if (i.customId === "random") {
                    idp = Math.floor(Math.random() * (res.totalPage || 10));
                    res = await pixivDl(tag, idp, interaction.channel.nsfw, pages);
                    await interaction.editReply({
                        embeds: [createEmbed(res, idp)],
                        components: [row]
                    });
                }

                if (i.customId === "viewall") {
                    viewAllBT?.setDisabled(true)
                    interaction.editReply({
                        components: [row]
                    });
                    const deleteBTT = new ButtonBuilder()
                        .setCustomId("delete")
                        .setLabel(`Delete`)
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("🗑️")
                    // Logic to send all images in the channel
                    const resCache = res
                    for (let i = 0; i < resCache.page; i++) {
                        await interaction.channel.send({
                            components: [new ActionRowBuilder().addComponents(deleteBTT)],
                            embeds: [
                                new EmbedBuilder()
                                .setImage(resCache.image.small[i])
                                .setColor(pickRandom(global.RandomColor))
                                .setTimestamp()
                                .setTitle(`${resCache.caption} ${resCache.ai?"<:AI:1346830399749230612>":""}`)
                                .setDescription(`Page ${i + 1} / ${resCache.page} \nTags: ${resCache.tags} \nImage: [High](${resCache.image.original[i]}), [Regular](${resCache.image.regular[i]}), [Small](${resCache.image.small[i]}) \n[Pixiv](${resCache.url})`)
                                .setAuthor({
                                    name: resCache.artist,
                                    iconURL: client.user.displayAvatarURL()
                                })
                                .setFooter({
                                    text: "Request by " + interaction.user.displayName,
                                    iconURL: interaction.user.displayAvatarURL({
                                        dynamic: true
                                    })
                                })
                            ],
                        })
                    }
                }

                if (i.customId === "deleteN") {
                    await collector.stop();
                    interaction.deleteReply();
                }
            });

            collector.on('end', async (interaction) => {
                viewAllBT?.setDisabled(true)
                randomBT?.setDisabled(true)
                nextBT?.setDisabled(true)
                recillustBT?.setDisabled(true)
                deleteBT?.setCustomId("delete")
                msg?.edit({
                    components: [row]
                })
            })
        } catch (error) {
            console.error(error);
            const errContent = {
                content: `Error: ${error.message || error}`,
                ephemeral: true
            };
            interaction.deferred ? await interaction.editReply(errContent) : await interaction.reply(errContent);
        }
    }
};

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
        for (let x = 0; x < res.urls.length; x++) {
            original.push(baseImg + new URL(res.urls[x].original).pathname)
            regular.push(baseImg + new URL(res.urls[x].regular).pathname)
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
                small
            }
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