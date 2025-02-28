const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database'); // Adapte selon ton projet
const { createCanvas } = require('canvas');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Affiche les statistiques des jets de dés sous forme de graphique')
        .setDefaultMemberPermissions(8),

    async execute(interaction) {
        const channel_id = interaction.channelId;

        // Récupérer les données des jets pour tous les channel_id
        db.all(`SELECT channel_id, rolls FROM roll_history`, async (err, rows) => {
            if (err) {
                console.error("Erreur lors de la récupération des stats :", err);
                return interaction.reply({ content: "Erreur lors de la récupération des statistiques.", ephemeral: true });
            }

            if (rows.length === 0) {
                return interaction.reply({ content: "Aucune donnée trouvée pour ce salon.", ephemeral: true });
            }

            // Si le channel_id est présent dans le tableau, afficher uniquement ses stats
            const channelsToShow = rows.some(row => row.channel_id === channel_id) ? [channel_id] : Array.from(new Set(rows.map(row => row.channel_id)));

            // Pour chaque channel_id, récupérer les stats
            for (const id of channelsToShow) {
                let rollCounts = Array(10).fill(0); // Stocke la fréquence des valeurs 1-10

                const channelRows = rows.filter(row => row.channel_id === id);

                channelRows.forEach(row => {
                    let diceRolls = JSON.parse(row.rolls);
                    diceRolls.forEach(die => {
                        if (die >= 1 && die <= 10) {
                            rollCounts[die - 1]++;
                        }
                    });
                });

                // 🎨 Générer le graphique et l'envoyer
                await generateBarChart(rollCounts, id, interaction);
            }
        });
    }
};

// 🎨 Fonction pour créer le Bar Chart
async function generateBarChart(rollCounts, channel_id, interaction) {
    const width = 600;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 📊 Dessiner le graphique
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Fréquence des valeurs (1-10)', 180, 30);

    const barWidth = 40;
    const maxCount = Math.max(...rollCounts);
    const scale = maxCount > 0 ? (300 / maxCount) : 1; // Échelle pour le graphique

    for (let i = 0; i < 10; i++) {
        const barHeight = rollCounts[i] * scale;
        ctx.fillStyle = '#007bff'; // Bleu Discord
        ctx.fillRect(50 + i * 50, height - barHeight - 50, barWidth, barHeight);
        ctx.fillStyle = 'black';
        ctx.fillText((i + 1).toString(), 60 + i * 50, height - 20);
    }

    // Sauvegarde de l'image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`./stats/stats_chart_${channel_id}.png`, buffer);

    // 📎 Attachement de l'image
    const attachment = new AttachmentBuilder(`./stats/stats_chart_${channel_id}.png`);

    // 📊 Embed avec l'image
    const embed = new EmbedBuilder()
        .setTitle("📊 Statistiques des jets de dés")
        .setDescription(`Voici la distribution des valeurs obtenues pour le salon ${channel_id} :`)
        .setImage('attachment://stats_chart.png')
        .setColor("#0099ff");

    await interaction.reply({ embeds: [embed], files: [attachment] });
}
