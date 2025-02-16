const blood_potencies = [
  {
    "level" : 0,
    "description" : "Le personnage est un Sang Clair, méprisé et rejeté par les véritables vampires.",
    "effects" : [
      "Il subit les dégâts comme un mortel. Lorsqu’il régénère des dégâts, il peut régénérer 1 point de dégâts superficiels par test d’Exaltation.",
      "Son score de Fléau est de 0, car il n’a pas de clan et donc pas de fléau.",
      "Il ne peut pas créer de lien de sang, ne peut pas créer de goule (voir page 234) et, s’il tente d’étreindre, il n’a jamais la certitude que cela va marcher.",
      "Le personnage ne peut entrer en frénésie que s’il y est poussé par des moyens surnaturels.",
      "La lumière du soleil à laquelle il est directement exposé ne lui inflige qu’1 point de dégâts superficiels par tour."
    ]
  },
  {
    "level" : 1,
    "description" : "Le personnage est un véritable vampire, même si c’est d’extrême justesse aux yeux de certains anciens. Malgré tout, son Sang vampirique peut accomplir des choses spectaculaires lorsqu’il est exalté.",
    "effects" : [
      "Ajoutez un dé d’attribut au groupement du personnage s’il déclenche un Coup de sang.",
      "Le score de Fléau du personnage est de 1.",
      "Lorsque le personnage régénère des dégâts, il peut régénérer 1 point de dégâts superficiels par test d’Exaltation.",
      "Lancez deux dés et choisissez le résultat le plus élevé lorsque vous faites un test d’Exaltation pour un pouvoir de discipline de niveau un (ou relancez le test d’Exaltation)."
    ]
  },
  {
    "level" : 2,
    "description" : "Le personnage est un cran au-dessus des autres lécheurs, car son Sang alimente son existence vampirique mieux que le leur. Cependant, le sang ne venant pas directement d’un calice humain commence à perdre son pouvoir pour lui et n’a plus aucun goût depuis longtemps.",
    "effects" : [
      "Ajoutez un dé d’attribut au groupement du personnage s’il déclenche un Coup de sang.",
      "Le score de Fléau du personnage est de 1.",
      "Lorsque le personnage régénère des dégâts, il peut régénérer 1 point de dégâts superficiels par test d’Exaltation.",
      "Lancez deux dés et choisissez le résultat le plus élevé lorsque vous faites un test d’Exaltation pour un pouvoir de discipline de niveau un (ou relancez le test d’Exaltation).",
      "Ajoutez un dé au groupement du personnage lorsqu’il utilise un pouvoir de discipline ou résiste à un pouvoir de discipline.",
      "Le personnage doit boire deux fois la quantité normale de sang animal ou de sang en poche pour étancher 1 point de Soif."
    ]
  },
  {
    "level" : 3,
    "description" : "Dans l’esprit des anciens les plus conservateurs, le Sang du personnage a suffisamment épaissi pour faire de lui non pas un simple lécheur, mais un véritable caïnite, méritant l’attention et le respect. Cependant, si son Sang lui confère des dons puissants, il nourrit aussi sa faiblesse de clan.",
    "effects" : [
      "Ajoutez deux dés d’attribut au groupement du personnage s’il déclenche un Coup de sang.",
      "Le score de Fléau du personnage est de 2.",
      "Lorsque le personnage régénère des dégâts, il peut régénérer 1 point de dégâts superficiels par test d’Exaltation.",
      "Lancez deux dés et choisissez le résultat le plus élevé lorsque vous faites un test d’Exaltation pour un pouvoir de discipline de niveau deux ou moins (ou relancez le test d’Exaltation).",
      "Ajoutez un dé au groupement du personnage lorsqu’il utilise un pouvoir de discipline ou résiste à un pouvoir de discipline.",
      "Le sang animal et le sang en poche n’étanchent plus aucun point de Soif pour le personnage."
    ]
  },
  {
    "level" : 4,
    "description" : "Le personnage est un cran au-dessus des autres lécheurs, car son Sang alimente son existence vampirique mieux que le leur. Cependant, le sang ne venant pas directement d’un calice humain commence à perdre son pouvoir pour lui et n’a plus aucun goût depuis longtemps.",
    "effects" : [
      "Ajoutez deux dés d’attribut au groupement du personnage s’il déclenche un Coup de sang.",
      "Le score de Fléau du personnage est de 2.",
      "Lorsque le personnage régénère des dégâts, il peut régénérer 1 point de dégâts superficiels par test d’Exaltation.",
      "Lancez deux dés et choisissez le résultat le plus élevé lorsque vous faites un test d’Exaltation pour un pouvoir de discipline de niveau deux ou moins (ou relancez le test d’Exaltation).",
      "Ajoutez un dé au groupement du personnage lorsqu’il utilise un pouvoir de discipline ou résiste à un pouvoir de discipline.",
      "Le sang animal et le sang en poche n’étanchent plus aucun point de Soif pour le personnage.",
      "Lorsque le personnage se nourrit sur des humains, il étanche 1 point de Soif de moins par humain."
    ]
  },
  {
    "level" : 5,
    "description" : "Tout proche du statut d’ancien, le personnage n’est plus qu’à un pas alléchant de ce que beaucoup considéreraient comme le pouvoir d’un dieu vivant.",
    "effects" : [
      "Ajoutez trois dés d’attribut au groupement du personnage s’il déclenche un Coup de sang.",
      "Le score de Fléau du personnage est de 3.",
      "Lorsque le personnage régénère des dégâts, il peut régénérer 1 point de dégâts superficiels par test d’Exaltation.",
      "Lancez deux dés et choisissez le résultat le plus élevé lorsque vous faites un test d’Exaltation pour un pouvoir de discipline de niveau trois ou moins (ou relancez le test d’Exaltation).",
      "Ajoutez un dé au groupement du personnage lorsqu’il utilise un pouvoir de discipline ou résiste à un pouvoir de discipline.",
      "Le sang animal et le sang en poche n’étanchent plus aucun point de Soif pour le personnage.",
      "Le personnage ne peut faire passer sa Soif en dessous de 2 qu’en vidant un humain de son sang et en le tuant."
    ]
  }
]

module.exports = blood_potencies;