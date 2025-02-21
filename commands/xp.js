const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');
const xp_costs = require('../docs/xp_costs.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Xp du personnage et informations'),
    async execute(interaction) {
        const channel_id = interaction.channelId;

        db.get('SELECT * FROM characters WHERE channel_id = ?', [channel_id], (err, row) => {
            if (err) {
                return interaction.reply({ content: 'Erreur lors de la récupération du personnage.', ephemeral: true });
            }
            if (!row) {
                return interaction.reply({ content: 'Aucun personnage trouvé pour ce canal.', ephemeral: true });
            }

            const identity = JSON.parse(row.identity);

            const embed = new EmbedBuilder()
                .setTitle("Expérience de " + identity.name + " : " + row.xp);

            let result = "";

            xp_costs.forEach(item => {
                result += `- **${item.trait}** : ${item.cost}\n`;
            });

            embed.addFields(
                { name: '', value: result, inline: true }
            )

            embed.setFooter({ text: 'Gotham by Night - XP' });

            interaction.reply({ embeds: [embed], ephemeral: false });

        });
    },
};