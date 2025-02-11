const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('me')
        .setDescription('Gérer le personnage lié au canal')
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Ajouter un personnage au canal')
                .addStringOption(option =>
                    option.setName('status')
                        .setDescription('Informations de statut du personnage (JSON)'))
                .addStringOption(option =>
                    option.setName('skills')
                        .setDescription('Compétences du personnage (JSON)'))
                .addStringOption(option =>
                    option.setName('background')
                        .setDescription('Historique du personnage (JSON)')))
        .addSubcommand(subcommand =>
            subcommand.setName('update')
                .setDescription('Mettre à jour le personnage du canal')
                .addStringOption(option =>
                    option.setName('status')
                        .setDescription('Informations de statut du personnage (JSON)'))
                .addStringOption(option =>
                    option.setName('skills')
                        .setDescription('Compétences du personnage (JSON)'))
                .addStringOption(option =>
                    option.setName('background')
                        .setDescription('Historique du personnage (JSON)')))
        .addSubcommand(subcommand =>
            subcommand.setName('get')
                .setDescription('Récupérer le personnage du canal')
                .addStringOption(option =>
                    option.setName('section')
                        .setDescription('Section à récupérer (status, skills, background)')
                        .setChoices(
                            { name: 'status', value: 'status' },
                            { name: 'skills', value: 'skills' },
                            { name: 'background', value: 'background' }
                        ))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel_id = interaction.channelId;

        if (subcommand === 'add') {
            const status = interaction.options.getString('status') || '{}';
            const skills = interaction.options.getString('skills') || '{}';
            const background = interaction.options.getString('background') || '{}';

            db.run('INSERT INTO characters (user_id, channel_id, status, skills, background) VALUES (?, ?, ?, ?, ?)',
                [interaction.user.id, channel_id, status, skills, background], function(err) {
                    if (err) {
                        return interaction.reply({ content: 'Erreur lors de l\'ajout du personnage.', ephemeral: true });
                    }
                    interaction.reply({ content: 'Personnage ajouté avec succès!', ephemeral: true });
                });
        } else if (subcommand === 'update') {
            const status = interaction.options.getString('status');
            const skills = interaction.options.getString('skills');
            const background = interaction.options.getString('background');

            const updates = {};
            if (status !== null) updates.status = status;
            if (skills !== null) updates.skills = skills;
            if (background !== null) updates.background = background;

            const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            values.push(channel_id);

            db.run(`UPDATE characters SET ${setClause} WHERE channel_id = ?`, values, function(err) {
                if (err) {
                    return interaction.reply({ content: 'Erreur lors de la mise à jour du personnage.', ephemeral: true });
                }
                interaction.reply({ content: 'Personnage mis à jour avec succès!', ephemeral: true });
            });
        } else if (subcommand === 'get') {
            const section = interaction.options.getString('section');

            db.get('SELECT * FROM characters WHERE channel_id = ?', [channel_id], (err, row) => {
                if (err) {
                    return interaction.reply({ content: 'Erreur lors de la récupération du personnage.', ephemeral: true });
                }
                if (!row) {
                    return interaction.reply({ content: 'Aucun personnage trouvé pour ce canal.', ephemeral: true });
                }

                let replyContent = 'Personnage:';
                if (section) {
                    replyContent += `\n${section}: ${row[section]}`;
                } else {
                    replyContent += `\nStatus: ${row.status}\nSkills: ${row.skills}\nBackground: ${row.background}`;
                }

                interaction.reply({ content: replyContent, ephemeral: true });
            });
        }
    },
};
