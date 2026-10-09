import { fileReader } from "../../utils/fileReader.js";
import { fileURLToPath } from 'url';

const registeredEvents = new Set();

export const LibEventManager = async (client, rootPath) => {
    const libEventFiles = fileReader(`${rootPath}/src/plugins/lib`);
    if (!libEventFiles.length) return;

    try {
        for (const libEventFile of libEventFiles) {
            const libEvent = ((await import(`file:///${libEventFile}`))?.LibEvent);
            if (!libEvent || libEvent.ignore || !libEvent.name) continue;

            // Save plugin to collection
            client.libevents.set(libEvent.name.toLowerCase(), libEvent);

            // Register global handler once per event type
            if (!registeredEvents.has(libEvent.type)) {
                registeredEvents.add(libEvent.type);

                client.on(libEvent.type, (...args) => {
                    // Filter and run all enabled plugins matching this event type
                    const matchingEvents = client.libevents.filter(e => e.type === libEvent.type && !e.ignore);
                    for (const [, event] of matchingEvents) {
                        event.run(...args, client);
                    }
                });
            }
        }
        conn.logger.info("Reload lib system success");
    } catch (e) {
        conn.logger.warn(`Error in lib plugin execution:\n${e}`);
    }
};