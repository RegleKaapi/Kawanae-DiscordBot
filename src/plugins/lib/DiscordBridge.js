const DISCORD_BRIDGE_CHANNEL = "1461689553780867285";
const TARGET_WA_GROUP = "120363368482044182@g.us"; // The @g.us ID of your group

export const LibEvent = {
    name: "discordbridge",
    type: "messageCreate",
    run: async (message, client) => {
        const waConn = global.conn
        // 2. CRITICAL: Ignore all bot messages!
        // If you don't do this, your Webhook will trigger this event, 
        // creating an infinite spam loop that will crash your bot.
        if (message.author.bot) return;

        // 3. Only listen to the designated bridge channel
        if (message.channel.id !== "1461689553780867285") return;

        // 4. Format the message for WhatsApp
        // Adding a small tag so WA users know it came from Discord
        let userSender = `[Discord Chat Bridge] 👤 ${message.member.displayName}`;
        
        let userAvatar = (message.author.displayAvatarURL()).replace("webp", "png")
        try {
            // 5. Handle Discord Attachments (Images, Videos, Files)
            /*if (message.attachments.size > 0) {
                for (const [id, attachment] of message.attachments) {
                    const url = attachment.url;
                    const type = attachment.contentType || '';

                    // Baileys can download directly from a Discord attachment URL
                    if (type.startsWith('image/')) {
                        await waConn.sendMessage(TARGET_WA_GROUP, {
                            image: {
                                url: url
                            },
                            caption: textToSend
                        });
                        textToSend = ''; // Clear text so it isn't sent twice if there are multiple images
                    } else if (type.startsWith('video/')) {
                        await waConn.sendMessage(TARGET_WA_GROUP, {
                            video: {
                                url: url
                            },
                            caption: textToSend
                        });
                        textToSend = '';
                    } else {
                        // Send as a document/file
                        await waConn.sendMessage(TARGET_WA_GROUP, {
                            document: {
                                url: url
                            },
                            mimetype: type,
                            fileName: attachment.name,
                            caption: textToSend
                        });
                        textToSend = '';
                    }
                }
            }*/

            // 6. Send the message if it was just text (or if attachments didn't consume the text)
            if (message.content) {
                await conn.reply("120363368482044182@g.us", message.content.trim(), 0, {
                    quoted: {
                        key: {
                            participant: conn.user.jid
                        },
                        message: {
                            documentMessage: {
                                title: userSender,
                                text: "Test",
                                jpegThumbnail: await (await conn.getFile(userAvatar))?.data
                            }
                        }
                    }
                });
            }

        } catch (error) {
            console.error("❌ Failed to send Discord message to WhatsApp:", error);
            message.delete().catch(() => {}); // Optional: React in Discord if it fails
        }
    }
}