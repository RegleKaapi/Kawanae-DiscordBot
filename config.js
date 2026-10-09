import { watchFile } from 'fs'
import chalk from 'chalk'
import { EmbedBuilder } from "discord.js";

global.PREFIX = ["."]
global.token = ""
global.owner_id = ["778750199166140418"]
global.guild_id = ["1133791977096351816"]
global.RandomColor = ["#FF0000", "#FF8700", "#FFD300", "#A1FF0A", "#0AFF99", "#0AEFFF", "#147DF5", "#580AFF", "#BE0AFF"]
global.DefaultColor = "#D1EFFE"

//require for baileys (cross/same session)
global.EmbedBuilder = EmbedBuilder

//pixiv settings
global.Page = 1
global.isANsfw = true
global.resoPixiv = 0

let file = global.__filename(import.meta.url)
watchFile(file, () => {
  console.log(chalk.yellowBright("[Discord Bot] Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
