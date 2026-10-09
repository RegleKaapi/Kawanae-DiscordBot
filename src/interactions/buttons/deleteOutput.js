export const Button = {
    name: "deleteOutput",
    run: (interaction) => {
        if (!owner_id.some((userID) => userID == interaction.user.id)) return
        interaction.message.delete();
    }
}
