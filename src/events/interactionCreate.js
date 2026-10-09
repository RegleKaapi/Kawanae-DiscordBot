import commandOptionsChecker from "../structures/commandOptions/processor.js";
import chalk from 'chalk'

export const Event = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        if (interaction.isChatInputCommand()) {
            const slashCommand = client.slashCommands.get(interaction.commandName);
            if (!slashCommand) return;

            if (!await commandOptionsChecker(client, interaction, slashCommand, "SlashCommand")) return
            slashCommand.run(client, interaction);
        }

        else if (interaction.isAutocomplete()) {
            const slashCommand = client.slashCommands.get(interaction.commandName);
            if (!slashCommand || !slashCommand.autocomplete) return;

            if (!await commandOptionsChecker(client, interaction, slashCommand, "SlashCommand")) return;
            slashCommand.autocomplete(client, interaction);
        }

        else if (interaction.isContextMenuCommand()) {
            const contextMenu = client.contextMenus.get(interaction.commandName);
            if (!contextMenu) return;

            if (!await commandOptionsChecker(client, interaction, contextMenu, "ContextMenu")) return;
            contextMenu.run(interaction, client);
        }

        else if (interaction.isAnySelectMenu()) {
            const selectMenuCommand = client.selectMenus.get(interaction.values[0]) ?? client.selectMenus.get(interaction.customId);
            if (!selectMenuCommand) return;

            if (!await commandOptionsChecker(client, interaction, selectMenuCommand, "SelectMenu")) return;
            selectMenuCommand.run(interaction, client);
        }

        else if (interaction.isButton()) {
            const buttonInteraction = client.buttonCommands.get(interaction.customId);
            if (!buttonInteraction) return;

            if (!await commandOptionsChecker(client, interaction, buttonInteraction, "Button")) return;
            buttonInteraction.run(interaction, client)
            console.log(`
\n▣ ${chalk.blueBright(client.user?.tag)}\n│⏰ ${chalk.black(chalk.bgGreen(new Date))}\n│🔰 ${chalk.yellow(interaction.message.guild.id+' - '+interaction.message.guild.name)}\n│📑 ${chalk.yellow(interaction.message.channel.id+' - #'+interaction.message.channel.name)}\n│👤 ${chalk.yellow(interaction.user.id+' - @'+interaction.user.tag)}\n│💬 ${chalk.black(chalk.bgRed('Button Interaction'))}
▣──────···
\n\nㅤ
`.trim())
        }

        else if (interaction.isModalSubmit()) {
            const modalInteraction = client.modalForms.get(interaction.customId);
            if (!modalInteraction) return;

            if (!await commandOptionsChecker(client, interaction, modalInteraction, "ModalForm")) return;
            modalInteraction.run(interaction, client);
        };
    }
}; // InteractionCreate event to handle all interactions and execute them.