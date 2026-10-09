export const MsgCommand = {
    name: "calculator",
    usage: "<input>",
    tags: 'tools',
    description: "Kalkulator ini bisa menghitung",
    aliases: ["calculator", "kalkulator", "kalkulatorcanggih", "calc"],
    run: async (client, message, args, commandName, text) => {
    if (!args[0]) return message.reply("Ngawor")
    let val = args.join(" ")
      .replace(/[^0-9\-\/+*×÷πEe()piPI/]/g, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π|pi/gi, 'Math.PI')
      .replace(/e/gi, 'Math.E')
      .replace(/\/+/g, '/')
      .replace(/\++/g, '+')
      .replace(/-+/g, '-')
    let format = val
      .replace(/Math\.PI/g, 'π')
      .replace(/Math\.E/g, 'e')
      .replace(/\//g, '÷')
      .replace(/\*×/g, '×')
    
    let result = (new Function('return ' + val))()
    if (result == "2") return message.reply({ files: ['./src/dua.webp'], allowedMentions: { repliedUser: false } })
    //message.reply({ files: ['./src/gtw.webp'], allowedMentions: { repliedUser: false }})
    await message.reply({ content: `${result}`, allowedMentions: { repliedUser: false }})
    }
}
