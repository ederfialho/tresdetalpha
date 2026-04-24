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
    efeito: "<p>Na maioria dos mundos, humanos não precisam de nenhuma vantagem única — é a raça 'padrão'. Se você não comprar nenhuma vantagem única, será humano automaticamente. Humanos têm mais iniciativa e energia que outras raças, mas vidas mais curtas.</p>"
  },

  /* ========== SEMI-HUMANOS ========== */
  {
    name: "Anão", custo: 1, categoria: "Semi-humano",
    efeito: "<p>Pequenos, robustos, mineiros e joalheiros. <strong>Infravisão</strong>, <strong>Resistência à Magia</strong>, <strong>Testes de Resistência +1</strong> (cumulativo com Resistência à Magia). <strong>Inimigos</strong> (orcs, goblinoides, trolls) — H+1 em combate contra eles.</p>",
    effects: [effPerm("Anão — R+1 em testes", [chg("system.abilities.resistencia.bonus", 1)])]
  },
  {
    name: "Elfo", custo: 1, categoria: "Semi-humano",
    efeito: "<p>Ágeis, afinidade com a natureza e magia. <strong>Habilidade +1</strong>, <strong>Visão Aguçada</strong>, <strong>FA +1 com espada e arco</strong> (personalize seu dano), <strong>Aptidão para Magia Elemental</strong> (custa 1 ponto em vez de 2).</p>",
    effects: [effPerm("Elfo — H+1", [chg("system.abilities.habilidade.bonus", 1)])]
  },
  {
    name: "Elfo Negro", custo: 2, categoria: "Semi-humano",
    efeito: "<p>Elfos subterrâneos, geralmente malignos. <strong>Habilidade +1</strong>, <strong>Infravisão</strong>, <strong>Resistência à Magia</strong>, <strong>Magia Branca ou Negra</strong> (sua escolha) sem pagar pontos. <strong>Ponto Fraco:</strong> à luz do dia, −1 temporário em todas as características e 2× o custo em PMs para lançar magias.</p>",
    effects: [effPerm("Elfo Negro — H+1", [chg("system.abilities.habilidade.bonus", 1)])]
  },
  {
    name: "Gnomo", custo: 2, categoria: "Semi-humano",
    efeito: "<p>Pequenos, engenhosos, maiores ilusionistas. <strong>Habilidade +1</strong>, <strong>Genialidade</strong>, <strong>Faro Aguçado</strong>, <strong>Pequenos Desejos</strong> (magia gratuita), <strong>Modelo Especial</strong> (não usa equipamento humano).</p>",
    effects: [effPerm("Gnomo — H+1", [chg("system.abilities.habilidade.bonus", 1)])]
  },
  {
    name: "Halfling", custo: 1, categoria: "Semi-humano",
    efeito: "<p>Hobbits — pequenos, hábeis com projéteis. <strong>Habilidade +1</strong>, <strong>Poder de Fogo +1</strong>, <strong>Aptidão para Crime</strong> (custa 1 ponto), <strong>Modelo Especial</strong>.</p>",
    effects: [
      effPerm("Halfling — H+1", [chg("system.abilities.habilidade.bonus", 1)]),
      effPerm("Halfling — PdF+1", [chg("system.abilities.poderDeFogo.bonus", 1)])
    ]
  },
  {
    name: "Meio-Elfo", custo: 0, categoria: "Semi-humano",
    efeito: "<p>Híbrido humano-elfo. <strong>Visão Aguçada</strong>, <strong>Aptidão para Artes e Manipulação</strong> (cada uma custa 1 ponto).</p>"
  },
  {
    name: "Meio-Orc", custo: 0, categoria: "Semi-humano",
    efeito: "<p>Híbrido humano-orc, força brutal. <strong>Força +1</strong>, <strong>Infravisão</strong>, <strong>Má Fama</strong>, <strong>Vantagens Proibidas</strong> (não pode comprar Genialidade ou Memória Expandida).</p>",
    effects: [effPerm("Meio-Orc — F+1", [chg("system.abilities.forca.bonus", 1)])]
  },

  /* ========== HUMANOIDES ========== */
  {
    name: "Alien", custo: 2, categoria: "Humanoide",
    efeito: "<p>Extraterrestre. <strong>Característica +1</strong> (escolha), <strong>Armadura Extra</strong> contra um tipo de energia, <strong>Vantagem Bônus</strong> (1 ponto grátis ou 2 pts de vantagens por 1), <strong>Inculto</strong>.</p>"
  },
  {
    name: "Anfíbio", custo: 0, categoria: "Humanoide",
    efeito: "<p>Raça submarina (tritão, sereia, ningyo). <strong>Resistência +1</strong>, <strong>Natação</strong> (velocidade normal na água), <strong>Radar</strong> submerso, <strong>Ambiente Especial</strong> (água), <strong>Vulnerabilidade: Fogo</strong>.</p>",
    effects: [effPerm("Anfíbio — R+1", [chg("system.abilities.resistencia.bonus", 1)])]
  },
  {
    name: "Centauro", custo: 1, categoria: "Humanoide",
    efeito: "<p>Torso humano, corpo de cavalo. <strong>Habilidade +1</strong> (apenas corrida/fuga/perseguição), <strong>Força +1</strong>, <strong>Combate Táurico</strong> (2 ataques com patas, F=F+1d, sem Habilidade), <strong>Modelo Especial</strong>.</p>",
    effects: [effPerm("Centauro — F+1", [chg("system.abilities.forca.bonus", 1)])]
  },
  {
    name: "Goblin", custo: -1, categoria: "Humanoide",
    efeito: "<p>Pequeno humanoide maligno de baixa estatura. <strong>Testes de Resistência +1</strong>, <strong>Infravisão</strong>, <strong>Aptidão para Crime</strong> (1 ponto), <strong>Má Fama</strong>, <strong>Magia</strong> custa 3 pts cada (exceto Clericato).</p>"
  },
  {
    name: "Kemono", custo: 1, categoria: "Humanoide",
    efeito: "<p>Animal antropomórfico. <strong>Habilidade +1</strong>, <strong>Sentidos Especiais</strong> (2 de 3: Audição, Visão, Faro).</p>",
    effects: [effPerm("Kemono — H+1", [chg("system.abilities.habilidade.bonus", 1)])]
  },
  {
    name: "Meio-Dragão", custo: 4, categoria: "Humanoide",
    efeito: "<p>Filho de dragão. <strong>Arcano</strong> (magia completa), <strong>Invulnerabilidade</strong> ao elemento do pai (escolher).</p>"
  },
  {
    name: "Minotauro", custo: 0, categoria: "Humanoide",
    efeito: "<p>Guerreiro brutal com corpo musculoso e cabeça de touro. <strong>Força +2</strong>, <strong>Resistência +1</strong>, <strong>Mente Labiríntica</strong> (nunca se perde em labirintos), <strong>Código de Honra do Combate</strong>, <strong>Má Fama</strong>, <strong>Fobia (altura)</strong>.</p>",
    effects: [
      effPerm("Minotauro — F+2", [chg("system.abilities.forca.bonus", 2)]),
      effPerm("Minotauro — R+1", [chg("system.abilities.resistencia.bonus", 1)])
    ]
  },
  {
    name: "Ogre", custo: 2, categoria: "Humanoide",
    efeito: "<p>Humanoide gigante primitivo (3m altura). <strong>Força +3</strong>, <strong>Resistência +3</strong>, <strong>Modelo Especial</strong>, <strong>Inculto</strong>, <strong>Má Fama</strong>, <strong>Monstruoso</strong>. Em testes sociais: +2 Interrogatório/Intimidação, −2 Lábia/Sedução. Não pode Genialidade, Memória Expandida ou magias.</p>",
    effects: [
      effPerm("Ogre — F+3", [chg("system.abilities.forca.bonus", 3)]),
      effPerm("Ogre — R+3", [chg("system.abilities.resistencia.bonus", 3)])
    ]
  },
  {
    name: "Troglodita", custo: 2, categoria: "Humanoide",
    efeito: "<p>Homem-lagarto subterrâneo. <strong>Força +1</strong>, <strong>Armadura +1</strong>, <strong>Infravisão</strong>, <strong>Camuflagem</strong> (Furtividade grátis), <strong>Ataque Pestilento</strong> (2 PMs, F−1 nos inimigos por 1 turno), <strong>Monstruoso</strong>, <strong>Vulnerabilidade: Frio</strong>.</p>",
    effects: [
      effPerm("Troglodita — F+1", [chg("system.abilities.forca.bonus", 1)]),
      effPerm("Troglodita — A+1", [chg("system.abilities.armadura.bonus", 1)])
    ]
  },

  /* ========== YOUKAI ========== */
  {
    name: "Anjo", custo: 2, categoria: "Youkai",
    efeito: "<p>Celestial. <strong>Boa Fama</strong>, <strong>Sentidos Especiais</strong> (Infravisão, Visão Aguçada, Ver o Invisível), <strong>Invulnerabilidade: Elétrico/Sônico</strong>, <strong>Aptidão Voo/Magia Branca</strong> (1 pt cada), <strong>Teleportação Planar</strong>, <strong>Maldição</strong> (banimento de 30d-1000 anos se morto fora do plano), <strong>Vulnerabilidade: Fogo</strong>.</p>"
  },
  {
    name: "Demônio", custo: 1, categoria: "Youkai",
    efeito: "<p>Ser do abismo. <strong>Sentidos Especiais</strong>, <strong>Invulnerabilidade: Fogo</strong>, <strong>Aptidão Voo/Magia Negra</strong> (1 pt cada), <strong>Teleportação Planar</strong>, <strong>Má Fama</strong>, <strong>Maldição</strong>, <strong>Vulnerabilidade: Elétrico/Sônico</strong>.</p>"
  },
  {
    name: "Fada", custo: 3, categoria: "Youkai",
    efeito: "<p>Pequeno ser mágico. <strong>Habilidade +1</strong>, <strong>Aparência Inofensiva</strong>, <strong>Voo</strong>, <strong>Magia Branca ou Negra</strong> + <strong>Magia Elemental</strong> (grátis!), <strong>Modelo Especial</strong>, <strong>Vulnerabilidade: Magia</strong>, não pode ser Monstruosa.</p>",
    effects: [effPerm("Fada — H+1", [chg("system.abilities.habilidade.bonus", 1)])]
  },
  {
    name: "Licantropo", custo: 0, categoria: "Youkai",
    efeito: "<p>Metamorfo em fera. <strong>Força Animal</strong>: F+1 e A+1 em forma normal, dobrado na forma fera + Sentidos Especiais, mas com Modelo Especial, Monstruoso e Vulnerabilidade: Magia e Prata. <strong>Transformação</strong> fora do controle (lua cheia, fúria, perto da morte, protegido em perigo).</p>"
  },
  {
    name: "Meio-Abissal", custo: 2, categoria: "Youkai",
    efeito: "<p>Mortal com sangue demoníaco. <strong>Sentidos Especiais</strong> (Infravisão, Faro Aguçado, Ver o Invisível), <strong>Armadura Extra: Fogo</strong>, <strong>Aptidão Voo/Magia Negra</strong> (1 pt), <strong>Vulnerabilidade: Elétrico/Sônico</strong>.</p>"
  },
  {
    name: "Meio-Celestial", custo: 2, categoria: "Youkai",
    efeito: "<p>Mortal com sangue angelical. <strong>Sentidos Especiais</strong>, <strong>Armadura Extra: Elétrico/Sônico</strong>, <strong>Aptidão Voo/Magia Branca</strong> (1 pt), <strong>Vulnerabilidade: Fogo</strong>.</p>"
  },
  {
    name: "Meio-Gênio", custo: 4, categoria: "Youkai",
    efeito: "<p>Híbrido com gênio mágico. <strong>Arcano</strong>, <strong>Armadura Extra</strong> (elemento de descendência: água/ar/fogo/luz/trevas), <strong>Aptidão Voo</strong> (1 pt), <strong>Desejos</strong> (quando usuário lança magia a pedido, metade do custo em PMs), <strong>Código da Gratidão</strong>.</p>"
  },

  /* ========== CONSTRUTOS ========== */
  {
    name: "Androide", custo: 1, categoria: "Construto",
    efeito: "<p>Robô humanoide. Todas as <strong>imunidades</strong> de construto (sem fome/sede/sono, imune a venenos/magias mentais e Elemental espírito). <strong>Reparos</strong> via perícia Máquinas (1 PV/H+1). <strong>Aparência Humana</strong>. Pode ter <strong>Alma Humana</strong> (emociones reais, afetado por magias mentais).</p>"
  },
  {
    name: "Ciborgue", custo: 0, categoria: "Construto",
    efeito: "<p>Meio-homem meio-máquina. <strong>Construto Vivo</strong> (recupera metade dos PVs via descanso normal), <strong>Cérebro Orgânico</strong> (afeta magia mental, −1 ponto no custo).</p>"
  },
  {
    name: "Golem", custo: 3, categoria: "Construto",
    efeito: "<p>Estátua mágica. Imunidades de construto + <strong>Armadura Extra contra todas as magias de dano</strong> + sucessos automáticos em testes de R contra magias. <strong>Camuflagem</strong> (Furtividade como perícia). <strong>Monstruoso</strong> quando revelado.</p>"
  },
  {
    name: "Mecha", custo: 0, categoria: "Construto",
    efeito: "<p>Robô japonês de manga/anime, peça pilotada. É na verdade um <strong>Aliado</strong> com esta vantagem única. <strong>Aptidão para Forma Alternativa</strong> (1 pt), <strong>Modelo Especial</strong>.</p>"
  },
  {
    name: "Meio-Golem", custo: 1, categoria: "Construto",
    efeito: "<p>Versão medieval mágica de ciborgue. <strong>Construto Vivo</strong> (cura metade com descanso), <strong>Cérebro Orgânico</strong>, <strong>Magia</strong> (Branca, Elemental ou Negra), <strong>Insano −1</strong> (a transformação é horrível).</p>"
  },
  {
    name: "Nanomorfo", custo: 3, categoria: "Construto",
    efeito: "<p>Construto de metal líquido (nanobots). <strong>Doppleganger</strong> (muda forma), <strong>Adaptador</strong>, <strong>Membros Elásticos</strong>, <strong>+2 em testes de H ligados a Crime e Máquinas</strong>, <strong>Regeneração</strong> (1 PV/turno), <strong>Aptidão para Separação</strong> (1 pt).</p>"
  },
  {
    name: "Robô Positrônico", custo: -2, categoria: "Construto",
    efeito: "<p>Robô humanoide programado com as Três Leis de Asimov. <strong>Código de Honra:</strong> 1ª Lei (não causar mal a humanos), 2ª Lei (obedecer humanos), 3ª Lei (proteger a si mesmo).</p>"
  },

  /* ========== MORTOS-VIVOS ========== */
  {
    name: "Esqueleto", custo: 0, categoria: "Morto-Vivo",
    efeito: "<p>Amontoado de ossos animado. Imunidades de morto-vivo. <strong>Invulnerabilidade: Frio</strong>, <strong>Armadura Extra: Corte/Perfuração</strong>, <strong>Devoção</strong> (ao invocador), <strong>Inculto</strong>, <strong>Monstruoso</strong>.</p>"
  },
  {
    name: "Fantasma", custo: 3, categoria: "Morto-Vivo",
    efeito: "<p>Espírito descarnado. <strong>Incorpóreo</strong> (imune a dano físico/energia, só ataca incorpóreos; PMs em vez de PVs contra mágica). <strong>Imortal</strong> (ressurge na tumba). <strong>Pânico</strong> (magia pelo custo normal). <strong>Aptidão Invisibilidade/Possessão</strong> (1 pt). <strong>Devoção</strong> (preso a uma missão).</p>"
  },
  {
    name: "Múmia", custo: 3, categoria: "Morto-Vivo",
    efeito: "<p>Cadáver preservado. Imunidades de morto-vivo + disfarce ilusório humano (dissipa com dano/combate). <strong>Armadura Extra</strong> (dano normal só de fogo/magia). <strong>Podridão de Múmia</strong> (vítima pode contrair doença −1 em todas caract.). <strong>Pânico</strong> pelo custo normal. <strong>Ambiente Especial</strong> (sarcófago).</p>"
  },
  {
    name: "Vampiro", custo: -1, categoria: "Morto-Vivo",
    efeito: "<p>Sanguessuga imortal. <strong>Dependência</strong> (sangue), <strong>Maldição</strong> (perde PV ao sol), <strong>Monstruoso</strong>, <strong>Fobia</strong> (alho, água benta, fogo, símbolos religiosos), <strong>Vulnerabilidade: Químico</strong> (água corrente). Compra à parte: Forma de Névoa, Formas Alternativas, Imortal, Invulnerabilidade (fogo/magia só), Magia Negra.</p>"
  },
  {
    name: "Zumbi", custo: -2, categoria: "Morto-Vivo",
    efeito: "<p>Morto-vivo deteriorado. <strong>Dependência</strong> (devora órgão humano/dia), <strong>Lentidão</strong> (H−2 iniciativa e esquivas; Aceleração não ajuda), <strong>Inculto</strong>, <strong>Monstruoso</strong>.</p>"
  }
];
