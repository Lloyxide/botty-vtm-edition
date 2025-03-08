const { SlashCommandBuilder, EmbedBuilder, time} = require('discord.js');
const db = require('../database');
const moment = require("moment/moment");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Rechercher un article dans les archives')
        .addStringOption(option =>
            option.setName('keywords')
                .setDescription('Mots clés séparés par des virgules (optionnel)'))
        .addStringOption(option =>
            option.setName('author')
                .setDescription('Auteur séparé par des virgules (optionnel)'))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Nom complet de l\'article (optionnel)')),

    async execute(interaction) {
        const keywords = interaction.options.getString('keywords') || null;
        const author = interaction.options.getString('author') || null;
        const name = interaction.options.getString('name') || null;

        db.get('SELECT current_date_in_game, news_channel FROM game_in_progress', (err, row) => {
            if (err || !row || !row.current_date_in_game) {
                return interaction.reply({
                    content: 'Aucune date définie. Utilisez `/date set [date]` d\'abord.',
                    ephemeral: true
                });
            }

            const timestamp = new Date(row.current_date_in_game).getTime() - 86400000;

            console.log(timestamp)
            console.log(row.current_date_in_game)

            if (name !== null) {
                return searchDocument(interaction, name, timestamp);
            } else {
                return searchArchives(interaction, keywords, author, timestamp);
            }

        });


    },
};

function searchDocument(interaction, name, date) {
    console.log(name)
    const query = 'SELECT * FROM archives WHERE name = ? AND (date IS NULL OR date <= ?) LIMIT 1';
    db.get(query, [name, date], (err, row) => {
        if (err) {
            console.error(err);
            return interaction.reply({ content: 'Erreur lors de la recherche des articles.', ephemeral: true });
        }

        if (!row) {
            return interaction.reply({ content: 'Aucun article trouvé.', ephemeral: false });
        }

        const displayDate = row.date ? moment(row.date).format("DD/MM/YYYY") : 'Non renseigné';

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("📜 " + row.name)
            .setFooter({ text: `Archives - Document #${row.id}` });

        if(row.author)
            embed.addFields({ name: '', value: '**Auteur :** ' + row.author, inline: false });

        if(row.date)
            embed.addFields({ name: '', value: '**Date :** ' + displayDate, inline: false });

        const chunks = row.article.split('\n');
        chunks.forEach((chunk, chunkIndex) => {
            embed.addFields({
                name: '',
                value: chunk
            });
        });


        return interaction.reply({ embeds: [embed] });
    });
}

function searchArchives(interaction, keywords, author, date) {
    let query = 'SELECT * FROM archives WHERE';
    let params = [];
    let conditions = [];

    if (keywords) {
        const keywordsArray = keywords.split(',').map(k => `%${k.trim()}%`);
        conditions.push(`(${keywordsArray.map(() => 'keywords LIKE ?').join(' OR ')})`);
        params.push(...keywordsArray);
    }

    if (author) {
        const authorsArray = author.split(',').map(a => `%${a.trim()}%`);
        conditions.push(`(${authorsArray.map(() => 'author LIKE ?').join(' OR ')})`);
        params.push(...authorsArray);
    }

    if (conditions.length === 0) {
        return interaction.reply({ content: 'Veuillez spécifier au moins un critère de recherche.', ephemeral: true });
    }

    query += ' ' + conditions.join(' OR ') + " AND (date <= " + date + " OR date IS NULL)";

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err);
            return interaction.reply({ content: 'Erreur lors de la recherche des articles.', ephemeral: true });
        }

        if (rows.length === 0) {
            return interaction.reply({ content: 'Aucun article trouvé.', ephemeral: false });
        }

        const results = rows.map(row => {
            const dateText = row.date ? moment(row.date).format('DD/MM/YYYY') : 'Date inconnue';
            const authorText = row.author ? row.author : 'Auteur inconnu';
            return `• **${row.name}** (${dateText}, ${authorText})`;
        }).join('\n');

        const searchCriteria = keywords ? `Mots-clés: ${keywords}` : `Auteur: ${author}`;
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`Résultats de la recherche (${searchCriteria})`)
            .setDescription(results);

        return interaction.reply({ embeds: [embed] });
    });
}
