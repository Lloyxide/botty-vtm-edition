const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('me')
        .setDescription('Obtenir les informations du personnage')
        .addStringOption(option =>
            option.setName('section')
                .setDescription('Section à afficher')
                .setChoices(
                    { name: 'skills', value: 'skills' },
                    { name: 'disciplines', value: 'disciplines' },
                    { name: 'history', value: 'history' },
                    { name: 'all', value: 'all' }
                )),
    async execute(interaction) {
        const channel_id = interaction.channelId;
        const section = interaction.options.getString('section');

        db.get('SELECT * FROM characters WHERE channel_id = ?', [channel_id], (err, row) => {
            if (err) {
                return interaction.reply({ content: 'Erreur lors de la récupération du personnage.', ephemeral: true });
            }
            if (!row) {
                return interaction.reply({ content: 'Aucun personnage trouvé pour ce canal.', ephemeral: true });
            }

            try {
                const identity = JSON.parse(row.identity);
                const disciplines = row.disciplines ? JSON.parse(row.disciplines) : {};
                const history = row.history ? JSON.parse(row.history) : {};

                const healthBar = formatHealth(row.aggravated_damage ?? 0, row.superficial_damage ?? 0, row.max_damage ?? 10);
                const willpowerBar = formatHealth(row.aggravated_willpower ?? 0, row.superficial_willpower ?? 0, row.max_willpower ?? 10);


                const embed = new EmbedBuilder()
                    .setTitle(`${identity.name}`)
                    .setDescription(`**Clan:** ${identity.clan}`)
                    .addFields(
                        { name: 'Faim', value: (row.hunger ?? 0).toString(), inline: true },
                        { name: 'Dégâts', value: healthBar, inline: false },
                        { name: 'Volonté', value: willpowerBar, inline: false }
                    );

                if (section === 'all' || section === 'skills') {
                    let skillsData;

                    try {
                        skillsData = JSON.parse(row.skills);
                    } catch (error) {
                        return interaction.reply({ content: "Erreur lors de la récupération des compétences.", ephemeral: true });
                    }

                    if (!skillsData || !skillsData.attributes || !skillsData.skills) {
                        return interaction.reply({ content: "Les données d'attributs ou de compétences sont manquantes.", ephemeral: true });
                    }

                    const { attributes, skills, specialties } = skillsData;
                    embed.addFields(
                        { name: '', value: '', inline: false },
                        { name: '', value: '__**Attributs**__', inline: false },
                        ...formatSkillsTable(attributes),
                        { name: '', value: '__**Compétences**__', inline: false },
                        ...formatSkillsTable(skills),
                        { name: 'Spécialités', value: formatSpecialties(specialties), inline: false },
                    );

                }

                if (section === 'all' || section === 'disciplines') {
                    const disciplineText = Object.entries(disciplines)
                        .map(([key, value]) => formatDiscipline(value.name, value.level, value.skills))
                        .join('\n\n') || 'Aucune discipline définie.';
                    embed.addFields({ name: 'Disciplines', value: disciplineText });
                }

                if (section === 'all' || section === 'history') {
                    embed.addFields(
                        { name: '📜 __**Backgrounds**__', value: formatHistory(history.backgrounds), inline: false },
                        { name: '✅ __**Mérites**__', value: formatHistory(history.merits), inline: false },
                        { name: '❌ __**Défauts**__', value: formatHistory(history.flaws), inline: false }
                    );
                }

                embed.setFooter({ text: 'Gotham by Night - Fiche Personnage' });

                interaction.reply({ embeds: [embed], ephemeral: false });

            } catch (e) {
                console.error("Erreur de parsing JSON:", e);
                interaction.reply({ content: 'Erreur lors du traitement des informations du personnage.', ephemeral: true });
            }
        });
    },
};

function formatHealth(aggravated, superficial, max) {
    const fullSquare = '◼'; // Carré plein pour les dégâts aggravés
    const halfSquare = '⛝'; // Carré barré pour les dégâts superficiels
    const emptySquare = '◻'; // Carré vide pour les cases restantes

    return fullSquare.repeat(aggravated) +
        halfSquare.repeat(superficial) +
        emptySquare.repeat(Math.max(0, max - aggravated - superficial));
}

function formatSkillsTable(data) {
    const entries = Object.entries(data);
    let fields = [];

    for (let i = 0; i < entries.length; i += 3) {
        const row = entries.slice(i, i + 3)
            .map(([key, value]) => `**${key}**: ${'⦿'.repeat(value).padEnd(5, '○')}`)
            .join('\n');

        fields.push({ name: '\u200B', value: row, inline: true });
    }

    return fields;
}

function formatDiscipline(discipline, level, skills) {
    const fullCircle = '⦿'; // Cercle plein pour un niveau atteint
    const emptyCircle = '◯'; // Cercle vide pour les niveaux restants

    const levelText = fullCircle.repeat(level) + emptyCircle.repeat(5 - level);

    // Afficher les compétences associées
    const skillsText = skills.map(skill => `${skill.name} (${skill.level}) - ${skill.description}`).join('\n');

    return `**${discipline}** ${levelText}\n${skillsText}`;
}

function formatSpecialties(list) {
    if (!list || list.length === 0) {
        return "Aucun.";
    }
    return list.map(item => `- **${item.skill}** (${item.value}) : ${item.name}`).join('\n');
}

function formatHistory(histories) {
    if (!histories || histories.length === 0) {
        return "Aucun.";
    }

    return histories.map(item => {
        const filled = "⦿".repeat(item.level);
        const empty = "○".repeat(5 - item.level);
        return `- **${item.name}** ${filled}${empty} : ${item.description}`;
    }).join('\n');
}

