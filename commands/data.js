const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('data')
        .setDescription('Gérer les données de la base')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Restreint l'utilisation aux administrateurs
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Ajouter un élément à la base de données')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type d\'élément à ajouter')
                        .setRequired(true)
                        .setChoices(
                            { name: 'discipline', value: 'discipline' },
                            { name: 'ability', value: 'ability' },
                            { name: 'merit', value: 'merit' },
                            { name: 'flaw', value: 'flaw' },
                            { name: 'background', value: 'background' }
                        ))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nom de l\'élément')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('dots')
                        .setDescription('Nombre de points (pour les compétences)'))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description de l\'élément'))
                .addStringOption(option =>
                    option.setName('discipline')
                        .setDescription('Nom de la discipline associée (pour les compétences)')))
        .addSubcommand(subcommand =>
            subcommand.setName('get')
                .setDescription('Récupérer les éléments de la base de données')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type d\'élément à récupérer')
                        .setRequired(true)
                        .setChoices(
                            { name: 'discipline', value: 'discipline' },
                            { name: 'ability', value: 'ability' },
                            { name: 'merit', value: 'merit' },
                            { name: 'flaw', value: 'flaw' },
                            { name: 'background', value: 'background' }
                        ))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            await handleAdd(interaction);
        } else if (subcommand === 'get') {
            await handleGet(interaction);
        }
    },
};

async function handleAdd(interaction) {
    const type = interaction.options.getString('type');
    const name = interaction.options.getString('name');
    const dots = interaction.options.getInteger('dots');
    const description = interaction.options.getString('description');
    const disciplineName = interaction.options.getString('discipline');

    let query;
    let params;

    switch (type) {
        case 'discipline':
            query = 'INSERT INTO disciplines (name) VALUES (?)';
            params = [name];
            break;
        case 'ability':
            if (!disciplineName) {
                return interaction.reply({ content: 'Vous devez spécifier une discipline pour cette compétence.', ephemeral: true });
            }
            db.get('SELECT id FROM disciplines WHERE name = ?', [disciplineName], (err, row) => {
                if (err || !row) {
                    return interaction.reply({ content: 'Discipline non trouvée.', ephemeral: true });
                }
                query = 'INSERT INTO abilities (name, dots, description, id_discipline) VALUES (?, ?, ?, ?)';
                params = [name, dots, description, row.id];
                db.run(query, params, function(err) {
                    if (err) {
                        return interaction.reply({ content: 'Erreur lors de l\'ajout de la compétence.', ephemeral: true });
                    }
                    interaction.reply({ content: 'Compétence ajoutée avec succès!', ephemeral: true });
                });
            });
            return;
        case 'merit':
            query = 'INSERT INTO merits (name) VALUES (?)';
            params = [name];
            break;
        case 'flaw':
            query = 'INSERT INTO flaws (name) VALUES (?)';
            params = [name];
            break;
        case 'background':
            query = 'INSERT INTO backgrounds (name) VALUES (?)';
            params = [name];
            break;
        default:
            return interaction.reply({ content: 'Type d\'élément non valide.', ephemeral: true });
    }

    db.run(query, params, function(err) {
        if (err) {
            return interaction.reply({ content: `Erreur lors de l'ajout de l'élément ${type}.`, ephemeral: true });
        }
        interaction.reply({ content: `Élément ${type} ajouté avec succès!`, ephemeral: true });
    });
}

async function handleGet(interaction) {
    const type = interaction.options.getString('type');
    let query;
    let embed = new EmbedBuilder();

    switch (type) {
        case 'discipline':
            query = 'SELECT * FROM disciplines ORDER BY name ASC';
            break;
        case 'ability':
            query = `SELECT a.*, d.name AS discipline_name
                     FROM abilities a
                     JOIN disciplines d ON a.id_discipline = d.id
                     ORDER BY d.name ASC, a.dots ASC`;
            break;
        case 'merit':
            query = 'SELECT * FROM merits ORDER BY name ASC';
            break;
        case 'flaw':
            query = 'SELECT * FROM flaws ORDER BY name ASC';
            break;
        case 'background':
            query = 'SELECT * FROM backgrounds ORDER BY name ASC';
            break;
        default:
            return interaction.reply({ content: 'Type d\'élément non valide.', ephemeral: true });
    }

    db.all(query, [], (err, rows) => {
        if (err) {
            return interaction.reply({ content: `Erreur lors de la récupération des éléments ${type}.`, ephemeral: true });
        }
        if (rows.length === 0) {
            return interaction.reply({ content: `Aucun élément ${type} trouvé.`, ephemeral: true });
        }

        if (type === 'ability') {
            let groupedAbilities = {};
            rows.forEach(row => {
                if (!groupedAbilities[row.discipline_name]) {
                    groupedAbilities[row.discipline_name] = [];
                }
                groupedAbilities[row.discipline_name].push(row);
            });

            for (const [discipline, abilities] of Object.entries(groupedAbilities)) {
                embed.addFields({ name: discipline, value: abilities.map(a => `• ${a.name} (Points: ${a.dots})`).join('\n') });
            }
        } else {
            embed.setDescription(rows.map(row => `• ${row.name}`).join('\n'));
        }

        embed.setTitle(`Liste des ${type}s`);
        interaction.reply({ embeds: [embed], ephemeral: true });
    });
}
