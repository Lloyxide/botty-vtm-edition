const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('todo')
        .setDescription('Permet au personnage de tenir sa todo-list')
        .addStringOption(option =>
            option.setName('add')
                .setDescription('Ajouter une entrée à la todolist')
        )
        .addIntegerOption(option =>
            option.setName('remove')
                .setDescription('Retire une entrée de la todolist')
        ),
    async execute(interaction) {
        const channel_id = interaction.channelId;
        const add = interaction.options.getString('add');
        const remove = interaction.options.getInteger('remove');

        db.get('SELECT todolist FROM characters WHERE channel_id = ?', [channel_id], (err, row) => {
            if (err) {
                return interaction.reply({ content: 'Erreur lors de la récupération du personnage.', ephemeral: true });
            }
            if (!row) {
                return interaction.reply({ content: 'Aucun personnage trouvé pour ce canal.', ephemeral: true });
            }

            let todo = row.todolist ? JSON.parse(row.todolist) : [];

            if (add) {
                todo.push(add);
            }

            if (remove !== null) {
                if (remove > 0 && remove <= todo.length) {
                    todo.splice(remove - 1, 1);
                } else {
                    return interaction.reply({ content: 'Index invalide.', ephemeral: true });
                }
            }

            db.run('UPDATE characters SET todolist = ? WHERE channel_id = ?', [JSON.stringify(todo), channel_id], (err) => {
                if (err) {
                    return interaction.reply({ content: 'Erreur lors de la mise à jour de la todo-list.', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setTitle('📜 To-Do List')
                    .setDescription(todo.length > 0 ? todo.map((item, index) => `**${index + 1}.** ${item}`).join('\n') : 'Aucune tâche.');

                interaction.reply({ embeds: [embed], ephemeral: false });
            });
        });
    },
};
