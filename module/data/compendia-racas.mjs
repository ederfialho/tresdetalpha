/**
 * Vantagens Únicas / Raças do Manual Core 3D&T Alpha (pp. 47–61).
 *
 * Cada raça é registrada como `vantagemUnica`. Algumas oferecem bônus de
 * característica; esses ficam no `efeito` (texto) e, quando fazem sentido
 * como buff permanente, também em `effects` (ActiveEffect que aplica no actor).
 */

const MODE = { MULTIPLY: 1, ADD: 2, DOWNGRADE: 3, UPGRADE: 4, OVERRIDE: 5 };
const chg = (key, value, mode = MODE.ADD, priority = 20) => ({ key, mode, value: String(value), priority });
const effPerm = (name, changes, img) => ({
  name,
  img: img ?? "icons/environment/people/group.webp",
  changes, transfer: true, disabled: false
});

export const VANTAGENS_UNICAS = [
  /* ========== HUMANOS ========== */
  {
    name: "Humano", custo: 0, categoria: "Humano",
    efeito: "<p>Na maioria dos mundos, humanos não precisam de nenhuma vantagem única — é a raça 'padrão'. Se você não comprar nenhuma vantagem única, será humano automaticamente. Humanos têm mais iniciativa e energia que outras raças, mas vidas mais curtas.</p>",
    package: { abilityBonuses: {}, granted: [], choices: [], aptidoes: [], forbidden: [], conditionalBonus: "", exceptions: [] }
  },

  /* ========== SEMI-HUMANOS ========== */
  {
    name: "Anão", custo: 1, categoria: "Semi-humano",
    efeito: "<p>Pequenos, robustos, mineiros e joalheiros. <strong>Infravisão</strong>, <strong>Resistência à Magia</strong>, <strong>Testes de Resistência +1</strong> (cumulativo com Resistência à Magia). <strong>Inimigos</strong> (orcs, goblinoides, trolls) — H+1 em combate contra eles.</p>",
    effects: [effPerm("Anão — R+1 em testes", [chg("system.abilities.resistencia.bonus", 1)])],
    package: {
      abilityBonuses: { resistencia: 1 },
      granted: [
        { name: "Infravisão", type: "vantagem" },
        { name: "Resistência à Magia", type: "vantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "H+1 em combate contra orcs, goblinoides (goblins, hobgoblins, bugbears) e trolls.",
      exceptions: []
    }
  },
  {
    name: "Elfo", custo: 1, categoria: "Semi-humano",
    efeito: "<p>Ágeis, afinidade com a natureza e magia. <strong>Habilidade +1</strong>, <strong>Visão Aguçada</strong>, <strong>FA +1 com espada e arco</strong> (personalize seu dano), <strong>Aptidão para Magia Elemental</strong> (custa 1 ponto em vez de 2).</p>",
    effects: [effPerm("Elfo — H+1", [chg("system.abilities.habilidade.bonus", 1)])],
    package: {
      abilityBonuses: { habilidade: 1 },
      granted: [
        { name: "Visão Aguçada", type: "vantagem" }
      ],
      choices: [],
      aptidoes: [
        { target: "Magia Elemental", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "FA +1 com espada e arco (personalize seu dano).",
      exceptions: []
    }
  },
  {
    name: "Elfo Negro", custo: 2, categoria: "Semi-humano",
    efeito: "<p>Elfos subterrâneos, geralmente malignos. <strong>Habilidade +1</strong>, <strong>Infravisão</strong>, <strong>Resistência à Magia</strong>, <strong>Magia Branca ou Negra</strong> (sua escolha) sem pagar pontos. <strong>Ponto Fraco:</strong> à luz do dia, −1 temporário em todas as características e 2× o custo em PMs para lançar magias.</p>",
    effects: [effPerm("Elfo Negro — H+1", [chg("system.abilities.habilidade.bonus", 1)])],
    package: {
      abilityBonuses: { habilidade: 1 },
      granted: [
        { name: "Infravisão", type: "vantagem" },
        { name: "Resistência à Magia", type: "vantagem" },
        { name: "Ponto Fraco", type: "desvantagem" }
      ],
      choices: [
        { id: "magiaEscola", label: "Escola de magia (Branca ou Negra)", pick: 1, optionType: "vantagem",
          options: ["Magia Branca", "Magia Negra"] }
      ],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "À luz do dia, −1 temporário em todas as características e 2× o custo de PMs para lançar magias.",
      exceptions: []
    }
  },
  {
    name: "Gnomo", custo: 2, categoria: "Semi-humano",
    efeito: "<p>Pequenos, engenhosos, maiores ilusionistas. <strong>Habilidade +1</strong>, <strong>Genialidade</strong>, <strong>Faro Aguçado</strong>, <strong>Pequenos Desejos</strong> (magia gratuita), <strong>Modelo Especial</strong> (não usa equipamento humano).</p>",
    effects: [effPerm("Gnomo — H+1", [chg("system.abilities.habilidade.bonus", 1)])],
    package: {
      abilityBonuses: { habilidade: 1 },
      granted: [
        { name: "Genialidade", type: "vantagem" },
        { name: "Faro Aguçado", type: "vantagem" },
        { name: "Modelo Especial", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Pequenos Desejos: magia gratuita de nível baixo, a critério do Mestre.",
      exceptions: []
    }
  },
  {
    name: "Halfling", custo: 1, categoria: "Semi-humano",
    efeito: "<p>Hobbits — pequenos, hábeis com projéteis. <strong>Habilidade +1</strong>, <strong>Poder de Fogo +1</strong>, <strong>Aptidão para Crime</strong> (custa 1 ponto), <strong>Modelo Especial</strong>.</p>",
    effects: [
      effPerm("Halfling — H+1", [chg("system.abilities.habilidade.bonus", 1)]),
      effPerm("Halfling — PdF+1", [chg("system.abilities.poderDeFogo.bonus", 1)])
    ],
    package: {
      abilityBonuses: { habilidade: 1, poderDeFogo: 1 },
      granted: [
        { name: "Modelo Especial", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [
        { target: "Crime", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "",
      exceptions: []
    }
  },
  {
    name: "Meio-Elfo", custo: 0, categoria: "Semi-humano",
    efeito: "<p>Híbrido humano-elfo. <strong>Visão Aguçada</strong>, <strong>Aptidão para Artes e Manipulação</strong> (cada uma custa 1 ponto).</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Visão Aguçada", type: "vantagem" }
      ],
      choices: [],
      aptidoes: [
        { target: "Artes", discount: 1, note: "custa 1 ponto em vez de 2" },
        { target: "Manipulação", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "",
      exceptions: []
    }
  },
  {
    name: "Meio-Orc", custo: 0, categoria: "Semi-humano",
    efeito: "<p>Híbrido humano-orc, força brutal. <strong>Força +1</strong>, <strong>Infravisão</strong>, <strong>Má Fama</strong>, <strong>Vantagens Proibidas</strong> (não pode comprar Genialidade ou Memória Expandida).</p>",
    effects: [effPerm("Meio-Orc — F+1", [chg("system.abilities.forca.bonus", 1)])],
    package: {
      abilityBonuses: { forca: 1 },
      granted: [
        { name: "Infravisão", type: "vantagem" },
        { name: "Má Fama", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: ["Genialidade", "Memória Expandida"],
      conditionalBonus: "",
      exceptions: []
    }
  },

  /* ========== HUMANOIDES ========== */
  {
    name: "Alien", custo: 2, categoria: "Humanoide",
    efeito: "<p>Extraterrestre. <strong>Característica +1</strong> (escolha), <strong>Armadura Extra</strong> contra um tipo de energia, <strong>Vantagem Bônus</strong> (1 ponto grátis ou 2 pts de vantagens por 1), <strong>Inculto</strong>.</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Armadura Extra", type: "vantagem" },
        { name: "Inculto", type: "desvantagem" }
      ],
      choices: [
        { id: "caractBonus", label: "+1 em uma característica", pick: 1, optionType: "ability",
          options: ["Força", "Habilidade", "Resistência", "Armadura", "PdF"] }
      ],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Vantagem Bônus: 1 ponto de vantagem grátis, OU 2 pts de vantagens pelo preço de 1.",
      exceptions: []
    }
  },
  {
    name: "Anfíbio", custo: 0, categoria: "Humanoide",
    efeito: "<p>Raça submarina (tritão, sereia, ningyo). <strong>Resistência +1</strong>, <strong>Natação</strong> (velocidade normal na água), <strong>Radar</strong> submerso, <strong>Ambiente Especial</strong> (água), <strong>Vulnerabilidade: Fogo</strong>.</p>",
    effects: [effPerm("Anfíbio — R+1", [chg("system.abilities.resistencia.bonus", 1)])],
    package: {
      abilityBonuses: { resistencia: 1 },
      granted: [
        { name: "Natação", type: "vantagem" },
        { name: "Sentidos Especiais", type: "vantagem" },
        { name: "Ambiente Especial", type: "desvantagem" },
        { name: "Vulnerabilidade", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Radar (Sentidos Especiais) submerso. Vulnerabilidade a Fogo. Ambiente Especial: água.",
      exceptions: []
    }
  },
  {
    name: "Centauro", custo: 1, categoria: "Humanoide",
    efeito: "<p>Torso humano, corpo de cavalo. <strong>Habilidade +1</strong> (apenas corrida/fuga/perseguição), <strong>Força +1</strong>, <strong>Combate Táurico</strong> (2 ataques com patas, F=F+1d, sem Habilidade), <strong>Modelo Especial</strong>.</p>",
    effects: [effPerm("Centauro — F+1", [chg("system.abilities.forca.bonus", 1)])],
    package: {
      abilityBonuses: { forca: 1 },
      granted: [
        { name: "Modelo Especial", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Habilidade +1 apenas em corrida, fuga ou perseguição. Combate Táurico: 2 ataques com patas usando F=F+1d, sem Habilidade.",
      exceptions: []
    }
  },
  {
    name: "Goblin", custo: -1, categoria: "Humanoide",
    efeito: "<p>Pequeno humanoide maligno de baixa estatura. <strong>Testes de Resistência +1</strong>, <strong>Infravisão</strong>, <strong>Aptidão para Crime</strong> (1 ponto), <strong>Má Fama</strong>, <strong>Magia</strong> custa 3 pts cada (exceto Clericato).</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Infravisão", type: "vantagem" },
        { name: "Má Fama", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [
        { target: "Crime", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "R+1 apenas em testes de Resistência. Magia Branca/Negra/Elemental custam 3 pts cada (Clericato custa o normal).",
      exceptions: []
    }
  },
  {
    name: "Kemono", custo: 1, categoria: "Humanoide",
    efeito: "<p>Animal antropomórfico. <strong>Habilidade +1</strong>, <strong>Sentidos Especiais</strong> (2 de 3: Audição, Visão, Faro).</p>",
    effects: [effPerm("Kemono — H+1", [chg("system.abilities.habilidade.bonus", 1)])],
    package: {
      abilityBonuses: { habilidade: 1 },
      granted: [],
      choices: [
        { id: "sentidosKemono", label: "Sentidos Especiais (escolha 2 de 3)", pick: 2, optionType: "vantagem",
          options: ["Audição Aguçada", "Visão Aguçada", "Faro Aguçado"] }
      ],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "",
      exceptions: []
    }
  },
  {
    name: "Meio-Dragão", custo: 4, categoria: "Humanoide",
    efeito: "<p>Filho de dragão. <strong>Arcano</strong> (magia completa), <strong>Invulnerabilidade</strong> ao elemento do pai (escolher).</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Arcano", type: "vantagem" },
        { name: "Invulnerabilidade", type: "vantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Invulnerabilidade ao elemento do pai dragão (escolha do jogador na criação).",
      exceptions: []
    }
  },
  {
    name: "Minotauro", custo: 0, categoria: "Humanoide",
    efeito: "<p>Guerreiro brutal com corpo musculoso e cabeça de touro. <strong>Força +2</strong>, <strong>Resistência +1</strong>, <strong>Mente Labiríntica</strong> (nunca se perde em labirintos), <strong>Código de Honra do Combate</strong>, <strong>Má Fama</strong>, <strong>Fobia (altura)</strong>.</p>",
    effects: [
      effPerm("Minotauro — F+2", [chg("system.abilities.forca.bonus", 2)]),
      effPerm("Minotauro — R+1", [chg("system.abilities.resistencia.bonus", 1)])
    ],
    package: {
      abilityBonuses: { forca: 2, resistencia: 1 },
      granted: [
        { name: "Código de Honra", type: "desvantagem" },
        { name: "Má Fama", type: "desvantagem" },
        { name: "Fobia", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Mente Labiríntica: nunca se perde em labirintos. Código de Honra: do Combate. Fobia: altura.",
      exceptions: []
    }
  },
  {
    name: "Ogre", custo: 2, categoria: "Humanoide",
    efeito: "<p>Humanoide gigante primitivo (3m altura). <strong>Força +3</strong>, <strong>Resistência +3</strong>, <strong>Modelo Especial</strong>, <strong>Inculto</strong>, <strong>Má Fama</strong>, <strong>Monstruoso</strong>. Em testes sociais: +2 Interrogatório/Intimidação, −2 Lábia/Sedução. Não pode Genialidade, Memória Expandida ou magias.</p>",
    effects: [
      effPerm("Ogre — F+3", [chg("system.abilities.forca.bonus", 3)]),
      effPerm("Ogre — R+3", [chg("system.abilities.resistencia.bonus", 3)])
    ],
    package: {
      abilityBonuses: { forca: 3, resistencia: 3 },
      granted: [
        { name: "Modelo Especial", type: "desvantagem" },
        { name: "Inculto", type: "desvantagem" },
        { name: "Má Fama", type: "desvantagem" },
        { name: "Monstruoso", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: ["Genialidade", "Memória Expandida", "Magia Branca", "Magia Negra", "Magia Elemental", "Arcano"],
      conditionalBonus: "Em testes sociais: +2 em Interrogatório e Intimidação, −2 em Lábia e Sedução.",
      exceptions: []
    }
  },
  {
    name: "Troglodita", custo: 2, categoria: "Humanoide",
    efeito: "<p>Homem-lagarto subterrâneo. <strong>Força +1</strong>, <strong>Armadura +1</strong>, <strong>Infravisão</strong>, <strong>Camuflagem</strong> (Furtividade grátis), <strong>Ataque Pestilento</strong> (2 PMs, F−1 nos inimigos por 1 turno), <strong>Monstruoso</strong>, <strong>Vulnerabilidade: Frio</strong>.</p>",
    effects: [
      effPerm("Troglodita — F+1", [chg("system.abilities.forca.bonus", 1)]),
      effPerm("Troglodita — A+1", [chg("system.abilities.armadura.bonus", 1)])
    ],
    package: {
      abilityBonuses: { forca: 1, armadura: 1 },
      granted: [
        { name: "Infravisão", type: "vantagem" },
        { name: "Monstruoso", type: "desvantagem" },
        { name: "Vulnerabilidade", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Camuflagem: Furtividade como perícia grátis. Ataque Pestilento: gastar 2 PMs para impor F−1 aos inimigos adjacentes por 1 turno. Vulnerabilidade: Frio.",
      exceptions: []
    }
  },

  /* ========== YOUKAI ========== */
  {
    name: "Anjo", custo: 2, categoria: "Youkai",
    efeito: "<p>Celestial. <strong>Boa Fama</strong>, <strong>Sentidos Especiais</strong> (Infravisão, Visão Aguçada, Ver o Invisível), <strong>Invulnerabilidade: Elétrico/Sônico</strong>, <strong>Aptidão Voo/Magia Branca</strong> (1 pt cada), <strong>Teleportação Planar</strong>, <strong>Maldição</strong> (banimento de 30d-1000 anos se morto fora do plano), <strong>Vulnerabilidade: Fogo</strong>.</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Boa Fama", type: "vantagem" },
        { name: "Sentidos Especiais", type: "vantagem" },
        { name: "Invulnerabilidade", type: "vantagem" },
        { name: "Maldição", type: "desvantagem" },
        { name: "Vulnerabilidade", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [
        { target: "Voo", discount: 1, note: "custa 1 ponto em vez de 2" },
        { target: "Magia Branca", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "Sentidos Especiais: Infravisão, Visão Aguçada e Ver o Invisível. Invulnerabilidade a Elétrico/Sônico. Teleportação Planar. Maldição: se morto fora do plano natal, banido por 30d×1000 anos. Vulnerabilidade: Fogo.",
      exceptions: []
    }
  },
  {
    name: "Demônio", custo: 1, categoria: "Youkai",
    efeito: "<p>Ser do abismo. <strong>Sentidos Especiais</strong>, <strong>Invulnerabilidade: Fogo</strong>, <strong>Aptidão Voo/Magia Negra</strong> (1 pt cada), <strong>Teleportação Planar</strong>, <strong>Má Fama</strong>, <strong>Maldição</strong>, <strong>Vulnerabilidade: Elétrico/Sônico</strong>.</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Sentidos Especiais", type: "vantagem" },
        { name: "Invulnerabilidade", type: "vantagem" },
        { name: "Má Fama", type: "desvantagem" },
        { name: "Maldição", type: "desvantagem" },
        { name: "Vulnerabilidade", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [
        { target: "Voo", discount: 1, note: "custa 1 ponto em vez de 2" },
        { target: "Magia Negra", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "Invulnerabilidade a Fogo. Teleportação Planar. Maldição: se morto fora do plano natal, banido por 30d×1000 anos. Vulnerabilidade: Elétrico/Sônico.",
      exceptions: []
    }
  },
  {
    name: "Fada", custo: 3, categoria: "Youkai",
    efeito: "<p>Pequeno ser mágico. <strong>Habilidade +1</strong>, <strong>Aparência Inofensiva</strong>, <strong>Voo</strong>, <strong>Magia Branca ou Negra</strong> + <strong>Magia Elemental</strong> (grátis!), <strong>Modelo Especial</strong>, <strong>Vulnerabilidade: Magia</strong>, não pode ser Monstruosa.</p>",
    effects: [effPerm("Fada — H+1", [chg("system.abilities.habilidade.bonus", 1)])],
    package: {
      abilityBonuses: { habilidade: 1 },
      granted: [
        { name: "Aparência Inofensiva", type: "vantagem" },
        { name: "Voo", type: "vantagem" },
        { name: "Magia Elemental", type: "vantagem" },
        { name: "Modelo Especial", type: "desvantagem" },
        { name: "Vulnerabilidade", type: "desvantagem" }
      ],
      choices: [
        { id: "magiaEscola", label: "Escola de magia (Branca ou Negra)", pick: 1, optionType: "vantagem",
          options: ["Magia Branca", "Magia Negra"] }
      ],
      aptidoes: [],
      forbidden: ["Monstruoso"],
      conditionalBonus: "Vulnerabilidade a Magia. Não pode ser Monstruosa.",
      exceptions: []
    }
  },
  {
    name: "Licantropo", custo: 0, categoria: "Youkai",
    efeito: "<p>Metamorfo em fera. <strong>Força Animal</strong>: F+1 e A+1 em forma normal, dobrado na forma fera + Sentidos Especiais, mas com Modelo Especial, Monstruoso e Vulnerabilidade: Magia e Prata. <strong>Transformação</strong> fora do controle (lua cheia, fúria, perto da morte, protegido em perigo).</p>",
    package: {
      abilityBonuses: { forca: 1, armadura: 1 },
      granted: [
        { name: "Sentidos Especiais", type: "vantagem" },
        { name: "Forma Alternativa", type: "vantagem" },
        { name: "Modelo Especial", type: "desvantagem" },
        { name: "Monstruoso", type: "desvantagem" },
        { name: "Vulnerabilidade", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Forma fera: F e A dobrados (F+2, A+2 totais). Transformação fora do controle: lua cheia, fúria, perto da morte, ou ao ver alguém protegido em perigo. Vulnerabilidade: Magia e Prata.",
      exceptions: []
    }
  },
  {
    name: "Meio-Abissal", custo: 2, categoria: "Youkai",
    efeito: "<p>Mortal com sangue demoníaco. <strong>Sentidos Especiais</strong> (Infravisão, Faro Aguçado, Ver o Invisível), <strong>Armadura Extra: Fogo</strong>, <strong>Aptidão Voo/Magia Negra</strong> (1 pt), <strong>Vulnerabilidade: Elétrico/Sônico</strong>.</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Sentidos Especiais", type: "vantagem" },
        { name: "Armadura Extra", type: "vantagem" },
        { name: "Vulnerabilidade", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [
        { target: "Voo", discount: 1, note: "custa 1 ponto em vez de 2" },
        { target: "Magia Negra", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "Sentidos Especiais: Infravisão, Faro Aguçado e Ver o Invisível. Armadura Extra contra Fogo. Vulnerabilidade: Elétrico/Sônico.",
      exceptions: []
    }
  },
  {
    name: "Meio-Celestial", custo: 2, categoria: "Youkai",
    efeito: "<p>Mortal com sangue angelical. <strong>Sentidos Especiais</strong>, <strong>Armadura Extra: Elétrico/Sônico</strong>, <strong>Aptidão Voo/Magia Branca</strong> (1 pt), <strong>Vulnerabilidade: Fogo</strong>.</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Sentidos Especiais", type: "vantagem" },
        { name: "Armadura Extra", type: "vantagem" },
        { name: "Vulnerabilidade", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [
        { target: "Voo", discount: 1, note: "custa 1 ponto em vez de 2" },
        { target: "Magia Branca", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "Armadura Extra contra Elétrico/Sônico. Vulnerabilidade: Fogo.",
      exceptions: []
    }
  },
  {
    name: "Meio-Gênio", custo: 4, categoria: "Youkai",
    efeito: "<p>Híbrido com gênio mágico. <strong>Arcano</strong>, <strong>Armadura Extra</strong> (elemento de descendência: água/ar/fogo/luz/trevas), <strong>Aptidão Voo</strong> (1 pt), <strong>Desejos</strong> (quando usuário lança magia a pedido, metade do custo em PMs), <strong>Código da Gratidão</strong>.</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Arcano", type: "vantagem" },
        { name: "Armadura Extra", type: "vantagem" },
        { name: "Código de Honra", type: "desvantagem" }
      ],
      choices: [
        { id: "elementoGenio", label: "Elemento de descendência (Armadura Extra)", pick: 1, optionType: "element",
          options: ["Água", "Ar", "Fogo", "Luz", "Trevas"] }
      ],
      aptidoes: [
        { target: "Voo", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "Desejos: quando o usuário lança magia a pedido do Meio-Gênio, paga metade do custo em PMs. Código da Gratidão: deve retribuir favores significativos.",
      exceptions: []
    }
  },

  /* ========== CONSTRUTOS ========== */
  {
    name: "Androide", custo: 1, categoria: "Construto",
    efeito: "<p>Robô humanoide. Todas as <strong>imunidades</strong> de construto (sem fome/sede/sono, imune a venenos/magias mentais e Elemental espírito). <strong>Reparos</strong> via perícia Máquinas (1 PV/H+1). <strong>Aparência Humana</strong>. Pode ter <strong>Alma Humana</strong> (emociones reais, afetado por magias mentais).</p>",
    package: {
      abilityBonuses: {},
      granted: [],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Imunidades de construto: não precisa comer, beber ou dormir; imune a venenos e magias mentais (exceto se comprar Alma Humana); imune a Elemental espírito. Reparos: teste de Máquinas para recuperar PVs (1 PV por H+1 do sucesso). Aparência humana (disfarce).",
      exceptions: []
    }
  },
  {
    name: "Ciborgue", custo: 0, categoria: "Construto",
    efeito: "<p>Meio-homem meio-máquina. <strong>Construto Vivo</strong> (recupera metade dos PVs via descanso normal), <strong>Cérebro Orgânico</strong> (afeta magia mental, −1 ponto no custo).</p>",
    package: {
      abilityBonuses: {},
      granted: [],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Construto Vivo: recupera apenas metade dos PVs com descanso normal; o resto exige reparos. Cérebro Orgânico: afetado por magias mentais (por isso o custo total da raça é reduzido em 1 pt).",
      exceptions: []
    }
  },
  {
    name: "Golem", custo: 3, categoria: "Construto",
    efeito: "<p>Estátua mágica. Imunidades de construto + <strong>Armadura Extra contra todas as magias de dano</strong> + sucessos automáticos em testes de R contra magias. <strong>Camuflagem</strong> (Furtividade como perícia). <strong>Monstruoso</strong> quando revelado.</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Armadura Extra", type: "vantagem" },
        { name: "Resistência à Magia", type: "vantagem" },
        { name: "Monstruoso", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Imunidades de construto. Armadura Extra contra TODAS as magias de dano. Sucessos automáticos em testes de R contra magias. Camuflagem: Furtividade como perícia grátis. Monstruoso apenas quando revelado (disfarce de estátua).",
      exceptions: []
    }
  },
  {
    name: "Mecha", custo: 0, categoria: "Construto",
    efeito: "<p>Robô japonês de manga/anime, peça pilotada. É na verdade um <strong>Aliado</strong> com esta vantagem única. <strong>Aptidão para Forma Alternativa</strong> (1 pt), <strong>Modelo Especial</strong>.</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Aliado", type: "vantagem" },
        { name: "Modelo Especial", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [
        { target: "Forma Alternativa", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "O Mecha é na verdade um Aliado com esta vantagem única (representando o piloto).",
      exceptions: []
    }
  },
  {
    name: "Meio-Golem", custo: 1, categoria: "Construto",
    efeito: "<p>Versão medieval mágica de ciborgue. <strong>Construto Vivo</strong> (cura metade com descanso), <strong>Cérebro Orgânico</strong>, <strong>Magia</strong> (Branca, Elemental ou Negra), <strong>Insano −1</strong> (a transformação é horrível).</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Insano", type: "desvantagem" }
      ],
      choices: [
        { id: "magiaGolem", label: "Escola de magia", pick: 1, optionType: "vantagem",
          options: ["Magia Branca", "Magia Negra", "Magia Elemental"] }
      ],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Construto Vivo: recupera apenas metade dos PVs com descanso normal. Cérebro Orgânico: afetado por magias mentais. Insano (−1): a transformação deixou sequelas mentais horríveis.",
      exceptions: []
    }
  },
  {
    name: "Nanomorfo", custo: 3, categoria: "Construto",
    efeito: "<p>Construto de metal líquido (nanobots). <strong>Doppleganger</strong> (muda forma), <strong>Adaptador</strong>, <strong>Membros Elásticos</strong>, <strong>+2 em testes de H ligados a Crime e Máquinas</strong>, <strong>Regeneração</strong> (1 PV/turno), <strong>Aptidão para Separação</strong> (1 pt).</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Doppelganger", type: "vantagem" },
        { name: "Adaptador", type: "vantagem" },
        { name: "Membros Elásticos", type: "vantagem" },
        { name: "Regeneração", type: "vantagem" }
      ],
      choices: [],
      aptidoes: [
        { target: "Separação", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "+2 em testes de Habilidade ligados a Crime e Máquinas. Regeneração: 1 PV por turno.",
      exceptions: []
    }
  },
  {
    name: "Robô Positrônico", custo: -2, categoria: "Construto",
    efeito: "<p>Robô humanoide programado com as Três Leis de Asimov. <strong>Código de Honra:</strong> 1ª Lei (não causar mal a humanos), 2ª Lei (obedecer humanos), 3ª Lei (proteger a si mesmo).</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Código de Honra", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Código de Honra das Três Leis de Asimov: (1) nunca causar mal a humanos ou deixar que sofram, (2) obedecer humanos exceto quando viola a 1ª Lei, (3) proteger a si mesmo exceto quando viola as Leis anteriores.",
      exceptions: []
    }
  },

  /* ========== MORTOS-VIVOS ========== */
  {
    name: "Esqueleto", custo: 0, categoria: "Morto-Vivo",
    efeito: "<p>Amontoado de ossos animado. Imunidades de morto-vivo. <strong>Invulnerabilidade: Frio</strong>, <strong>Armadura Extra: Corte/Perfuração</strong>, <strong>Devoção</strong> (ao invocador), <strong>Inculto</strong>, <strong>Monstruoso</strong>.</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Invulnerabilidade", type: "vantagem" },
        { name: "Armadura Extra", type: "vantagem" },
        { name: "Devoção", type: "desvantagem" },
        { name: "Inculto", type: "desvantagem" },
        { name: "Monstruoso", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Imunidades de morto-vivo. Invulnerabilidade a Frio. Armadura Extra contra Corte/Perfuração. Devoção ao invocador.",
      exceptions: []
    }
  },
  {
    name: "Fantasma", custo: 3, categoria: "Morto-Vivo",
    efeito: "<p>Espírito descarnado. <strong>Incorpóreo</strong> (imune a dano físico/energia, só ataca incorpóreos; PMs em vez de PVs contra mágica). <strong>Imortal</strong> (ressurge na tumba). <strong>Pânico</strong> (magia pelo custo normal). <strong>Aptidão Invisibilidade/Possessão</strong> (1 pt). <strong>Devoção</strong> (preso a uma missão).</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Imortal", type: "vantagem" },
        { name: "Devoção", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [
        { target: "Invisibilidade", discount: 1, note: "custa 1 ponto em vez de 2" },
        { target: "Possessão", discount: 1, note: "custa 1 ponto em vez de 2" }
      ],
      forbidden: [],
      conditionalBonus: "Incorpóreo: imune a dano físico e energia; só pode atacar outros incorpóreos; sofre dano em PMs (não PVs) contra efeitos mágicos. Imortal: ressurge na tumba após ser destruído. Pânico (magia) pelo custo normal. Devoção: preso a uma missão inacabada.",
      exceptions: []
    }
  },
  {
    name: "Múmia", custo: 3, categoria: "Morto-Vivo",
    efeito: "<p>Cadáver preservado. Imunidades de morto-vivo + disfarce ilusório humano (dissipa com dano/combate). <strong>Armadura Extra</strong> (dano normal só de fogo/magia). <strong>Podridão de Múmia</strong> (vítima pode contrair doença −1 em todas caract.). <strong>Pânico</strong> pelo custo normal. <strong>Ambiente Especial</strong> (sarcófago).</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Armadura Extra", type: "vantagem" },
        { name: "Ambiente Especial", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Imunidades de morto-vivo + disfarce ilusório humano (se dissipa ao sofrer dano ou entrar em combate). Armadura Extra: só sofre dano normal de fogo e magia. Podridão de Múmia: vítima atingida pode contrair doença que aplica −1 em todas as características. Pânico pelo custo normal. Ambiente Especial: sarcófago.",
      exceptions: []
    }
  },
  {
    name: "Vampiro", custo: -1, categoria: "Morto-Vivo",
    efeito: "<p>Sanguessuga imortal. <strong>Dependência</strong> (sangue), <strong>Maldição</strong> (perde PV ao sol), <strong>Monstruoso</strong>, <strong>Fobia</strong> (alho, água benta, fogo, símbolos religiosos), <strong>Vulnerabilidade: Químico</strong> (água corrente). Compra à parte: Forma de Névoa, Formas Alternativas, Imortal, Invulnerabilidade (fogo/magia só), Magia Negra.</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Dependência", type: "desvantagem" },
        { name: "Maldição", type: "desvantagem" },
        { name: "Monstruoso", type: "desvantagem" },
        { name: "Fobia", type: "desvantagem" },
        { name: "Vulnerabilidade", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Dependência: sangue. Maldição: perde PV ao sol direto. Fobia: alho, água benta, fogo e símbolos religiosos. Vulnerabilidade: Químico (água corrente). Pode comprar à parte Forma Alternativa, Imortal, Invulnerabilidade (apenas fogo/magia), Magia Negra.",
      exceptions: [
        { canRemove: "Monstruoso", costPoints: 1 }
      ]
    }
  },
  {
    name: "Zumbi", custo: -2, categoria: "Morto-Vivo",
    efeito: "<p>Morto-vivo deteriorado. <strong>Dependência</strong> (devora órgão humano/dia), <strong>Lentidão</strong> (H−2 iniciativa e esquivas; Aceleração não ajuda), <strong>Inculto</strong>, <strong>Monstruoso</strong>.</p>",
    package: {
      abilityBonuses: {},
      granted: [
        { name: "Dependência", type: "desvantagem" },
        { name: "Inculto", type: "desvantagem" },
        { name: "Monstruoso", type: "desvantagem" }
      ],
      choices: [],
      aptidoes: [],
      forbidden: [],
      conditionalBonus: "Dependência: devorar um órgão humano por dia. H−2 em iniciativa e esquivas (Lentidão). Aceleração não ajuda.",
      exceptions: [
        { canRemove: "Monstruoso", costPoints: 1 },
        { canRemove: "Inculto", costPoints: 1 }
      ]
    }
  }
];
