const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');
const moment = require("moment/moment");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('archives')
        .setDescription('Ajouter ou mettre à jour un article dans les archives')
        .setDefaultMemberPermissions(8)
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
                .setDescription('Date de parution (optionnel)')),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const keywords = interaction.options.getString('keywords').split(',').map(keyword => keyword.trim());
        let article = interaction.options.getString('article');
        if(interaction.options.getString('article_2'))
            article +=  '\n' + interaction.options.getString('article_2');
        const author = interaction.options.getString('author') || null;
        const date = interaction.options.getString('date') || null;

        // Conversion de la date en format yyyy-mm-dd
        let formattedDate = null;
        let timestamp;
        if (date) {
            const parsedDate = moment(date, "DD/MM/YYYY", true);
            if (!parsedDate.isValid()) {
                return interaction.reply({ content: 'Format de date invalide. Utilisez dd/mm/yyyy.', ephemeral: true });
            }
            formattedDate = parsedDate.format("YYYY-MM-DD");
            timestamp = new Date(formattedDate).getTime();
        }

        const articleData = {
            name,
            author,
            date: timestamp,
            keywords: JSON.stringify(keywords),
            article,
        };
        db.run('INSERT INTO archives (name, author, date, keywords, article) VALUES (?, ?, ?, ?, ?)',
            [articleData.name, articleData.author, articleData.date, articleData.keywords, articleData.article], function(err) {
                if (err) {
                    console.log(err);
                    return interaction.reply({ content: 'Erreur lors de l\'ajout de l\'article.', ephemeral: true });
                }
                const articleId = this.lastID;

                const embed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`📜 ${name}`)
                    .setFooter({ text: `Archives - Document #${articleId}` });

                if(author !== null) embed.addFields({ name: '', value: '**Auteur :** ' + author, inline: false });
                if(date !== null) embed.addFields({ name: '', value: '**Date :** ' + date, inline: false });

                embed.addFields(
                    { name: '', value: '**Mots-clé :** ' + keywords.join(", "), inline: false },
                );

                const chunks = articleData.article.split('\n');
                chunks.forEach((chunk, chunkIndex) => {
                    embed.addFields({
                        name: '',
                        value: chunk
                    });
                });

                return interaction.reply({ embeds: [embed] });
            });
    },
};
// /archives name:Olala keywords:peur, panique, douggy article:On a tous peur de douggy ce doggo