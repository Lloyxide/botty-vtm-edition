const humanities = [
  {
    humanity: 10,
    description: "Les humains qui possèdent ce score sont rares, et les vampires qui sont parvenus à l’atteindre le sont encore plus. À ce niveau, un mortel comme un Descendant mène une vie de saint et d’ascète, étroitement régie par l’éthique et les principes maintenant ce pinacle fragile. Une simple action ou pensée égoïste suffit à rompre cet état de grâce.",
    hook: "Un vampire avec 10 en Humanité peut sembler humain à bien des égards :",
    effects: [
      "Il n’a pas besoin de prendre les Couleurs de la vie : il ressemble à un mortel pâle, mais en bonne santé.",
      "Il guérit des dégâts superficiels comme un mortel, en plus de la régénération vampirique.",
      "Il peut goûter, manger et digérer la nourriture et la boisson humaines comme s’il était encore vivant.",
      "Il peut rester éveillé pendant la journée comme un humain, bien qu’il ait tout de même besoin de dormir à une fréquence normale.",
      "La lumière du soleil lui inflige des dégâts à la moitié du rythme normal."
    ]
  },
  {
    humanity: 9,
    description: "Les Descendants ayant un score d’Humanité aussi élevé agissent plus humainement que la plupart des humains. Ils semblent à leur place parmi les mortels, pensant et agissant comme eux, avec la même spontanéité qu’un acteur expert jouant sur ses propres émotions. Tuer est une horreur pour eux, leur causant un tourment presque aussi insoutenable que la Soif à son paroxysme. Beaucoup de vampires novices adoptent des codes moraux encore plus stricts que ceux qu’ils avaient de leur vivant, cherchant à repousser l’acceptation de leur nature prédatrice.",
    hook: "Un vampire avec 9 en Humanité peut sembler humain de plusieurs façons :",
    effects: [
      "Il n’a pas besoin de prendre les Couleurs de la vie : il ressemble à une personne malade, mais pas morte.",
      "Il guérit des dégâts superficiels comme un mortel, en plus de la régénération vampirique.",
      "Il peut goûter, manger et digérer la viande saignante ou crue ainsi que la plupart des boissons.",
      "Il peut se réveiller 1 heure avant le coucher du soleil et rester éveillé 1 heure après l’aube."
    ]
  },
  {
    humanity: 8,
    description: "Le vampire ressent encore profondément la souffrance, qu’elle soit la sienne ou celle infligée par ses pairs. Son apparence reste humaine, et son attachement aux autres est encore fort, que ce soit par souvenirs ou par de nouveaux élans d'empathie.",
    hook: "Un vampire avec 8 en Humanité bénéficie de certains aspects humains :",
    effects: [
      "Il peut lancer deux dés pour son test d’Exaltation lorsqu’il prend les Couleurs de la vie et garder le meilleur.",
      "Les Couleurs de la vie lui permettent d’avoir des relations sexuelles et même d’en ressentir du plaisir.",
      "Les Couleurs de la vie lui permettent de goûter et digérer le vin.",
      "Il peut se réveiller 1 heure avant le coucher du soleil s’il le souhaite."
    ]
  },
  {
    humanity: 7,
    description: "Ce niveau est celui de la plupart des humains. Le vampire respecte les règles sociales communes et peut facilement se faire passer pour un mortel. Il considère toujours le meurtre comme un acte grave, mais il peut justifier certaines infractions mineures sans remords excessifs.",
    hook: "Les règles pour un vampire avec 7 en Humanité sont similaires à celles des autres Descendants :",
    effects: [
      "Il doit faire un test d’Exaltation pour prendre les Couleurs de la vie.",
      "Il ne peut plus physiquement avoir de relations sexuelles, mais peut les simuler avec un test de Dextérité + Charisme (difficulté égale au Sang-froid ou à l’Astuce de son partenaire).",
      "S’il n’a pas pris les Couleurs de la vie, la nourriture et la boisson humaines le font vomir (test de Sang-froid + Vigueur, difficulté 3, pour se retenir)."
    ]
  },
  {
    humanity: 6,
    description: "Le vampire à ce stade accepte pleinement sa nature. Il ne cherche pas à tuer gratuitement, mais il n’éprouve plus de véritable culpabilité lorsqu’il doit le faire. S’il respecte encore les conventions sociales, ce n’est plus par morale mais par habitude ou nécessité.",
    hook: "Les règles restent globalement les mêmes qu’au niveau précédent, mais l’illusion humaine devient plus difficile à maintenir :",
    effects: [
      "Il doit faire un test d’Exaltation pour prendre les Couleurs de la vie.",
      "Il ne peut pas physiquement avoir de relations sexuelles, mais peut toujours les simuler avec un test de Dextérité + Charisme, en retirant un dé.",
      "Même avec les Couleurs de la vie, il doit réussir un test de Sang-froid + Vigueur (difficulté 3) pour garder de la nourriture ou une boisson humaine dans son estomac pendant 1 heure."
    ]
  },
  {
    humanity: 5,
    description: "À ce stade, le vampire a une certaine expérience de la monstruosité. La plupart des nouveau-nés et certains ancillae entrent dans cette catégorie. Le vampire est égoïste, il ment comme un arracheur de dents et son corps peut présenter une particularité étrange ou une malformation mineure, par exemple des yeux dont la couleur n’est pas naturelle.",
    hook: "Sauf précision contraire, les règles pour ce niveau d’Humanité sont les mêmes que pour le précédent :",
    effects: [
      "Il doit faire un test d’Exaltation pour prendre les Couleurs de la vie.",
      "Le vampire ne peut pas physiquement avoir de relations sexuelles, mais il peut les simuler s’il le désire si son joueur réussit un jet de Dextérité + Charisme en retirant deux dés.",
      "Même avec les Couleurs de la vie, il doit réussir un test de Sang-froid + Vigueur (difficulté 3) pour garder de la nourriture ou une boisson humaine dans son estomac pendant 1 heure.",
      "Le joueur retire un dé à tous les groupements de son personnage pour les jets d’interaction avec des humains."
    ]
  },
  {
    humanity: 4,
    description: "Certaines personnes doivent mourir, c’est comme ça. Le vampire a finalement commencé à sombrer dans la paresse morale et le nombrilisme, et l’a même accepté. Tuer n’est absolument pas un problème ; il suffit de le demander aux anciens. La destruction, le vol et l’agression sont des outils et non des tabous.",
    hook: "Sauf précision contraire, les règles pour ce niveau d’Humanité sont les mêmes que pour le précédent :",
    effects: [
      "Il doit faire un test d’Exaltation pour prendre les Couleurs de la vie.",
      "Le vampire ne peut pas physiquement avoir de relations sexuelles, mais il peut les simuler s’il le désire.",
      "Même s’il a pris les Couleurs de la vie, le vampire ne peut plus garder de nourriture ou de boisson humaine.",
      "Le joueur retire deux dés à tous les groupements de son personnage pour les jets d’interaction avec des humains."
    ]
  },
  {
    humanity: 3,
    description: "À ce niveau, le vampire est cynique et blasé, il écarte tout et tous ceux qui se trouvent sur son passage. Il agit pragmatiquement, tuant tous les témoins et ne faisant confiance qu’aux personnes qu’il tient par les parties.",
    hook: "Sauf précision contraire, les règles pour ce niveau d’Humanité sont les mêmes que pour le précédent :",
    effects: [
      "Il doit faire un test d’Exaltation pour prendre les Couleurs de la vie.",
      "Le vampire ne peut même plus simuler de relations sexuelles.",
      "Même s’il a pris les Couleurs de la vie, le vampire ne peut plus garder de nourriture ou de boisson humaine.",
      "Le joueur retire quatre dés à tous les groupements de son personnage pour les jets d’interaction avec des humains."
    ]
  },
  {
    humanity: 2,
    description: "Pour le vampire, personne ne compte à part lui. Les autres sont soit des serviteurs, soit des sources de sang.",
    hook: "Sauf précision contraire, les règles pour ce niveau d’Humanité sont les mêmes que pour le précédent :",
    effects: [
      "Il doit faire un test d’Exaltation pour prendre les Couleurs de la vie.",
      "Le vampire ne peut même plus simuler de relations sexuelles.",
      "Même s’il a pris les Couleurs de la vie, le vampire ne peut plus garder de nourriture ou de boisson humaine.",
      "Le joueur retire six dés à tous les groupements de son personnage pour les jets d’interaction avec des humains."
    ]
  },
  {
    humanity: 1,
    description: "Le vampire n’a plus qu’une parcelle d’esprit conscient et tangue dangereusement au bord du néant. Peu de choses lui importent, même ses propres désirs en dehors du sang et du repos.",
    hook: "Sauf précision contraire, les règles pour ce niveau d’Humanité sont les mêmes que pour le précédent :",
    effects: [
      "Il doit faire un test d’Exaltation pour prendre les Couleurs de la vie.",
      "Le vampire ne peut même plus simuler de relations sexuelles.",
      "Même s’il a pris les Couleurs de la vie, le vampire ne peut plus garder de nourriture ou de boisson humaine.",
      "Le joueur retire huit dés à tous les groupements de son personnage pour les jets d’interaction avec des humains."
    ]
  }
];

module.exports = humanities;
