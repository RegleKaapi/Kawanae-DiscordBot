import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import { Pixiv } from '../../../utils/pixiv.js'

const pixiv = new Pixiv();
const userAgent = 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36';
pixiv.staticLogin(global.pixivCookie, userAgent);

export const MsgCommand = {
    name: "pixiv",
    usage: "<chara/url>",
    tags: "anime",
    description: "Mencari gambar character dari Pixiv",
    aliases: ["pixiv"],
    run: async (client, message, args, text) => {
        let pixUrl
        let idp
        let [tag, pages] = text.split("|")
        let res = await pixivDl(tag, 0, message.channel.nsfw, pages, message.id)
        pixUrl = res.url
        idp = 0

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
            .setCustomId("delete")
            .setLabel(`Delete`)
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🗑️")

        const recillustBT = new ButtonBuilder()
            .setCustomId("recillust")
            .setLabel(`Recommend`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🔥")
            
        const downloadBT = new ButtonBuilder()
            .setCustomId("download")
            .setLabel(`Download`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📥")

        let row
        if (res.totalPage) row = new ActionRowBuilder().addComponents(viewAllBT, nextBT, randomBT, deleteBT)
        else row = new ActionRowBuilder().addComponents(viewAllBT, recillustBT, deleteBT)
        let msg = await message.reply({
            components: [row],
            embeds: [
                new EmbedBuilder()
                    .setImage(res.image.small[0])
                    .setColor(pickRandom(global.RandomColor))
                    .setTimestamp()
                    .setTitle(`${res.caption} ${res.ai ? "<:AI:1346830399749230612>" : ""}`)
                    .setDescription(`Page 1 / ${res.page} \nTags: ${res.tags} \nImage: [High](${res.image.original[0]}), [Regular](${res.image.regular[0]}), [Small](${res.image.small[0]}) \n[Pixiv](${res.url})`)
                    .setAuthor({
                        name: res.artist || "No Name",
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
            time: 10 * 60 * 1000
        });

        collector.on('collect', async (interaction) => {
            if (!interaction) return
            interaction.deferUpdate()
            if (interaction.customId == "viewall") {
                viewAllBT.setDisabled(true)
                await msg.edit({
                    components: [row]
                })
                let allPageRes = await pixivDl(pixUrl)
                for (let i = 0; i < allPageRes.page; i++) {
                    await message.channel.send({
                        components: [new ActionRowBuilder().addComponents(deleteBT)],
                        embeds: [
                            new EmbedBuilder()
                            .setImage(allPageRes.image.regularAlt[i])
                            .setColor(pickRandom(global.RandomColor))
                            .setTimestamp()
                            .setTitle(`${allPageRes.caption} ${allPageRes.ai?"<:AI:1346830399749230612>":""}`)
                            .setDescription(`Page ${i + 1} / ${allPageRes.page} \nTags: ${allPageRes.tags} \nImage: [High](${allPageRes.image.original[i]}), [Regular](${allPageRes.image.regular[i]}), [Small](${allPageRes.image.small[i]}) \n[Pixiv](${allPageRes.url})`)
                            .setAuthor({
                                name: allPageRes.artist || "No Name",
                                iconURL: allPageRes.user?.profileImg || client.user.displayAvatarURL()
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
            if (interaction.customId == "next" || interaction.customId == "random") {
                idp = interaction.customId === "next" ? idp + 1 : ~~(Math.random() * res.totalPage);
                res = await pixivDl(tag, idp, message.channel.nsfw, pages, message.id)
                pixUrl = res.url
                viewAllBT.setDisabled(res.page == 1)
                nextBT.setLabel(`Next ${idp + 1}/${res.totalPage}`)
                nextBT.setDisabled((idp + 1) == res.totalPage)
                downloadBT.setDisabled(false)
                await msg.edit({
                    components: [row],
                    embeds: [
                        new EmbedBuilder()
                            .setImage(res.image.regularAlt[0])
                            .setColor(pickRandom(global.RandomColor))
                            .setTimestamp()
                            .setTitle(`${res.caption} ${res.ai ? "<:AI:1346830399749230612>" : ""}`)
                            .setDescription(`Page 1 / ${res.page} \nTags: ${res.tags} \nImage: [High](${res.image.original[0]}), [Regular](${res.image.regular[0]}), [Small](${res.image.small[0]}) \n[Pixiv](${res.url})`)
                            .setAuthor({
                                name: res.artist || "No Name",
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
                client.commands.get("pixivrec").run(client, message, res.id, msg)
            }
            if (interaction.customId == "download") {
                downloadBT.setDisabled(true)
                await msg.edit({ components: [row] })
                let resDl = await pixivDl(pixUrl)
                const path = await downloadImage(resDl.image.regularAlt, resDl.caption + " (Regular Alt).zip", resDl.id)
                //message.reply({ files: [path], allowedMentions: { repliedUser: false }})
            }
            if (interaction.customId == "deleteN") {
                await collector.stop()
                await msg.delete().catch(() => null)
            }
        })

        collector.on('end', async (interaction) => {
            viewAllBT?.setDisabled(true)
            randomBT?.setDisabled(true)
            nextBT?.setDisabled(true)
            recillustBT?.setDisabled(true)
            downloadBT?.setDisabled(true)
            deleteBT?.setCustomId("delete")
            delete client.pixiv[message.id]
            msg.edit({
                components: [row]
            })
        })
    }
}

async function pixivDl(query, idx, isNsfw, pages, msgid) {
    const isNumber = x => !isNaN(parseInt(x));
    const baseImg = "https://i.pixiv.re";
    let res;

    if (query.match("https://") || isNumber(query)) {
        let cleanId = query.replace(/\D/g, '');
        res = await pixiv.getIllustByID(cleanId).catch(() => null);
        if (!res) throw `ID "${cleanId}" not found :/`;
    } else {
        let modes = (global.isANsfw && isNsfw ? "r18" : isNsfw ? "all" : "safe");
        console.log(query)
        let searchList = (msgid && client.pixiv?.[msgid]) ? client.pixiv[msgid] : await pixiv.getIllustsByTag(query, { mode: modes, page: pages || global.Page });
        if (!searchList?.length) throw `Tag "${query}" not found :/`;
        if (msgid && !(client.pixiv?.[msgid])) client.pixiv[msgid] = searchList
        
        let idp = (idx ?? ~~(Math.random() * searchList.length));
        var totalPage = searchList.length;
        var currentLength = idp;
        res = await pixiv.getIllustByID(searchList[idp].id);
    }

    let original = [], regular = [], small = [], regularAlt = [];
    res.urls.forEach(urlObj => {
        let path = new URL(urlObj.original).pathname;
        original.push(`${baseImg}${path}`);
        regular.push(`${baseImg}${new URL(urlObj.regular).pathname}`);
        regularAlt.push(`https://i.pixiv.re/c/1200x1200_80_webp/${new URL(urlObj.regular).pathname}`);
        small.push(`${baseImg}${new URL(urlObj.small).pathname}`);
    });

    return {
        artist: res.user.name,
        totalPage, currentLength,
        ai: res.AI,
        id: res.illustID,
        url: "https://www.pixiv.net/en/artworks/" + res.illustID,
        page: res.urls.length,
        caption: res.title,
        tags: res.tags?.tags?.map(v => v.tag) || [],
        image: { original, regular, regularAlt, small },
        user: res.user
    };
}

async function downloadImage(urls, outputFilename = "default", customFileName = "") {
    //from function.js
    const zip = new JSZip();
    const pathTmp = "./tmp/"

    console.log("Starting downloads...");

    // 1. Map URLs to download promises
    const downloadPromises = urls.map(async (url, index) => {
        try {
            const response = await axios({
                method: 'get',
                url: url,
                responseType: 'arraybuffer', // Critical for non-text files
                headers: {
                    'Referer': 'https://www.pixiv.net/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });
            // Extract filename from URL (e.g., image.jpg)
            const ext = path.extname(new URL(url).pathname);
            const basename = path.basename(new URL(url).pathname);
            const fileName = (basename.match("-") && customFileName) ? customFileName + `_p${index}_master1200` + ext : basename;

            // 2. Add to ZIP
            zip.file(fileName, response.data);
            //console.log(`Successfully fetched: ${fileName}`);
        } catch (error) {
            console.error(`Failed to download ${url}: ${error.message}`);
        }
    });

    // 3. Wait for all downloads to finish
    await Promise.all(downloadPromises);

    // 4. Generate the ZIP as a Node Buffer
    console.log("Generating ZIP file...");
    const content = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: {
            level: 6
        }
    });

    // 5. Save to local disk
    fs.writeFileSync(pathTmp + (outputFilename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')), content);
    console.log(`Saved: ${outputFilename}`);
    return pathTmp + (outputFilename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_'))
}