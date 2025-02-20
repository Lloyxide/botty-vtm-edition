const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');
const dictionary = require('../dictionary.js');
const humanities = require('../docs/humanity.js');
const blood_potencies = require('../docs/blood_potency.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('me')
        .setDescription('Obtenir les informations du personnage')
        .addStringOption(option =>
            option.setName('section')
                .setDescription('Section à afficher')
                .setChoices(
                    { name: 'Compétences & Attributs', value: 'skills' },
                    { name: 'Disciplines', value: 'disciplines' },
                    { name: 'Historique', value: 'history' },
                    { name: 'Background', value: 'lore' },
                    { name: 'Prédation', value: 'predator' },
                    { name: 'Humanité', value: 'humanity' },
                    { name: 'Puissance de Sang', value: 'blood_potency' },
                    { name: 'Tout', value: 'all' }
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

                const hungerBar = formatSquares(row.hunger ?? 0, 0, 5);
                const healthBar = formatSquares(row.aggravated_damage ?? 0, row.superficial_damage ?? 0, row.max_damage ?? 10);
                const willpowerBar = formatSquares(row.aggravated_willpower ?? 0, row.superficial_willpower ?? 0, row.max_willpower ?? 10);
                const humanityBar = formatSquares(identity.humanity ?? 0, row.stains ?? 0, 10);


                const embed = new EmbedBuilder()
                    .setTitle(identity.name)
                    .setDescription(`**Clan:** ${identity.clan}\n**Génération:** ${identity.generation}\n**Prédation:** ${identity.predatory.name}`)
                    .addFields(
                        { name: 'Faim', value: hungerBar, inline: true },
                        { name: 'Dégâts', value: healthBar, inline: true },
                        { name: 'Volonté', value: willpowerBar, inline: true }
                    )
                    .addFields(
                        { name: 'Humanité', value: humanityBar, inline: true }
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
                        { name: '__**Attributs**__', value: '', inline: false },
                        //{ name: 'Physique', value: '\u200B', inline: true },
                        //{ name: 'Social', value: '\u200B', inline: true },
                        //{ name: 'Mental', value: '\u200B', inline: true },
                        ...formatSkillsTable(attributes),
                        { name: '__**Compétences**__', value: '', inline: false },
                        ...formatSkillsTable(skills),
                        { name: '__**Spécialités**__', value: formatSpecialties(specialties), inline: false },
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

                if (section === 'predator') {
                    const predator = identity.predatory;

                    embed.addFields(
                        { name: '', value: '__**Prédation**__ : ' + predator.name, inline: false },
                        { name: "", value: predator.description, inline: false }
                    );

                    predator.rolls.forEach((roll) => {
                        embed.addFields({ name: roll.roll, value: roll.description, inline: false })
                    })
                }

                if (section === 'lore') {
                    const touchstones = identity.touchstones;
                    const img = identity.img;

                    embed.setImage(img);

                    let convictionsStr = "";
                    touchstones.forEach((touchstone) => {
                        convictionsStr += " - " + touchstone.conviction + "\n";
                    })

                    let touchstonesStr = "";
                    touchstones.forEach((touchstone) => {
                        touchstonesStr += " - " + touchstone.name + " : " + touchstone.description + "\n";
                    })

                    embed.addFields(
                        { name: '__**Convictions**__', value: convictionsStr, inline: false },
                        { name: '__**Touchstones**__', value: touchstonesStr, inline: false }
                    );
                }

                if (section === 'humanity') {
                    const humanity = identity.humanity;
                    const result = humanities.find(obj => obj.humanity === humanity);

                    embed.addFields(
                        { name: '__**Humanité ' + humanity + '**__', value: result.description, inline: false },
                        { name: "", value: result.hook, inline: false },
                        { name: "", value: " - " + result.effects.join('\n- '), inline: false }
                    );
                }

                if (section === 'blood_potency') {
                    const blood_potency = identity.blood_potency;
                    const result = blood_potencies.find(obj => obj.level === blood_potency);

                    embed.addFields(
                        { name: '__**Puissance de sang ' + blood_potency + '**__', value: result.description, inline: false },
                        { name: '', value: " - " + result.effects.join('\n - '), inline: false }
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

function formatSquares(aggravated, superficial, max) {
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

    const columnCount = 3;
    const rows = [];

    // Créer les lignes pour chaque colonne
    for (let i = 0; i < entries.length; i++) {
        const columnIndex = i % columnCount; // déterminer la colonne
        if (!rows[columnIndex]) rows[columnIndex] = []; // si la colonne n'existe pas, créer une nouvelle colonne

        const [key, value] = entries[i];
        rows[columnIndex].push(`**${dictionary[key]}**: ${'⦿'.repeat(value).padEnd(5, '○')}`);
    }

    // Créer les champs pour Discord
    for (let i = 0; i < Math.max(...rows.map(row => row.length)); i++) {
        const row = rows.map(column => column[i] || '').join('\n');
        fields.push({ name: '\u200B', value: row, inline: true });
    }


    return fields;
}

function formatDiscipline(discipline, level, skills) {
    const fullCircle = '⦿'; // Cercle plein pour un niveau atteint
    const emptyCircle = '○'; // Cercle vide pour les niveaux restants

    const levelText = fullCircle.repeat(level) + emptyCircle.repeat(5 - level);

    // Afficher les compétences associées
    const skillsText = skills.map(skill => `__**${skill.name}**__ (${skill.level}) - ${skill.description}`).join('\n');

    return `**${dictionary[discipline]}** ${levelText}\n${skillsText}`;
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

