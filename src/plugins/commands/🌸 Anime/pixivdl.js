import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import { Pixiv } from '@ibaraki-douji/pixivts'

const pixiv = new Pixiv();
const userAgent = 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36';
pixiv.staticLogin(global.pixivCookie, userAgent);

export const MsgCommand = {
    name: "pixivdl",
    usage: "<chara/url>",
    //tags: "anime",
    description: "Mencari gambar character dari Pixiv",
    aliases: ["pixivdl"],
    run: async (client, message, args, text) => {
        let pixUrl
        let res = await pixivDl(args[0])
        pixUrl = res.url
        if (res.page === 0) return await message.reply({
            content: "There's a problem on Illustration!",
            allowedMentions: {
                repliedUser: false
            }
        })

        const smallBT = new ButtonBuilder()
            .setCustomId("smallimg")
            .setLabel("Small")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("↙️")

        const regulerBT = new ButtonBuilder()
            .setCustomId("regularimg")
            .setLabel("Regular")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("💠")

        const regulerAltBT = new ButtonBuilder()
            .setCustomId("regularaltimg")
            .setLabel("Regular Alt (Rec)")
            .setStyle(ButtonStyle.Success)
            .setEmoji("🔥")

        const highBT = new ButtonBuilder()
            .setCustomId("highimg")
            .setLabel(`High`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("↗️")

        const deleteBT = new ButtonBuilder()
            .setCustomId("delete")
            .setLabel(`Delete`)
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🗑️")

        let row = new ActionRowBuilder().addComponents(regulerAltBT, regulerBT, deleteBT)
        let msg = await message.reply({
            components: [row],
            embeds: [
                new EmbedBuilder()
                .setImage(res.image.regularAlt[0])
                .setColor(pickRandom(global.RandomColor))
                .setTimestamp()
                .setTitle(`${res.caption} ${res.ai ? "<:AI:1346830399749230612>" : ""}`)
                .setDescription(`Page 1 / ${res.page} \nTags: ${res.tags} \nImage: [High](${res.image.original[0]}), [Regular](${res.image.regular[0]}), [Small](${res.image.small[0]}) \n[Pixiv](${res.url})`)
                .setTimestamp()
                .setAuthor({
                    name: res.artist,
                    iconURL: res.user.profileImg || client.user.displayAvatarURL()
                })
                .setFooter({
                    text: "Request by " + (message.member?.displayName || message.user.globalName),
                    iconURL: (message?.author?.displayAvatarURL({
                        dynamic: true
                    }) || message?.user?.displayAvatarURL({
                        dynamic: true
                    }))
                })
            ],
            allowedMentions: {
                repliedUser: false
            }
        })

        const filter = (i) => i.user.id === (message?.author?.id || message?.user?.id);
        const collector = msg.createMessageComponentCollector({
            filter,
            time: 1 * 60 * 1000
        });

        collector.on('collect', async (interaction) => {
            if (!interaction) return
            interaction.deferUpdate()
            let path
            if (interaction.customId == "smallimg") {
                let res = await pixivDl(pixUrl)
                collector.stop()
                path = await global.downloadAndZip(res.image.small, res.caption + " (Small).zip")
            }
            if (interaction.customId == "regularimg") {
                let res = await pixivDl(pixUrl)
                collector.stop()
                path = await global.downloadAndZip(res.image.regular, res.caption + " (Regular).zip")
            }
            if (interaction.customId == "regularaltimg") {
                let res = await pixivDl(pixUrl)
                collector.stop()
                path = await downloadImage(res.image.regularAlt, res.caption + " (Regular Alt).zip", res.id)
            }
            if (interaction.customId == "highimg") {
                let res = await pixivDl(pixUrl)
                collector.stop()
                path = await global.downloadAndZip(res.image.original, res.caption + " (High).zip")
            }
            if (path) message.reply({ files: [path], allowedMentions: { repliedUser: false }})
        })

        collector.on('end', async (interaction) => {
            //msg.delete()
            regulerBT?.setDisabled(true)
            regulerAltBT?.setDisabled(true)
            msg.edit({
                components: [row]
            })
        })
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
        let regularAlt = []
        let small = []
        for (let x = 0; x < res.urls.length; x++) {
            original.push(baseImg + new URL(res.urls[x].original).pathname)
            regular.push(baseImg + new URL(res.urls[x].regular).pathname)
            regularAlt.push("https://i.pixiv.re/c/1200x1200_80_webp/" + (new URL(res.urls[x].regular).pathname))
            small.push(baseImg + new URL(res.urls[x].small).pathname)
        }
        //console.log(res)
        return {
            artist: res.user.name,
            ai: res.AI,
            id: res.illustID,
            url: "https://www.pixiv.net/en/artworks/" + res.illustID,
            page: res.urls.length,
            caption: res.title,
            tags: res?.tags?.tags.map(v => v.tag),
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
        for (let x = 0; x < res.urls.length; x++) {
            original.push(baseImg + new URL(res.urls[x].original).pathname)
            regular.push(baseImg + new URL(res.urls[x].regular).pathname)
            small.push(baseImg + new URL(res.urls[x].small).pathname)
        }
        //console.log(res.tags)
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
                small
            },
            user: res.user
        }
    }
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