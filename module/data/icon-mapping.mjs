/**
 * Mapeamento de ícones pra itens do 3D&T.
 *
 * Estratégia: usar apenas os ícones SVG em `icons/svg/*` que fazem parte
 * do core do Foundry VTT desde a V11 e estão garantidos em qualquer instalação.
 * São silhuetas simples mas funcionam sempre.
 *
 * Lista canônica dos SVG do core usada aqui:
 *   aura, blood, bones, book, castle, chest, circle, cog, combat, cowled,
 *   cross, crystal, d20, die, explosion, eye, fall, fire, fire-shield, frozen,
 *   hanging-rock, hazard, heal, holy-shield, house, ice-aura, ice-shield,
 *   item-bag, lightning, magic-shield, magic-swirl, mystery-man, net, oak,
 *   padlock, paralysis, pawprint, poison, radiation, regen, ruins, skull,
 *   sleep, sound, statue, stoned, sun, sword, tankard, target, terror, tower,
 *   trap, tree, upgrade, village, windmill
 */

const SVG = {
  aura:         "icons/svg/aura.svg",
  book:         "icons/svg/book.svg",
  bones:        "icons/svg/bones.svg",
  blood:        "icons/svg/blood.svg",
  castle:       "icons/svg/castle.svg",
  chest:        "icons/svg/chest.svg",
  circle:       "icons/svg/circle.svg",
  cog:          "icons/svg/cog.svg",
  combat:       "icons/svg/combat.svg",
  cowled:       "icons/svg/cowled.svg",
  cross:        "icons/svg/cross.svg",
  crystal:      "icons/svg/crystal.svg",
  d20:          "icons/svg/d20.svg",
  die:          "icons/svg/die.svg",
  explosion:    "icons/svg/explosion.svg",
  eye:          "icons/svg/eye.svg",
  fall:         "icons/svg/fall.svg",
  fire:         "icons/svg/fire.svg",
  fireShield:   "icons/svg/fire-shield.svg",
  frozen:       "icons/svg/frozen.svg",
  hangingRock:  "icons/svg/hanging-rock.svg",
  hazard:       "icons/svg/hazard.svg",
  heal:         "icons/svg/heal.svg",
  holyShield:   "icons/svg/holy-shield.svg",
  house:        "icons/svg/house.svg",
  iceAura:      "icons/svg/ice-aura.svg",
  iceShield:    "icons/svg/ice-shield.svg",
  itemBag:      "icons/svg/item-bag.svg",
  lightning:    "icons/svg/lightning.svg",
  magicShield:  "icons/svg/magic-shield.svg",
  magicSwirl:   "icons/svg/magic-swirl.svg",
  mysteryMan:   "icons/svg/mystery-man.svg",
  net:          "icons/svg/net.svg",
  oak:          "icons/svg/oak.svg",
  padlock:      "icons/svg/padlock.svg",
  paralysis:    "icons/svg/paralysis.svg",
  pawprint:     "icons/svg/pawprint.svg",
  poison:       "icons/svg/poison.svg",
  radiation:    "icons/svg/radiation.svg",
  regen:        "icons/svg/regen.svg",
  ruins:        "icons/svg/ruins.svg",
  skull:        "icons/svg/skull.svg",
  sleep:        "icons/svg/sleep.svg",
  sound:        "icons/svg/sound.svg",
  statue:       "icons/svg/statue.svg",
  stoned:       "icons/svg/stoned.svg",
  sun:          "icons/svg/sun.svg",
  sword:        "icons/svg/sword.svg",
  tankard:      "icons/svg/tankard.svg",
  target:       "icons/svg/target.svg",
  terror:       "icons/svg/terror.svg",
  tower:        "icons/svg/tower.svg",
  trap:         "icons/svg/trap.svg",
  tree:         "icons/svg/tree.svg",
  upgrade:      "icons/svg/upgrade.svg",
  village:      "icons/svg/village.svg",
  windmill:     "icons/svg/windmill.svg"
};

/* ===== Magias por escola (fallback) ===== */

const MAGIA_BY_SCHOOL = {
  "Branca":              SVG.holyShield,
  "Elemental (fogo)":    SVG.fire,
  "Elemental (água)":    SVG.iceAura,
  "Elemental (ar)":      SVG.magicSwirl,
  "Elemental (terra)":   SVG.oak,
  "Elemental (espírito)":SVG.cowled,
  "Negra":               SVG.skull,
  "todas":               SVG.magicSwirl
};

/* Keyword overrides pra magias específicas — ordem importa. */
const MAGIA_BY_KEYWORD = [
  [/cura|recupera|sanidade|ressur/i,     SVG.heal],
  [/bola de fogo|fireball|erup[çc]|tempestade explosiva|brilho explosivo/i, SVG.explosion],
  [/bomba/i,                             SVG.explosion],
  [/relâmpago|trov[ãa]o|el[ée]trico|enxame de trov/i, SVG.lightning],
  [/congelante|gelo|nevasca|nevoeiro|frio|inferno de gelo/i, SVG.iceShield],
  [/invis[íi]bil/i,                      SVG.cowled],
  [/ilus[ãa]o|imagem turva|reflexos/i,   SVG.eye],
  [/sono|desmaio|coma/i,                 SVG.sleep],
  [/p[âa]nico|medo|terror/i,             SVG.terror],
  [/paralis/i,                           SVG.paralysis],
  [/petrif|estelar/i,                    SVG.stoned],
  [/escurid[ãa]o|silêncio/i,             SVG.cowled],
  [/cegueira/i,                          SVG.eye],
  [/teleport|escapat|porta dimens|presença dist/i, SVG.magicSwirl],
  [/armadura|proteção|barreira|muralha|resist[êe]ncia|deflex|reflex[ãa]o/i, SVG.magicShield],
  [/ataque m[áa]gico|brilho|raio/i,      SVG.lightning],
  [/arma de allihanna|garras|lâmina/i,   SVG.sword],
  [/queda|caindo/i,                      SVG.fall],
  [/morto-vivo|esconjuro|criação|fantasma|cura para os mortos/i, SVG.bones],
  [/maldi[çc]|destrui[çc]ão do esp[íi]rito/i, SVG.skull],
  [/invoca[çc].*dragão|mata-dragão/i,    SVG.hazard],
  [/invoca[çc].*elemental|criatura m[áa]gica/i, SVG.crystal],
  [/monstros|feras|kobold|praga|trolls|pacto/i, SVG.pawprint],
  [/telep[áa]tico|telepatia|dominação|marionete|hipnose|canto da sereia|amor/i, SVG.cowled],
  [/detec[çc]|leitura de l[áa]bios|farejar/i, SVG.eye],
  [/desejo|milagre|sacrif[íi]cio|nulifica/i, SVG.aura],
  [/cancelamento|enfraquecer|roubo/i,    SVG.magicSwirl],
  [/trancar|destrancar|permanência|consertar|mikron|megalon|transfor/i, SVG.padlock],
  [/ácido|veneno|gás/i,                  SVG.poison],
  [/dados|dardos|agonia|flecha|seta|lança/i, SVG.target],
  [/pequenos desejos|fada|nobre montaria|servil/i, SVG.aura],
  [/desvio de disparos|barragem/i,       SVG.target],
  [/vento|ar|bomba a[ée]rea|voar|voo/i,  SVG.magicSwirl],
  [/terremoto|chão|pântano|terreno|buraco/i, SVG.hangingRock],
  [/toque|soco|furor|fúria/i,            SVG.combat],
  [/luz|brilho|sun/i,                    SVG.sun],
  [/chuva|beluhga/i,                     SVG.iceAura],
  [/c[âa]ntico|marcha|coragem|arsenal/i, SVG.sound]
];

function iconForMagia(row) {
  const name = row.name || "";
  for (const [re, icon] of MAGIA_BY_KEYWORD) {
    if (re.test(name)) return icon;
  }
  return MAGIA_BY_SCHOOL[row.escola] || SVG.aura;
}

/* ===== Perícias ===== */

const PERICIA_ICONS = {
  "Animais":     SVG.pawprint,
  "Arte":        SVG.sound,
  "Ciência":     SVG.book,
  "Crime":       SVG.cowled,
  "Esporte":     SVG.target,
  "Idiomas":     SVG.book,
  "Investigação":SVG.eye,
  "Máquinas":    SVG.cog,
  "Medicina":    SVG.heal,
  "Manipulação": SVG.mysteryMan,
  "Sobrevivência":SVG.tree
};

function iconForPericia(row) {
  return PERICIA_ICONS[row.name] || SVG.book;
}

/* ===== Raças (vantagem única) ===== */

const RACA_BY_CATEGORY = {
  "Humano":       SVG.mysteryMan,
  "Semi-humano":  SVG.mysteryMan,
  "Humanoide":    SVG.combat,
  "Youkai":       SVG.aura,
  "Construto":    SVG.cog,
  "Morto-Vivo":   SVG.skull
};

const RACA_BY_NAME = {
  "Humano":         SVG.mysteryMan,
  "Anão":           SVG.combat,
  "Elfo":           SVG.target,
  "Elfo Negro":     SVG.cowled,
  "Gnomo":          SVG.magicSwirl,
  "Halfling":       SVG.pawprint,
  "Meio-Elfo":      SVG.target,
  "Meio-Orc":       SVG.sword,
  "Alien":          SVG.radiation,
  "Anfíbio":        SVG.iceAura,
  "Centauro":       SVG.pawprint,
  "Goblin":         SVG.net,
  "Kemono":         SVG.pawprint,
  "Meio-Dragão":    SVG.fire,
  "Minotauro":      SVG.combat,
  "Ogre":           SVG.hazard,
  "Troglodita":     SVG.poison,
  "Anjo":           SVG.holyShield,
  "Demônio":        SVG.fire,
  "Fada":           SVG.aura,
  "Licantropo":     SVG.pawprint,
  "Meio-Abissal":   SVG.fire,
  "Meio-Celestial": SVG.sun,
  "Meio-Gênio":     SVG.magicSwirl,
  "Androide":       SVG.cog,
  "Ciborgue":       SVG.cog,
  "Golem":          SVG.statue,
  "Mecha":          SVG.cog,
  "Meio-Golem":     SVG.statue,
  "Nanomorfo":      SVG.crystal,
  "Robô Positrônico":SVG.cog,
  "Esqueleto":      SVG.bones,
  "Fantasma":       SVG.cowled,
  "Múmia":          SVG.bones,
  "Vampiro":        SVG.blood,
  "Zumbi":          SVG.skull
};

function iconForRaca(row) {
  return RACA_BY_NAME[row.name] || RACA_BY_CATEGORY[row.categoria] || SVG.mysteryMan;
}

/* ===== Vantagens ===== */

const VANTAGEM_BY_CATEGORY = {
  "Combate":       SVG.sword,
  "Magia":         SVG.magicSwirl,
  "Defesa":        SVG.magicShield,
  "Movimento":     SVG.upgrade,
  "Recupera\u00e7\u00e3o":  SVG.heal,
  "Social":        SVG.mysteryMan,
  "Perícia":       SVG.book,
  "Recurso":       SVG.chest,
  "Transformação": SVG.aura
};

const VANTAGEM_BY_NAME = {
  "Aceleração":         SVG.upgrade,
  "Adaptador":          SVG.book,
  "Aliado":             SVG.mysteryMan,
  "Alquimista":         SVG.tankard,
  "Aparência Inofensiva":SVG.cowled,
  "Arcano":             SVG.magicSwirl,
  "Área de Batalha":    SVG.ruins,
  "Arena":              SVG.ruins,
  "Armadura Extra":     SVG.magicShield,
  "Ataque Especial":    SVG.combat,
  "Ataque Múltiplo":    SVG.combat,
  "Boa Fama":           SVG.sun,
  "Clericato":          SVG.holyShield,
  "Deflexão":           SVG.magicShield,
  "Elementalista":      SVG.crystal,
  "Energia Extra":      SVG.heal,
  "Energia Vital":      SVG.heal,
  "Familiar":           SVG.pawprint,
  "Forma Alternativa":  SVG.aura,
  "Genialidade":        SVG.book,
  "Imortal":            SVG.holyShield,
  "Inimigo":            SVG.target,
  "Invisibilidade":     SVG.cowled,
  "Invulnerabilidade":  SVG.magicShield,
  "Ligação Natural":    SVG.tree,
  "Magia Branca":       SVG.holyShield,
  "Magia Elemental":    SVG.oak,
  "Magia Negra":        SVG.skull,
  "Magia Irresistível": SVG.magicSwirl,
  "Membros Elásticos":  SVG.net,
  "Membros Extras":     SVG.combat,
  "Memória Expandida":  SVG.book,
  "Mentor":             SVG.cowled,
  "Paladino":           SVG.holyShield,
  "Paralisia":          SVG.paralysis,
  "Parceiro":           SVG.mysteryMan,
  "Patrono":            SVG.castle,
  "Poder Oculto":       SVG.aura,
  "Pontos de Magia Extras":SVG.magicSwirl,
  "Pontos de Vida Extras":SVG.heal,
  "Possessão":          SVG.cowled,
  "Reflexão":           SVG.magicShield,
  "Regeneração":        SVG.regen,
  "Resistência à Magia":SVG.magicShield,
  "Riqueza":            SVG.chest,
  "Sentidos Especiais": SVG.eye,
  "Separação":          SVG.aura,
  "Telepatia":          SVG.cowled,
  "Teleporte":          SVG.magicSwirl,
  "Tiro Carregável":    SVG.target,
  "Tiro Múltiplo":      SVG.target,
  "Torcida":            SVG.sound,
  "Toque de Energia":   SVG.lightning,
  "Voo":                SVG.upgrade,
  "Xamã":               SVG.tree
};

function iconForVantagem(row) {
  return VANTAGEM_BY_NAME[row.name] || VANTAGEM_BY_CATEGORY[row.categoria] || SVG.book;
}

/* ===== Desvantagens ===== */

const DESVANTAGEM_BY_CATEGORY = {
  "Física": SVG.hazard,
  "Mental": SVG.terror,
  "Social": SVG.cowled,
  "Magia":  SVG.magicSwirl,
  "Combate":SVG.trap
};

const DESVANTAGEM_BY_NAME = {
  "Ambiente Especial": SVG.hazard,
  "Assombrado":        SVG.cowled,
  "Bateria":           SVG.cog,
  "Código de Honra":   SVG.cross,
  "Deficiência Física":SVG.hazard,
  "Dependência":       SVG.tankard,
  "Devoção":           SVG.cross,
  "Fetiche":           SVG.crystal,
  "Fúria":             SVG.terror,
  "Inculto":           SVG.hazard,
  "Insano":            SVG.terror,
  "Interferência":     SVG.radiation,
  "Interferência Mágica":SVG.magicSwirl,
  "Má Fama":           SVG.skull,
  "Maldição":          SVG.skull,
  "Modelo Especial":   SVG.hazard,
  "Monstruoso":        SVG.terror,
  "Munição Limitada":  SVG.target,
  "Poder Vergonhoso":  SVG.cowled
};

function iconForDesvantagem(row) {
  return DESVANTAGEM_BY_NAME[row.name] || DESVANTAGEM_BY_CATEGORY[row.categoria] || SVG.skull;
}

/* ===== Dispatcher ===== */

export function iconFor(row, type) {
  switch (type) {
    case "magia":         return iconForMagia(row);
    case "pericia":       return iconForPericia(row);
    case "vantagemUnica": return iconForRaca(row);
    case "vantagem":      return iconForVantagem(row);
    case "desvantagem":   return iconForDesvantagem(row);
    case "objetoMagico":  return SVG.sword;
    default:              return SVG.itemBag;
  }
}
