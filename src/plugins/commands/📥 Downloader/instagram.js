import {
    EmbedBuilder,
    AttachmentBuilder
} from "discord.js";
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export const MsgCommand = {
    name: "instagram",
    usage: "<url>",
    tags: "downloader",
    description: "Download photos or videos from Instagram",
    aliases: ["instagram", "ig"],
    run: async (client, message, args) => {
        const url = args[0];

        // 1. Safe URL check
        if (!url || !/(instagram\.com|instagr\.am)/i.test(url)) {
            return message.reply({
                content: "Masukkan URL Instagram yang valid! Contoh: `.ig https://www.instagram.com/p/xxx`",
                allowedMentions: { repliedUser: false }
            });
        }

        try {
            const waitMsg = await message.reply({
                content: "Mengunduh media Instagram, mohon tunggu...",
                allowedMentions: { repliedUser: false }
            });

            const data = await igDownloader(url);

            // 2. Handle string error responses gracefully
            if (!Array.isArray(data) || data.length === 0) {
                return waitMsg.edit(`❌ ${typeof data === 'string' ? data : 'Gagal mengambil data dari Instagram.'}`);
            }

            // 3. Process all items without Math.sqrt truncating the album
            const files = [];
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                if (!item.url) continue;

                if (typeof conn !== 'undefined' && conn.getFile) {
                    const fileData = await conn.getFile(item.url);
                    files.push(fileData.filename || fileData.data || item.url);
                } else {
                    files.push(new AttachmentBuilder(item.url, { name: `instagram_${i + 1}.mp4` }));
                }
            }

            if (files.length === 0) {
                return waitMsg.edit("❌ Tidak dapat mengekstrak media dari link tersebut.");
            }

            await message.reply({
                files: files,
                allowedMentions: { repliedUser: false }
            });

            await waitMsg.delete().catch(() => {});

        } catch (error) {
            console.error("Instagram Command Error:", error);
            await message.reply({
                content: "Terjadi kesalahan saat mengunduh dari Instagram.",
                allowedMentions: { repliedUser: false }
            });
        }
    }
};

function igDownloader(url) {
    return new Promise(async (resolve) => {
        try {
            const fbRegex = /(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/;
            const igRegex = /(https|http):\/\/www.instagram.com\/(p|reel|tv|stories)/gi;
            
            if (!url.match(fbRegex) && !url.match(igRegex)) {
                return resolve({ status: false, msg: 'Link Url not valid' });
            }

            // ... (keep the decodeSnap, d, and other helper functions from the previous block) ...

            // SnapSave De-obfuscation Logic
            function decodeSnap(data) {
                let [h, u, n, t, e, r] = data;
                function d(c, a, v) {
                    const charSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
                    let b = charSet.slice(0, a);
                    let o = charSet.slice(0, v);
                    let result = c.split('').reverse().reduce((prev, curr, i) => {
                        if (b.indexOf(curr) !== -1) return prev + b.indexOf(curr) * Math.pow(a, i);
                    }, 0);
                    let final = '';
                    while (result > 0) {
                        final = o[result % v] + final;
                        result = (result - (result % v)) / v;
                    }
                    return final || '0';
                }

                r = '';
                for (let i = 0, len = h.length; i < len; i++) {
                    let s = "";
                    while (h[i] !== n[e]) {
                        s += h[i];
                        i++;
                    }
                    for (let j = 0; j < n.length; j++) {
                        s = s.replace(new RegExp(n[j], 'g'), j.toString());
                    }
                    r += String.fromCharCode(d(s, e, 10) - t);
                }
                return decodeURIComponent(encodeURIComponent(r));
            }
            
            // REPLACED 'got' WITH 'fetch'
            const response = await fetch('https://snapsave.app/action.php?lang=id', {
                method: 'POST',
                headers: {
                    'origin': 'https://snapsave.app',
                    'referer': 'https://snapsave.app/id',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ url: url })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const page = await response.text();
            
            // Extract obfuscated script arguments
            const scriptPart = page.split('decodeURIComponent(escape(r))}(')[1];
            if (!scriptPart) return resolve('Result Not Found! (Source extraction failed)');
            
            const scriptArgs = scriptPart.split('))')[0].split(',').map(s => s.replace(/"/g, '').trim());
            const decodedHtml = decodeSnap(scriptArgs).split('getElementById("download-section").innerHTML = "')[1].split('"; document.getElementById("inputData").remove(); ')[0].replace(/\\(\\)?/g, '');
            
            const $ = cheerio.load(decodedHtml);
            const results = [];
            const description = $('.download-content').find('h3').text().trim() || 
                                $('.download-items__thumb').next().find('p').text().trim() || 
                                'No description available';
            // ... (rest of the scraping logic remains the same) ...
            if ($('table.table').length) {
                const thumb = $('.download-items__thumb img').attr('src');
                $('tbody > tr').each((i, el) => {
                    const row = $(el);
                    const res = row.find('td').eq(0).text();
                    let dlink = row.find('td').eq(2).find('a').attr('href') || row.find('td').eq(2).find('button').attr('onclick');
                    const isApi = /get_progressApi/ig.test(dlink || '');
                    if (isApi) dlink = /get_progressApi\('(.*?)'\)/.exec(dlink)?.[1] || dlink;

                    results.push({ resolution: res, thumbnail: thumb, url: dlink, shouldRender: isApi });
                });
            } else {
                $('.download-items__btn').each((i, el) => {
                    const thumb = $('.download-items__thumb img').attr('src');
                    let dlink = $(el).find('a').attr('href');
                    if (!/https?:\/\//.test(dlink || '')) dlink = 'https://snapsave.app' + dlink;
                    results.push({ caption: description, thumbnail: thumb, url: dlink });
                });
            }
            
            console.log(results)
            return resolve(results.length ? results : 'Result Not Found!');
        } catch (err) {
            console.error(err);
            return resolve('Request Failed: ' + err.message);
        }
    });
}