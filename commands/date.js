const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('date')
        .setDescription('Gère la date de progression du jeu')
        .setDefaultMemberPermissions(8)
        .addSubcommand(subcommand =>
            subcommand.setName('set')
                .setDescription('Définit la date de progression du jeu')
                .addStringOption(option =>
                    option.setName('date')
                        .setDescription('Date au format dd/mm/yyyy')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('next')
                .setDescription('Avance la date au jour suivant et affiche les news')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channelId = interaction.channelId;

        if (subcommand === 'set') {
            const dateInput = interaction.options.getString('date');
            const parsedDate = moment(dateInput, 'DD/MM/YYYY', true);

            if (!parsedDate.isValid()) {
                return interaction.reply({ content: 'Format de date invalide. Utilisez DD/MM/YYYY.', ephemeral: true });
            }

            const formattedDate = parsedDate.format('YYYY-MM-DD');

            db.run('DELETE FROM game_in_progress');
            db.run('INSERT INTO game_in_progress (current_date_in_game, news_channel) VALUES (?, ?)', [formattedDate, channelId], (err) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Erreur lors de l\'enregistrement de la date.', ephemeral: true });
                }
                interaction.reply({ content: `📅 Date de progression définie : **${dateInput}**`, ephemeral: false });
            });

        } else if (subcommand === 'next') {
            db.get('SELECT current_date_in_game, news_channel FROM game_in_progress', (err, row) => {
                if (err || !row || !row.current_date_in_game) {
                    return interaction.reply({ content: 'Aucune date définie. Utilisez `/date set [date]` d\'abord.', ephemeral: true });
                }

                console.log(`🔍 Date actuelle récupérée avant update: ${row.current_date_in_game}`);

                let currentDate = moment(row.current_date_in_game, 'YYYY-MM-DD');

                if (!currentDate.isValid()) {
                    return interaction.reply({ content: 'Erreur : la date enregistrée est invalide.', ephemeral: true });
                }

                const nextDate = currentDate.add(1, 'days').format('YYYY-MM-DD');
                console.log(`➡️ Nouvelle date calculée: ${nextDate}`);

                // 🔥 Suppression puis réinsertion pour éviter le problème d'update
                db.run('DELETE FROM game_in_progress', (deleteErr) => {
                    if (deleteErr) {
                        console.error(deleteErr);
                        return;
                    }

                    db.run('INSERT INTO game_in_progress (current_date_in_game, news_channel) VALUES (?, ?)', [nextDate, row.news_channel], (insertErr) => {
                        if (insertErr) {
                            console.error(insertErr);
                            return interaction.reply({ content: 'Erreur lors de la mise à jour de la date.', ephemeral: true });
                        }

                        console.log(`✅ Nouvelle date confirmée par la DB: ${nextDate}`);
                        const formattedDate = moment(nextDate).format('DD/MM/YYYY');
                        //interaction.reply({ content: `📅 Le jeu avance au **${formattedDate}** !`, ephemeral: false });

                        interaction.client.channels.fetch(row.news_channel)
                            .then(channel => channel.send({ content: `📅 Le jeu avance au **${formattedDate}** !`, ephemeral: false }))
                            .catch(console.error);

                        console.log('SELECT * FROM archives WHERE date = ' + formattedDate + ' AND author = La Gazette de Gotham')

                        // 🔎 **Rechercher les articles de la Gazette de Gotham**
                        db.all('SELECT * FROM archives WHERE date = ? AND author LIKE ?', [formattedDate, 'La Gazette de Gotham'], (searchErr, articles) => {
                            if (searchErr) {
                                console.error(searchErr);
                                return;
                            }

                            if (articles.length === 0) {
                                return interaction.client.channels.fetch(row.news_channel)
                                    .then(channel => channel.send('📜 Aucune nouvelle publication aujourd\'hui.'));
                            }

                            articles.forEach(article => {
                                const embed = new EmbedBuilder()
                                    .setColor(0x0099ff)
                                    .setTitle("📜 " + article.name)
                                    .setDescription(article.article)
                                    .addFields(
                                        { name: '', value: '**Auteur :** ' + (article.author || 'Non renseigné'), inline: false },
                                        { name: '', value: '**Date :** ' + (article.date || 'Non renseigné'), inline: false }
                                    )
                                    .setFooter({ text: `Archives - Document #${article.id}` });

                                interaction.client.channels.fetch(row.news_channel)
                                    .then(channel => channel.send({ embeds: [embed] }))
                                    .catch(console.error);
                            });
                        });
                    });
                });
            });
        }
    },
};
