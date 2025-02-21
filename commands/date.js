const { SlashCommandBuilder, EmbedBuilder, time} = require('discord.js');
const db = require('../database');
const moment = require('moment'); // Nécessite d'installer moment.js pour la gestion des dates

module.exports = {
    data: new SlashCommandBuilder()
        .setName('date')
        .setDescription('Gère la date de progression du jeu')
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
        const channelId = interaction.channelId; // Channel où la commande est utilisée

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
                if (err || !row) {
                    return interaction.reply({ content: 'Aucune date définie. Utilisez `/date set [date]` d\'abord.', ephemeral: true });
                }

                const currentDate = moment(row.current_date_in_game, 'YYYY-MM-DD');
                const nextDate = currentDate.clone().add(1, 'days').format('YYYY-MM-DD');

                db.run('UPDATE game_in_progress SET current_date_in_game = ?', [nextDate], (updateErr) => {
                    if (updateErr) {
                        console.error(updateErr);
                        return interaction.reply({ content: 'Erreur lors du passage au jour suivant.', ephemeral: true });
                    }

                    interaction.reply({ content: `📅 Le jeu avance à la nuit du **${currentDate.format('DD/MM/YYYY')}** au **${moment(nextDate).format('DD/MM/YYYY')}** !`, ephemeral: false });

                    const timestamp = new Date(nextDate).getTime()  - 86400000;

                    // Rechercher les articles de la Gazette de Gotham à la nouvelle date
                    db.all('SELECT * FROM archives WHERE date = ? AND author = ?', [timestamp, 'La Gazette de Gotham'], (searchErr, articles) => {
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
                                .setTitle(article.name)
                                .setDescription(article.article)
                                .setFooter({ text: `ID: ${article.id} | Gazette de Gotham` });

                            interaction.client.channels.fetch(row.news_channel)
                                .then(channel => channel.send({ embeds: [embed] }))
                                .catch(console.error);
                        });
                    });
                });
            });
        }
    },
};
