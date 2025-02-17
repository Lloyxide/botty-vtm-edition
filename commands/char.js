const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('char')
        .setDescription('Créer ou mettre à jour un personnage')
        .setDefaultMemberPermissions(8)
        .addStringOption(option =>
            option.setName('identity')
                .setDescription('Identité du personnage (JSON)'))
        .addStringOption(option =>
            option.setName('skills')
                .setDescription('Compétences du personnage (JSON)'))
        .addStringOption(option =>
            option.setName('disciplines')
                .setDescription('Disciplines du personnage (JSON)'))
        .addStringOption(option =>
            option.setName('history')
                .setDescription('Historique du personnage (JSON)'))
        .addIntegerOption(option =>
            option.setName('hunger')
                .setDescription('Faim du personnage'))
        .addIntegerOption(option =>
            option.setName('max_health')
                .setDescription('Points de vie maximum du personnage'))
        .addIntegerOption(option =>
            option.setName('aggravated_damage')
                .setDescription('Dégâts aggravés du personnage'))
        .addIntegerOption(option =>
            option.setName('superficial_damage')
                .setDescription('Dégâts superficiels du personnage'))
        .addIntegerOption(option =>
            option.setName('max_willpower')
                .setDescription('Points de volonté maximum du personnage'))
        .addIntegerOption(option =>
            option.setName('aggravated_willpower')
                .setDescription('Volonté aggravée du personnage'))
        .addIntegerOption(option =>
            option.setName('superficial_willpower')
                .setDescription('Volonté superficielle du personnage'))
        .addIntegerOption(option =>
            option.setName('stains')
                .setDescription('Flétrissures du personnage'))
        .addIntegerOption(option =>
            option.setName('xp')
                .setDescription('Expérience du personnage')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const channel_id = interaction.channelId;

        // Récupérer les options et éviter les valeurs undefined
        const getOption = (name) => {
            const value = interaction.options.getString(name);
            return value ? value : null;
        };

        const getIntOption = (name) => {
            const value = interaction.options.getInteger(name);
            return value !== null ? value : null;
        };

        const updates = {
            identity: getOption('identity'),
            skills: getOption('skills'),
            history: getOption('history'),
            disciplines: getOption('disciplines'),
            hunger: getIntOption('hunger'),
            max_damage: getIntOption('max_health'),
            aggravated_damage: getIntOption('aggravated_damage'),
            superficial_damage: getIntOption('superficial_damage'),
            max_willpower: getIntOption('max_willpower'),
            aggravated_willpower: getIntOption('aggravated_willpower'),
            superficial_willpower: getIntOption('superficial_willpower'),
            stains: getIntOption('stains'),
            xp: getIntOption('xp'),
        };

        // Vérifier la validité des champs JSON
        for (let key of ['identity', 'skills', 'history', 'disciplines', 'merits', 'flaws']) {
            if (updates[key]) {
                try {
                    JSON.parse(updates[key]);
                } catch (e) {
                    return interaction.editReply({ content: `Erreur : le champ \`${key}\` doit être un JSON valide.`, ephemeral: true });
                }
            }
        }

        db.get('SELECT * FROM characters WHERE channel_id = ?', [channel_id], (err, row) => {
            if (err) {
                return interaction.editReply({ content: 'Erreur lors de la récupération du personnage.', ephemeral: true });
            }

            if (row) {
                // Mise à jour du personnage
                const setClause = Object.entries(updates)
                    .filter(([_, value]) => value !== null)
                    .map(([key]) => `${key} = ?`)
                    .join(', ');

                if (!setClause) {
                    return interaction.editReply({ content: 'Aucune mise à jour apportée au personnage.', ephemeral: true });
                }

                const values = Object.values(updates).filter(value => value !== null);
                values.push(channel_id);

                db.run(`UPDATE characters SET ${setClause} WHERE channel_id = ?`, values, (err) => {
                    if (err) {
                        return interaction.editReply({ content: 'Erreur lors de la mise à jour du personnage.', ephemeral: true });
                    }
                    interaction.editReply({ content: 'Personnage mis à jour avec succès!', ephemeral: true });
                });
            } else {
                // Création du personnage
                const columns = ['channel_id', ...Object.keys(updates).filter(key => updates[key] !== null)];
                const placeholders = columns.map(() => '?').join(', ');
                const values = [channel_id, ...Object.values(updates).filter(value => value !== null)];

                db.run(`INSERT INTO characters (${columns.join(', ')}) VALUES (${placeholders})`, values, (err) => {
                    if (err) {
                        console.log(err)
                        return interaction.editReply({ content: 'Erreur lors de l\'ajout du personnage.', ephemeral: true });
                    }
                    interaction.editReply({ content: 'Personnage ajouté avec succès!', ephemeral: true });
                });
            }
        });
    },
};

