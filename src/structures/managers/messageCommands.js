import { fileReader } from "../../utils/fileReader.js";
import fs from 'fs'
import {fileURLToPath} from 'url'
import { format } from 'util'
const file = fileURLToPath(import.meta.url)
let endPlugin

export const MessageCMDManager = async (client, rootPath) => {
    const messageCommandsFiles = fileReader(`${rootPath}/src/plugins/commands`);
    if (!messageCommandsFiles.length) return
    try {
        for (const messageCommandFile of messageCommandsFiles) {
            const messageCommand = ((await import(`file:///${messageCommandFile}`))?.MsgCommand)

            if (!messageCommand) continue;

            if (!messageCommand.ignore && messageCommand.name) client.commands.set(messageCommand.name.toLowerCase(), messageCommand)
            /*if (!messageCommand.ignore && messageCommand.aliases && Array.isArray(messageCommand.aliases)) messageCommand.aliases.forEach((messageCommandAlias) => {
                client.aliases.set(messageCommandAlias, messageCommand.name)
            })*/
            let name = messageCommandFile.split("plugins")[1]
            endPlugin = name
            if (messageCommand.name) global.cmdFileDiscord[name] = messageCommand.name?.toLowerCase()
        }
        client.commands.delete(undefined)
        //client.aliases.delete(undefined)
        conn.logger.info("Reolad commads success")
    } catch (e) {
        conn.logger.warn(`error command ${endPlugin}\n${e}`)
        /*client.channels.cache.get("1138871087791353906").send({
                  content: "error command\n"+`\`\`\`js\n${format(e)}\n\`\`\``
              })*/
    }
}