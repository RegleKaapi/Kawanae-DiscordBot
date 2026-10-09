import { fileReader } from "../../utils/fileReader.js"
import { format } from 'util'

export const EventManager = async(client, rootPath) => {
    const eventFiles = fileReader(`${rootPath}/src/events`);
    if (!eventFiles.length) return;

    try {
    for (const event of eventFiles) {
        const clientEvent = (await import(`file:///${event}`))?.Event;
        if (!clientEvent) continue;

        client.events?.set(clientEvent.name, clientEvent);

        if (!clientEvent.ignore && clientEvent.customEvent) clientEvent.run(client);
        else if (!clientEvent.ignore && clientEvent.name && clientEvent.runOnce) client.once(clientEvent.name, (...args) => clientEvent.run(...args, client));
        else if (!clientEvent.ignore && clientEvent.name) client.on(clientEvent.name, (...args) => clientEvent.run(...args, client));
        }
    } catch (e) {
      conn.logger.warn(`error event \n${e.message}`)
      /*client.channels.cache.get("1287254480005627926").send({
                content: "error event\n"+`\`\`\`js\n${format(e)}\n\`\`\``
            })*/
      }
}