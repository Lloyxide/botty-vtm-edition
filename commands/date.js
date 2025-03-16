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

                db.run('UPDATE game_in_progress SET current_date_in_game = ?', [nextDate], async (updateErr) => { // Ajout de async ici
                    if (updateErr) {
                        console.error(updateErr);
                        return interaction.reply({ content: 'Erreur lors du passage au jour suivant.', ephemeral: true });
                    }

                    try {
                        await regenerateDailyWillpower();

                        let { sunset, sunrise } = await getSunsetSunrise(currentDate, nextDate);

                        await interaction.reply({
                            content: `📅 Le jeu avance à la nuit du **${currentDate.format('DD/MM/YYYY')}** au **${moment(nextDate).format('DD/MM/YYYY')}** !\nLe soleil se couche à **${sunset}** et se lève à **${sunrise}**.`,
                            ephemeral: false
                        });

                        const timestamp = new Date(nextDate).getTime() - 86400000;

                        // Rechercher les articles de la Gazette de Gotham à la nouvelle date
                        db.all('SELECT * FROM archives WHERE date = ? AND author = ?', [timestamp, 'La Gazette de Gotham'], async (searchErr, articles) => {
                            if (searchErr) {
                                console.error(searchErr);
                                return;
                            }

                            const channel = await interaction.client.channels.fetch(row.news_channel);

                            if (articles.length === 0) {
                                return channel.send('📜 Aucune nouvelle publication aujourd\'hui.');
                            }

                            for (const article of articles) {
                                const embed = new EmbedBuilder()
                                    .setColor(0x0099ff)
                                    .setTitle(article.name)
                                    .setDescription(article.article)
                                    .setFooter({ text: `ID: ${article.id} | Gazette de Gotham` });

                                await channel.send({ embeds: [embed] });
                            }
                        });

                    } catch (err) {
                        console.error(err);
                        interaction.reply({ content: 'Erreur lors de la récupération des données.', ephemeral: true });
                    }
                });

            });
        }
    },
};

async function getSunsetSunrise(date1, date2, lat = 48.8566, lon = 2.3522) {
    const fetchSunData = async (date) => {
        const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    };

    try {
        const [data1, data2] = await Promise.all([fetchSunData(date1), fetchSunData(date2)]);

        return {
            sunset: new Date(data1.sunset).toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris" }),
            sunrise: new Date(data2.sunrise).toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris" })
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        return null;
    }
}

async function regenerateDailyWillpower() {
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE characters
            SET superficial_willpower = MAX(superficial_willpower - daily_willpower_regeneration, 0)
            WHERE daily_willpower_regeneration > 0
        `, function (err) {
            if (err) {
                console.error("Erreur lors de la régénération de la volonté :", err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}