import { generateDependencyReport } from '@discordjs/voice';
console.log(generateDependencyReport());
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
//import { BOT_TOKEN } from "./src/config.js";
import { ButtonManager } from "./src/structures/managers/buttonCommands.js";
import { EventManager } from "./src/structures/managers/events.js";
import { LibEventManager } from "./src/structures/managers/libEvents.js";
import { MessageCMDManager } from "./src/structures/managers/messageCommands.js";
import { commandsWacher } from "./src/structures/managers/commandsWacher.js";
import { ModalManager } from "./src/structures/managers/modalForms.js";
import { SelectMenuManager } from "./src/structures/managers/selectMenus.js";
import { SlashManager } from "./src/structures/managers/slashCommands.js";
import './config.js'
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Low, JSONFile } from 'lowdb';
import lodash from 'lodash';
const { chain } = lodash

const __dirname = dirname(import.meta.url);
export const rootPath = __dirname;
console.log(rootPath)

global.cmdFileDiscord = new Object();
global.slashFileDiscord = new Object();

(async () => {
    global.client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.MessageContent, // Only for bots with message content intent access.
            GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildWebhooks,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildInvites,
        ],
        partials: [Partials.Channel]
    });

    //Database
    const dbPath = join(__dirname, 'databaseDC.json');
    client.db = new Low(new JSONFile("/sdcard/code/DiscordBot/databaseDC.json"));
    client.loadDatabase = async function loadDatabase() {
        if (client.db.READ) return new Promise((resolve) => setInterval(async function () {
            if (!client.db.READ) {
                clearInterval(this)
                resolve(client.db.data == null ? client.loadDatabase() : client.db.data)
            }
        }, 1 * 1000))
        if (client.db.data !== null) return
        client.db.READ = true
        await client.db.read().catch(console.error)
        client.db.READ = null
        client.db.data = {
            users: {},
            guild: {},
            options: {},
            ...(client.db.data || {})
        }
        client.db.chain = chain(client.db.data)
    }
    client.loadDatabase()
    if (!opts['test']) {
        setInterval(async () => {
            if (client.db.data) await client.db.write().
                catch(console.error)
        }, 60 * 1000)
    }
    //end
    client.commands = new Collection();
    //client.aliases = new Collection();
    client.events = new Collection();
    client.libevents = new Collection();
    client.buttonCommands = new Collection();
    client.selectMenus = new Collection();
    client.modalForms = new Collection();
    client.contextMenus = new Collection();
    client.slashCommands = new Collection();
    client.joinVoiceChannel = joinVoiceChannel;
    client.pixiv = {};

    await MessageCMDManager(client, __dirname);
    await commandsWacher(client, __dirname)
    await EventManager(client, __dirname);
    await LibEventManager(client, __dirname);
    await ButtonManager(client, __dirname);
    await SelectMenuManager(client, __dirname);
    await ModalManager(client, __dirname);
    await client.login(token);
    await SlashManager(client, __dirname); // Includes context menu handling as they belong to same command type.
})()