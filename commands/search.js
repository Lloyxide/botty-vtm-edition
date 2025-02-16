const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');

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

        if (name !== null) {
            return searchDocument(interaction, name);
        } else {
            return searchArchives(interaction, keywords, author);
        }
    },
};

function searchDocument(interaction, name) {
    const query = 'SELECT * FROM archives WHERE name LIKE ? LIMIT 1';
    db.get(query, [`%${name}%`], (err, row) => {
        if (err) {
            console.error(err);
            return interaction.reply({ content: 'Erreur lors de la recherche des articles.', ephemeral: true });
        }

        if (!row) {
            return interaction.reply({ content: 'Aucun article trouvé.', ephemeral: false });
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("📜 " + row.name)
            .setDescription(row.article)
            .addFields(
                { name: '', value: '**Auteur :** ' + (row.author || 'Non renseigné'), inline: false },
                { name: '', value: '**Date :** ' + (row.date || 'Non renseigné'), inline: false }
            )
            .setFooter({ text: `Archives - Document #${row.id}` });

        return interaction.reply({ embeds: [embed] });
    });
}

function searchArchives(interaction, keywords, author) {
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

    query += ' ' + conditions.join(' OR ');

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err);
            return interaction.reply({ content: 'Erreur lors de la recherche des articles.', ephemeral: true });
        }

        if (rows.length === 0) {
            return interaction.reply({ content: 'Aucun article trouvé.', ephemeral: false });
        }

        const results = rows.map(row => {
            const dateText = row.date ? row.date : 'Date inconnue';
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
