import path, { join } from 'path'
import chokidar from 'chokidar';
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch
} from 'fs';
import syntaxerror from 'syntax-error';

export const commandsWacher = async (client, rootPath) => {
    try {
        const mainDir = path.resolve("/sdcard/code/DiscordBot/src/plugins", "");
        console.log(`Main Dir: ${mainDir}`);
        const watcher = chokidar.watch(mainDir, {
            ignored: (filePath, stats) =>
                stats?.isFile() &&
                (filePath?.match(/interactions|#unused|#special/) ||
                    filePath?.startsWith(".") ||
                    !filePath?.endsWith(".js")),
            persistent: true,
            ignoreInitial: true,
            alwaysState: true,
        });
        watcher
            .on("add", async (filePath) => {
                if (!filePath.endsWith(".js")) return;
                const dir = filePath.match(/commands/) ?
                    "commands" : null
                const resolvedFile = path.join(
                    `/${dir}`,
                    path.relative(
                        path.dirname(path.dirname(filePath)),
                        path.dirname(filePath),
                    ),
                    path.basename(filePath),
                );
                const fileName = filePath.split('\\').pop().split('/').pop()
                try {
                    if (dir === "commands") {
                        const module = (await import(`${filePath}?updated=${Date.now()}`))?.MsgCommand;
                        global.cmdFileDiscord[resolvedFile] = module.name.toLowerCase()
                        client.commands.set(module.name.toLowerCase(), module)
                        conn.logger.info(`New plugin: ${resolvedFile}`);
                    } else if (dir === "lib") {
                        const module = (await import(`${filePath}?updated=${Date.now()}`))?.LibEvent;
                        //global.cmdFileDiscord[resolvedFile] = module.name.toLowerCase()
                        client.libevents.set(module.name.toLowerCase(), module)
                        conn.logger.info(`New plugin: ${resolvedFile}`);
                    } else {
                        conn.logger.warn(`File added outside of recognized directories: ${filePath}`);
                    }
                } catch (e) {
                    let err = await syntaxerror(readFileSync(filePath), fileName, {
                        sourceType: 'module',
                        allowAwaitOutsideFunction: true
                    })
                    conn.logger.error(`Error handling 'add' file '${filePath}'\n${err ?? e.message}`);
                }
            })
            .on("change", async (filePath) => {
                if (!filePath.endsWith(".js")) return;
                const dir = filePath.match(/commands/) ?
                    "commands" : filePath.match(/slashCommands/) ?
                    "slashCommands" : filePath.match(/lib/) ?
                    "lib" : null
                const resolvedFile = path.join(
                    `/${dir}`,
                    path.relative(
                        path.dirname(path.dirname(filePath)),
                        path.dirname(filePath),
                    ),
                    path.basename(filePath),
                );
                const fileName = filePath.split('\\').pop().split('/').pop()
                try {
                    const module = (await import(`${filePath}?updated=${Date.now()}`));
                    if (dir === "commands") {
                        client.commands.delete(global.cmdFileDiscord[resolvedFile])
                        global.cmdFileDiscord[resolvedFile] = module?.MsgCommand.name.toLowerCase()
                        client.commands.set(module?.MsgCommand.name.toLowerCase(), module?.MsgCommand)
                        conn.logger.info(`Changed command: ${resolvedFile}`);
                    } else if (dir === "slashCommands") {
                        client.slashCommands.set(module?.Slash.name.toLowerCase(), module?.Slash)
                        conn.logger.info(`Changed slashCommand: ${resolvedFile}`);
                    } else if (dir === "lib") {
                        client.libevents.set(module?.LibEvent.name.toLowerCase(), module?.LibEvent)
                        conn.logger.info(`New plugin: ${resolvedFile}`);
                    } else {
                        conn.logger.warn(`File changed outside of recognized directories: ${filePath}`);
                    }
                } catch (e) {
                    console.log({ path: filePath, file: fileName })
                    let err = await syntaxerror(readFileSync(filePath), fileName, {
                        sourceType: 'module',
                        allowAwaitOutsideFunction: true
                    })
                    conn.logger.error(`Error handling 'change' file '${filePath}'\n${err ?? e.message}`);
                }
            })
            .on("unlink", async (filePath) => {
                if (!filePath.endsWith(".js")) return;
                const dir = filePath.match(/commands/) ?
                    "commands" : null
                const resolvedFile = path.join(
                    `/${dir}`,
                    path.relative(
                        path.dirname(path.dirname(filePath)),
                        path.dirname(filePath),
                    ),
                    path.basename(filePath),
                );
                const fileName = filePath.split('\\').pop().split('/').pop()
                try {
                    if (dir === "commands") {
                        client.commands.delete(global.cmdFileDiscord[resolvedFile])
                        delete global.cmdFileDiscord[resolvedFile];
                        conn.logger.warn(`Plugin deleted: ${resolvedFile}`);
                    } else {
                        conn.logger.warn(`File deleted outside of recognized directories: ${filePath}`);
                    }
                } catch (e) {
                    let err = await syntaxerror(readFileSync(filePath), fileName, {
                        sourceType: 'module',
                        allowAwaitOutsideFunction: true
                    })
                    conn.logger.error(`Error handling 'unlink' file '${filePath}'\n${err ?? e.message}`);
                }
            })
            .on("error", (error) => {
                conn.logger.error(`Watcher error: ${error.message}`);
            })
            .on("ready", () => {
                conn.logger.info("Initial scan complete. Ready for changes.");
            });
    } catch (e) {
        conn.logger.error(`Error watching files: ${e}`);
    }
}
