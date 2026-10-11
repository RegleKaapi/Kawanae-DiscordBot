import { GoogleGenerativeAI } from "@google/generative-ai";

export const LibEvent = {
    name: "geminitag",
    type: "messageCreate",
    run: async (message, client) => {
        if (message.content.startsWith("<@860419652656300033>")) {
            const text = message.content.split("<@860419652656300033>")[1]
            console.log(text)
            if (!text) return
            await message.channel.sendTyping()
            const genAI = new GoogleGenerativeAI(global.geminitoken || process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
                model: "gemini-flash-latest",
                //systemInstruction: `namamu adalah " Kanako Asisten " kamu adalah bot whatsapp yang di buat oleh Regle, kamu sangat dingin saat berbicara tapi kamu memiliki sifat yang baik dan juga sopan`,
            });
            const result = await model.generateContent(`${text.trim()}`);
            const responseText = result.response.text();
            await message.reply({
                content: responseText,
                allowedMentions: {
                    repliedUser: false
                }
            })
        }
    }
}
