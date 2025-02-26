const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const db = require('../database');
const moment = require("moment/moment");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('archives')
        .setDescription('Gérer les archives')
        .setDefaultMemberPermissions(8)
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Ajouter un article aux archives')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nom de l\'article')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('keywords')
                        .setDescription('Mots clés séparés par des virgules')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('article')
                        .setDescription('Contenu de l\'article')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('article_2')
                        .setDescription('Contenu de l\'article (partie 2)'))
                .addStringOption(option =>
                    option.setName('author')
                        .setDescription('Auteur de l\'article (optionnel)'))
                .addStringOption(option =>
                    option.setName('date')
                        .setDescription('Date de parution (optionnel)')))
        .addSubcommand(subcommand =>
            subcommand.setName('edit')
                .setDescription('Modifier un article existant')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('ID de l\'article à modifier')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nouveau nom de l\'article'))
                .addStringOption(option =>
                    option.setName('keywords')
                        .setDescription('Nouveaux mots clés séparés par des virgules'))
                .addStringOption(option =>
                    option.setName('article')
                        .setDescription('Nouveau contenu de l\'article'))
                .addStringOption(option =>
                    option.setName('author')
                        .setDescription('Nouvel auteur de l\'article'))
                .addStringOption(option =>
                    option.setName('date')
                        .setDescription('Nouvelle date de parution')))
        .addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription('Supprimer un article des archives')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('ID de l\'article à supprimer')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const name = interaction.options.getString('name');
            const keywords = interaction.options.getString('keywords').split(',').map(keyword => keyword.trim());
            let article = interaction.options.getString('article');
            if (interaction.options.getString('article_2'))
                article += '\n' + interaction.options.getString('article_2');
            const author = interaction.options.getString('author') || null;
            const date = interaction.options.getString('date') || null;

            let formattedDate = null;
            let timestamp;
            if (date) {
                const parsedDate = moment(date, "DD/MM/YYYY", true);
                if (!parsedDate.isValid()) {
                    return interaction.reply({
                        content: 'Format de date invalide. Utilisez dd/mm/yyyy.',
                        ephemeral: true
                    });
                }
                formattedDate = parsedDate.format("YYYY-MM-DD");
                timestamp = new Date(formattedDate).getTime();
            }

            db.run('INSERT INTO archives (name, author, date, keywords, article) VALUES (?, ?, ?, ?, ?)',
                [name, author, timestamp, JSON.stringify(keywords), article], function (err) {
                    if (err) return interaction.reply({
                        content: 'Erreur lors de l\'ajout de l\'article.',
                        ephemeral: true
                    });

                    const articleId = this.lastID;
                    const embed = createArticleEmbed(articleId, name, author, date, keywords, article);

                    return interaction.reply({embeds: [embed]});
                });
        } else if (subcommand === 'edit') {
            const id = interaction.options.getInteger('id');

            db.get('SELECT * FROM archives WHERE id = ?', [id], (err, row) => {
                if (err || !row) {
                    return interaction.reply({content: "Article non trouvé.", ephemeral: true});
                }

                const newName = interaction.options.getString('name') || row.name;
                const newKeywords = interaction.options.getString('keywords') ? JSON.stringify(interaction.options.getString('keywords').split(',').map(k => k.trim())) : row.keywords;
                const newArticle = interaction.options.getString('article') || row.article;
                const newAuthor = interaction.options.getString('author') || row.author;
                let newDate = row.date;

                const dateInput = interaction.options.getString('date');
                if (dateInput) {
                    const parsedDate = moment(dateInput, "DD/MM/YYYY", true);
                    if (!parsedDate.isValid()) {
                        return interaction.reply({content: "Format de date invalide. Utilisez dd/mm/yyyy.", ephemeral: true});
                    }
                    newDate = new Date(parsedDate.format("YYYY-MM-DD")).getTime();
                }

                db.run(
                    'UPDATE archives SET name = ?, keywords = ?, article = ?, author = ?, date = ? WHERE id = ?',
                    [newName, newKeywords, newArticle, newAuthor, newDate, id],
                    function (updateErr) {
                        if (updateErr) {
                            return interaction.reply({content: "Erreur lors de la mise à jour de l'article.", ephemeral: true});
                        }

                        const embed = createArticleEmbed(id, newName, newAuthor, dateInput || row.date, JSON.parse(newKeywords), newArticle);
                        return interaction.reply({content: "Article mis à jour avec succès !", embeds: [embed]});
                    }
                );
            });
        } else if (subcommand === 'delete') {
            const id = interaction.options.getInteger('id');
            db.get('SELECT * FROM archives WHERE id = ?', [id], (err, row) => {
                if (err || !row) {
                    return interaction.reply({content: 'Article non trouvé.', ephemeral: true});
                }
                db.run('DELETE FROM archives WHERE id = ?', [id], function (err) {
                    if (err || this.changes === 0) {
                        return interaction.reply({content: 'Erreur ou ID invalide.', ephemeral: true});
                    }
                    const embed = createArticleEmbed(id, row.name, row.author, row.date, JSON.parse(row.keywords), row.article);
                    return interaction.reply({embeds: [embed]});
                });
            });
        }
    }
};

function createArticleEmbed(articleId, name, author, date, keywords, article) {
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('📜 ' + name)
        .setFooter({text: 'Archives - Document #' + articleId});

    if (author !== null) embed.addFields({name: '', value: '**Auteur :** ' + author, inline: false});
    if (date !== null) embed.addFields({name: '', value: '**Date :** ' + date, inline: false});

    embed.addFields(
        {name: '', value: '**Mots-clé :** ' + keywords.join(", "), inline: false},
    );

    const chunks = article.split('\n');
    chunks.forEach(chunk => {
        embed.addFields({
            name: '',
            value: chunk
        });
    });

    return embed;
}