const { SlashCommandBuilder, MessageEmbed, EmbedBuilder} = require('discord.js');
const db = require('../database');
const dictionary = require('../dictionary.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Lancer un jet de dés pour Vampire : La Mascarade')
        .addStringOption(option =>
            option.setName('attribute1')
                .setDescription('Premier attribut ou compétence')
                .setRequired(true)
                .setChoices(
                    { name: 'Force', value: 'strength' },
                    { name: 'Dextérité', value: 'dexterity' },
                    { name: 'Vigueur', value: 'stamina' },
                    { name: 'Charisme', value: 'charisma' },
                    { name: 'Manipulation', value: 'manipulation' },
                    { name: 'Sang-froid', value: 'composure' },
                    { name: 'Intelligence', value: 'intelligence' },
                    { name: 'Astuce', value: 'wits' },
                    { name: 'Résolution', value: 'resolve' },
                    { name: 'Frénésie', value: 'frenzy' },
                    { name: 'Humanité', value: 'humanity' }
                ))
        .addStringOption(option =>
            option.setName('attribute2')
                .setDescription('Deuxième attribut ou compétence')
                .setRequired(false)
                .setChoices(
                    { name: 'Force', value: 'strength' },
                    { name: 'Dextérité', value: 'dexterity' },
                    { name: 'Vigueur', value: 'stamina' },
                    { name: 'Charisme', value: 'charisma' },
                    { name: 'Manipulation', value: 'manipulation' },
                    { name: 'Sang-froid', value: 'composure' },
                    { name: 'Intelligence', value: 'intelligence' },
                    { name: 'Astuce', value: 'wits' },
                    { name: 'Résolution', value: 'resolve' }
                ))
        .addStringOption(option =>
            option.setName('physical_skill')
                .setDescription('Deuxième skill physique')
                .setRequired(false)
                .setChoices(
                    { name: 'Athlétisme', value: 'athletics' },
                    { name: 'Bagarre', value: 'brawl' },
                    { name: 'Artisanat', value: 'craft' },
                    { name: 'Conduite', value: 'drive' },
                    { name: 'Armes à feu', value: 'firearms' },
                    { name: 'Larcin', value: 'larceny' },
                    { name: 'Mêlée', value: 'melee' },
                    { name: 'Discrétion', value: 'stealth' },
                    { name: 'Survie', value: 'survival' }
                ))
        .addStringOption(option =>
            option.setName('social_skill')
                .setDescription('Deuxième skill mental')
                .setRequired(false)
                .setChoices(
                    { name: 'Animaux', value: 'animal_ken' },
                    { name: 'Commandement', value: 'leadership' },
                    { name: 'Empathie', value: 'insigth' },
                    { name: 'Étiquette', value: 'etiquette' },
                    { name: 'Expérience de la rue', value: 'streetwise' },
                    { name: 'Intimidation', value: 'intimidation' },
                    { name: 'Persuasion', value: 'persuasion' },
                    { name: 'Représentation', value: 'performance' },
                    { name: 'Subterfuge', value: 'subterfuge' }
                ))
        .addStringOption(option =>
            option.setName('mental_skill')
                .setDescription('Deuxième skill social')
                .setRequired(false)
                .setChoices(
                    { name: 'Erudition', value: 'academics' },
                    { name: 'Finance', value: 'finance' },
                    { name: 'Investigation', value: 'investigation' },
                    { name: 'Médecine', value: 'medicine' },
                    { name: 'Occultisme', value: 'occult' },
                    { name: 'Politique', value: 'politics' },
                    { name: 'Science', value: 'science' },
                    { name: 'Technologie', value: 'technology' },
                    { name: 'Vigilance', value: 'awareness' }
                ))
        .addStringOption(option =>
            option.setName('bonus_dices')
                .setDescription('Dés Bonus ou Malus')
                .setRequired(false)),

    async execute(interaction) {
        const channel_id = interaction.channelId;
        let values = [interaction.options.getString('attribute1'), interaction.options.getString('attribute2'), interaction.options.getString('physical_skill'), interaction.options.getString('social_skill'), interaction.options.getString('mental_skill')]
        values = values.filter(value => value !== undefined && value !== null);
        console.log(values)

        db.get('SELECT max_willpower, aggravated_willpower, superficial_willpower, identity, stains, skills, hunger FROM characters WHERE channel_id = ?', [channel_id], (err, row) => {
            if (err) {
                return interaction.reply({ content: 'Erreur lors de la récupération du personnage.', ephemeral: true });
            }
            if (!row) {
                return interaction.reply({ content: 'Aucun personnage trouvé pour ce canal.', ephemeral: true });
            }

            try {
                const characterData = JSON.parse(row.skills);
                const characterIdentity = JSON.parse(row.identity);
                const currentWillpower = row.max_willpower - row.aggravated_willpower - row.superficial_willpower;
                const attributes = characterData.attributes;
                const skills = characterData.skills;
                const hunger = row.hunger || 0;
                const bonusDices = interaction.options.getString('bonus_dices') || 0;

                // Vérifier si les attributs/compétences existent
                let dicePool = parseInt(bonusDices);

                if(interaction.options.getString('attribute1') === "frenzy")
                    dicePool += Math.floor(characterIdentity.humanity/3) + currentWillpower;
                if(interaction.options.getString('attribute1') === "humanity")
                    dicePool += Math.max(10 - characterIdentity.humanity - row.stains, 1);
                else
                    values.forEach((value) => dicePool += getStat(attributes, skills, value));

                if (dicePool === 0) {
                    return interaction.reply({ content: 'Les attributs/compétences choisis ne sont pas valides.', ephemeral: true });
                }

                // Lancer les dés
                let rolls = [];
                for (let i = 0; i < dicePool; i++) {
                    rolls.push(Math.floor(Math.random() * 10) + 1);
                }

                let hungerRolls = hunger > 0 ? rolls.slice(-hunger) : [];
                let normalRolls = hunger > 0 ? rolls.slice(0, rolls.length - hunger) : rolls;

                let successes = normalRolls.filter(die => die >= 6).length;
                let hungerSuccesses = hungerRolls.filter(die => die >= 6).length;

                let normalCriticals = normalRolls.filter(die => die === 10).length;
                let hungerCriticals = hungerRolls.filter(die => die === 10).length;
                let hungerFails = hungerRolls.filter(die => die === 1).length;

                const filteredValues = values
                    .filter(value => value !== undefined && value !== null)
                    .map(value => dictionary[value]);

                let str = filteredValues.join(' + ');
                if(bonusDices > 0) str += " + " + bonusDices;
                if(bonusDices < 0) str += " - " + Math.abs(bonusDices);

                let totalSuccesses = successes + hungerSuccesses;
                let bonusSuccesses = Math.floor((normalCriticals + hungerCriticals) / 2) * 2;
                totalSuccesses += bonusSuccesses;

                let resultMessage = `Succès totaux : **${totalSuccesses}**\n`;
                let status = '🎲 **Jet de dés**';
                let color = '#800080'; // Violet par défaut

                // 🔥 Gestion des succès critiques et échecs 🔥
                if (normalCriticals >= 2) {
                    resultMessage += '\n🔥 **Succès critique !**';
                    status = '🔥 **Succès Critique !**';
                }

                if (normalCriticals >= 1 && hungerCriticals >= 1) {
                    resultMessage += '\n⚡ **Triomphe Brutal !**';
                    totalSuccesses += 2;
                    status = '⚡ **Succès Triomphal !**';
                }

                if (hungerFails >= 1) {
                    resultMessage += '\n💀 **Potentiel échec bestial !**';
                    status = '💀 **Échec Bestial !**';
                    color = '#ff0000'; // Rouge pour un échec bestial
                }

                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(status)
                    .setDescription(`**${str} :**`)
                    .addFields(
                        { name: '🎲 Dés normaux', value: normalRolls.length > 0 ? normalRolls.join(', ') : 'Aucun', inline: true },
                        { name: '🩸 Dés de Soif', value: hungerRolls.length > 0 ? hungerRolls.join(', ') : 'Aucun', inline: true },
                        { name: '📊 Résultats', value: resultMessage }
                    )
                    .setFooter({ text: 'Gotham by Night - Jet de dés' });

                interaction.reply({ embeds: [embed] });
            } catch (err) {
                console.error(err);
                return interaction.reply({ content: 'Erreur lors du traitement des données du personnage.', ephemeral: true });
            }
        });
    }
};

function getStat(attributes, skills, toFind) {
    if(toFind === undefined)
        return 0;

    if (attributes[toFind]) {
        return attributes[toFind];
    } else if (skills[toFind]) {
        return skills[toFind];
    }

    return 0;
}