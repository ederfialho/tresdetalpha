/**
 * Dados-semente dos compêndios do 3D&T Alpha — Manual Core (Edição Revisada).
 *
 * São listas de objetos no formato `{ name, img, system: {...} }`, prontas pra
 * passar em `Item.createDocuments(...)` dentro de um compêndio de mundo.
 *
 * O hook em `seed-compendia.mjs` cria o compêndio na primeira vez que o mundo
 * abre e popula com estes dados.
 *
 * Fonte: Manual 3D&T Alpha, Jambô Editora, Marcelo Cassaro (2015).
 * As descrições abaixo são resumos mecânicos; GMs podem expandir livremente
 * os textos e adicionar novos itens via "Criar nova vantagem".
 */

const ICON_ADV = "icons/sundries/books/book-red-exclamation.webp";
const ICON_DIS = "icons/sundries/books/book-worn-brown-gray.webp";

const MODE = { MULTIPLY: 1, ADD: 2, DOWNGRADE: 3, UPGRADE: 4, OVERRIDE: 5 };
const FLAG_COMBAT = { "3det-foundry-rework": { combatOnly: true, activable: true } };

/**
 * Helpers pra criar ActiveEffects embutidos nos itens.
 * - `permanent`: aplicado sempre que o item está no actor.
 * - `combatAtivavel`: aplica bônus enquanto ativo; desativa sozinho no fim do combate.
 */
const effPermanent = (name, changes, img) => ({
  name, img: img ?? "icons/magic/holy/angel-wings-gray.webp",
  changes, transfer: true, disabled: false
});
const effCombat = (name, changes, img) => ({
  name, img: img ?? "icons/magic/movement/trail-streak-zigzag-yellow.webp",
  changes, transfer: true, disabled: true,
  flags: FLAG_COMBAT
});
const chg = (key, value, mode = MODE.ADD, priority = 20) => ({ key, mode, value: String(value), priority });

/* ============================================================
   VANTAGENS (Manual pp. 28–39)
   ============================================================ */
export const VANTAGENS = [
  {
    name: "Aceleração", custo: 1,
    categoria: "Movimento",
    custoPMs: "1 PM em combate (dura até fim do combate)",
    duracao: "Combate",
    efeito: "<p>Soma +1 à Habilidade em situações de perseguição, fuga e esquiva (não cumulativo com Teleporte). Recebe um movimento extra por turno: pode mover-se até 2× a velocidade máxima e agir, ou mover-se 3×. Continua fazendo até uma ação por turno.</p>",
    effects: [effCombat("Aceleração — H+1", [chg("system.abilities.habilidade.bonus", 1)])]
  },
  {
    name: "Adaptador", custo: 1,
    categoria: "Combate",
    efeito: "<p>Facilidade com armas e técnicas novas. Pode usar qualquer tipo de dano de sua Força ou Poder de Fogo sem redutor, mesmo que não seja seu próprio dano.</p>"
  },
  {
    name: "Aliado", custo: 1,
    categoria: "Social",
    efeito: "<p>Um companheiro NPC que o jogador controla (mas o mestre pode interferir). Sua pontuação é um 'nível' abaixo da sua. Aliados mais poderosos custam 1 ponto extra por ponto de personagem.</p>"
  },
  {
    name: "Alquimista", custo: 1,
    categoria: "Magia",
    custoPMs: "Metade dos PMs da magia original",
    duracao: "Uma rodada para traçar o diagrama",
    prerequisitos: "Magia Branca, Elemental ou Negra",
    efeito: "<p>Desenha diagramas arcanos que potencializam poderes. Antes de usar uma vantagem com PMs, desenhar um símbolo místico permite usá-la com metade do custo. Se sofrer dano enquanto traça, o diagrama falha. Cada diagrama é único por utilização.</p>"
  },
  {
    name: "Aparência Inofensiva", custo: 1,
    categoria: "Social",
    efeito: "<p>Não parece perigoso. Dá surpresa ao oponente — você ganha uma ação extra antes do primeiro turno de combate. Truque não funciona com quem já o viu lutar. Incompatível com Monstruoso.</p>"
  },
  {
    name: "Arcano", custo: 4,
    categoria: "Magia",
    prerequisitos: "Nenhum (inclui Magia Branca, Elemental e Negra)",
    efeito: "<p>Poderosa aptidão mágica. Pode utilizar Magia Branca, Magia Elemental e Magia Negra mais facilmente, como se tivesse comprado as três vantagens.</p>"
  },
  {
    name: "Área de Batalha", custo: 2,
    categoria: "Combate",
    custoPMs: "2 PMs para ativar + 2 PMs por turno de manutenção",
    duracao: "Até Habilidade turnos",
    efeito: "<p>Transporta a si e outras criaturas a uma dimensão onde leva vantagem. Três efeitos à escolha na ativação: (a) H+1, A+2 e Ataques Especiais sem PMs; (b) F ou PdF +2, A+2; (c) pode lançar magias com metade do custo em PMs. Impossível escapar exceto quando termina.</p>"
  },
  {
    name: "Arena", custo: 1,
    categoria: "Combate",
    duracao: "Apenas em combate, no terreno escolhido",
    efeito: "<p>Tem sua própria arena de lutas ou sabe lutar melhor em certo tipo de terreno. Ganha H+2 em combate em sua Arena. Sugestões: Água, Céu, Cidades, Ermos, Subterrâneo, um único lugar do mundo.</p>",
    effects: [effCombat("Arena — H+2 no terreno", [chg("system.abilities.habilidade.bonus", 2)])]
  },
  {
    name: "Armadura Extra", custo: 0,
    categoria: "Combate",
    prerequisitos: "Vantagem única ou item mágico (não se compra com pontos normais)",
    efeito: "<p>Armadura dobra contra um tipo específico de dano (Corte, Perfuração, Esmagamento, Fogo, Frio, Elétrico, Químico, Sônico, Magia). Benefícios são cumulativos se forem tipos diferentes.</p>"
  },
  {
    name: "Ataque Especial", custo: 1,
    categoria: "Combate",
    custoPMs: "1 PM por uso (+modificadores)",
    efeito: "<p>Uma manobra que aumenta em +2 a Força ou Poder de Fogo (escolha F ou PdF ao comprar). Ataque Especial 0 é gratuito com custo 1 PM. Níveis superiores: Ataque Especial I (1 pt, +2 à caract., 1 PM), II (+2 pts, +4 à caract., 2 PMs), III (+3 pts, +6, 3 PMs) e assim por diante. <br><strong>Modificadores:</strong> Amplo (+2 pts, +2 PMs, todos no alcance), Lento (−1 pt, alvo pode esquivar), Paralisante (+1 pt, +1 PM, vence Paralisia), Penetrante (+1 pt, +1 PM, impõe A−2 na FD do alvo), Perigoso (+1 pt, +1 PM, crítico com 5 ou 6 no dado), Perto da Morte (−2 pts, −1 PM, só quando Perto da Morte), Poderoso (+1 pt, +1 PM, triplica FA no crítico), Preciso (+1 pt, impõe H−2 na esquiva), Teleguiado (+1 pt, só PdF, persegue com H−2 na esquiva).</p>",
    effects: [
      effCombat("Ataque Especial — F+2 (corpo-a-corpo)", [chg("system.abilities.forca.bonus", 2)]),
      effCombat("Ataque Especial — PdF+2 (à distância)", [chg("system.abilities.poderDeFogo.bonus", 2)])
    ]
  },
  {
    name: "Ataque Múltiplo", custo: 1,
    categoria: "Combate",
    custoPMs: "1 PM por golpe adicional",
    efeito: "<p>Faz vários ataques com Força em uma rodada. Cada golpe (inclusive o primeiro) gasta 1 PM. Número máximo de ataques por rodada é igual à sua Habilidade. FA de cada golpe conta separadamente.</p>"
  },
  {
    name: "Boa Fama", custo: 1,
    categoria: "Social",
    efeito: "<p>É respeitado entre aventureiros e tem boa parte das pessoas comuns ao seu lado. Pode trazer vantagens sociais e também desvantagens (será difícil passar despercebido ou disfarçado).</p>"
  },
  {
    name: "Clericato", custo: 1,
    categoria: "Magia",
    prerequisitos: "Magia Branca ou Magia Negra para certos tipos de magia",
    efeito: "<p>Você é um sacerdote, druida ou xamã a serviço de uma entidade espiritual superior. Permite lançar magias que outros conjuradores não podem. Oferece três magias extras iniciais (cumulativas com Mentor e Patrono).</p>"
  },
  {
    name: "Deflexão", custo: 1,
    categoria: "Combate",
    custoPMs: "2 PMs por uso",
    duracao: "Uma esquiva",
    efeito: "<p>Desvia completamente um ataque feito com Poder de Fogo. Duplica a Habilidade para calcular a FD contra esse ataque. Conta como esquiva (limitada a H usos por rodada).</p>"
  },
  {
    name: "Elementalista", custo: 1,
    categoria: "Magia",
    custoPMs: "Metade dos PMs de magias do elemento escolhido",
    prerequisitos: "Magia Elemental",
    efeito: "<p>Escolha um tipo de Magia Elemental (água, ar, fogo, terra ou espírito). Gasta metade dos PMs (arredonde para cima) para lançar magias desse elemento. Pode ser comprada várias vezes, uma para cada elemento.</p>"
  },
  {
    name: "Energia Extra", custo: 1,
    categoria: "Recuperação",
    custoPMs: "2 PMs por uso",
    duracao: "Um turno inteiro (concentração, indefeso)",
    efeito: "<p>Recupera todos os Pontos de Vida. Por 1 pt só pode usar quando Perto da Morte; por 2 pts pode usar a qualquer momento. Se sofrer dano durante o turno, a concentração é perdida. Similar à magia de cura, mas só em si mesmo e não funciona contra outro mal (doenças, veneno).</p>"
  },
  {
    name: "Energia Vital", custo: 2,
    categoria: "Recuperação",
    efeito: "<p>Pode usar PVs no lugar de PMs para ativar magias e vantagens. 2 PVs valem 1 PM. Ainda recupera PVs e PMs normalmente e também pode usar seus PMs normais.</p>"
  },
  {
    name: "Familiar", custo: 1,
    categoria: "Magia",
    prerequisitos: "Magia Branca, Elemental ou Negra",
    efeito: "<p>Um pequeno animal mágico que compartilha habilidades suas. Mais fraco que um Parceiro mas evolui junto. Possui Ligação Natural. Exemplos: Camaleão (Invisibilidade), Corvo (Voo), Gato (Sentidos Especiais), Sapo (Paralisia).</p>"
  },
  {
    name: "Forma Alternativa", custo: 2,
    categoria: "Transformação",
    duracao: "Até mudar novamente (custa um movimento)",
    efeito: "<p>Muda de forma e poderes. Cada Forma Alternativa tem a mesma quantidade de pontos, mas outras características/vantagens/desvantagens. Mudar nunca aumenta PVs ou PMs atuais. PdM para Formas Alternativas: todas têm mesmo Código de Honra e Maldição se aplicáveis. Pode comprar várias.</p>"
  },
  {
    name: "Genialidade", custo: 1,
    categoria: "Perícia",
    efeito: "<p>Recebe H+2 ao utilizar qualquer perícia que possua e em qualquer teste de Habilidade envolvendo uma perícia que não possua. Com recursos necessários, permite feitos acima do nível técnico de seu mundo.</p>",
    effects: [effCombat("Genialidade — H+2 em perícia", [chg("system.abilities.habilidade.bonus", 2)])]
  },
  {
    name: "Imortal", custo: 1,
    categoria: "Recuperação",
    efeito: "<p>Nunca pode morrer de verdade. Por 1 pt: retorna da morte em alguns dias, semanas ou até meses. Por 2 pts: retorna logo após o combate. Vale lembrar que ainda pode sofrer destinos piores que a morte.</p>"
  },
  {
    name: "Inimigo", custo: 1,
    categoria: "Combate",
    efeito: "<p>É especialmente treinado em combater certo tipo de criatura (humanos, semi-humanos, humanoides, youkai, construtos). Recebe H+2 em combate e testes de perícias envolvendo criaturas desse tipo. Pode ser comprado várias vezes.</p>",
    effects: [effCombat("Inimigo — H+2 vs tipo escolhido", [chg("system.abilities.habilidade.bonus", 2)])]
  },
  {
    name: "Invisibilidade", custo: 2,
    categoria: "Combate",
    custoPMs: "1 PM por turno de manutenção",
    duracao: "Até gastar PM",
    efeito: "<p>Pode ficar invisível. Fora de combate, reduz dificuldade de testes furtivos. Em combate, oponente sofre H−1 para acertar com ataques corporais e H−3 contra ataques à distância. Audição Aguçada reduz parte desse benefício. Ver o Invisível ou Sentidos Especiais vencem totalmente.</p>"
  },
  {
    name: "Invulnerabilidade", custo: 0,
    categoria: "Defesa",
    prerequisitos: "Vantagem única ou item mágico (não se compra com pontos)",
    efeito: "<p>Praticamente imune a certo tipo de dano. Dano comparado à FD é dividido por 10 (dano inferior a 10 é anulado). Armadura também é dividida por 10 e dobrada contra esse tipo. Efeitos acumulam com Armadura Extra.</p>"
  },
  {
    name: "Ligação Natural", custo: 1,
    categoria: "Social",
    prerequisitos: "Aliado",
    efeito: "<p>Ligação especial com o Aliado. Dentro do mesmo campo visual, percebem pensamentos um do outro e podem se comunicar sem sinal aparente. Fora desse campo, sabem direção e distância. Comanda o Aliado para Manobras. Dano ferido ao Aliado você também sofre.</p>"
  },
  {
    name: "Magia Branca", custo: 2,
    categoria: "Magia",
    efeito: "<p>Conjurador de magia sagrada. Quase todas suas magias são curativas ou defensivas, algumas poucas ofensivas. Ver capítulo 'Magos e Magia' para a lista completa de magias.</p>"
  },
  {
    name: "Magia Elemental", custo: 2,
    categoria: "Magia",
    efeito: "<p>Conjurador de magia ligada à natureza e aos espíritos, representada pelos quatro elementos: terra, água, fogo e ar. Elementalismo espiritual afeta mente e alma.</p>"
  },
  {
    name: "Magia Irresistível", custo: 1,
    categoria: "Magia",
    efeito: "<p>É mais difícil resistir às suas vantagens e magias. <strong>1 pt:</strong> vítima sofre R−1 no teste. <strong>2 pts:</strong> R−2. <strong>3 pts:</strong> R−3.</p>"
  },
  {
    name: "Magia Negra", custo: 2,
    categoria: "Magia",
    efeito: "<p>Conjurador de magia negra, invocando necromancia e demonologia. Magias ligadas à morte, doença, veneno, deterioração, estagnação.</p>"
  },
  {
    name: "Membros Elásticos", custo: 1,
    categoria: "Combate",
    efeito: "<p>Braços, pernas ou tentáculos esticam muito. Pode violar o espaço-tempo para levar os braços a distâncias grandes (mesmo alcance do PdF). Ataque realizado com Membros Elásticos é sempre corpo-a-corpo baseado em F.</p>"
  },
  {
    name: "Membros Extras", custo: 1,
    categoria: "Combate",
    efeito: "<p>Braços, pernas, cauda ou tentáculos extras. Cada Membro Extra permite um ataque adicional por rodada (F+1d ou PdF+1d, sem somar Habilidade). Alternativamente, use como bloqueio para FD+1 na próxima rodada. Pode comprar várias vezes. Sofre efeitos de Monstruoso/Modelo Especial sem ganhar pontos.</p>"
  },
  {
    name: "Memória Expandida", custo: 2,
    categoria: "Perícia",
    efeito: "<p>Memória infalível. Lembra tudo dos cinco sentidos e jamais esquece. Ao ver alguém usar uma perícia, pode aprendê-la e usá-la como se tivesse. Pode ter mais de uma perícia simultânea (apagando a anterior). Não precisa fazer testes para aprender novas magias.</p>"
  },
  {
    name: "Mentor", custo: 1,
    categoria: "Social",
    efeito: "<p>Ainda tem contato com a pessoa que o ensinou a usar seus poderes. Mesmo distante, em momentos de dificuldade pode lembrar de algum ensinamento importante (manobra telepática). Para conjuradores, oferece três magias extras além das iniciais.</p>"
  },
  {
    name: "Paladino", custo: 1,
    categoria: "Magia",
    prerequisitos: "Magia Branca para certas magias divinas",
    efeito: "<p>Guerreiro sagrado. Recebe +1 em testes de Resistência (não aumenta PVs/PMs). Pode lançar Cura Mágica e Detectar o Mal pelo custo normal em PMs, mesmo sem vantagem mágica. Segue Códigos de Honra dos Heróis e Honestidade (sem ganhar pontos). Jamais pode adquirir Magia Negra.</p>",
    effects: [effPermanent("Paladino — R+1 em testes", [chg("system.abilities.resistencia.bonus", 1)])]
  },
  {
    name: "Paralisia", custo: 1,
    categoria: "Combate",
    custoPMs: "2 PMs ou mais",
    duracao: "Variável: 2 turnos para 2 PMs, +1 turno por PM extra",
    efeito: "<p>Poder de paralisar o alvo. Deve gastar ao menos 2 PMs e fazer um ataque normal. Caso FA vença FD, nenhum dano real — mas o alvo faz teste de Resistência. Se falhar, fica paralisado. Qualquer dano cancela a paralisia.</p>"
  },
  {
    name: "Parceiro", custo: 1,
    categoria: "Social",
    prerequisitos: "Sem Aliado (incompatível)",
    efeito: "<p>Colega de batalha de sincronia perfeita. Quando se unem, agem apenas uma vez por turno, mas combinam as características mais altas de cada um. Também compartilham vantagens. Parceiro deve ter esta vantagem também.</p>"
  },
  {
    name: "Patrono", custo: 1,
    categoria: "Social",
    custoPMs: "1 PM para invocar ajuda",
    efeito: "<p>Grande organização, empresa, governo ou NPC poderoso que ajuda. Pode fornecer transporte, equipamento, informação ou reforços. Precisa ser leal e seguir ordens, cumprir missões. Oferece três magias extras (cumulativas com Clericato e Mentor).</p>"
  },
  {
    name: "Poder Oculto", custo: 1,
    categoria: "Combate",
    custoPMs: "1 PM por +1 em característica (até +5), por turno de concentração",
    duracao: "Até o fim do combate",
    prerequisitos: "Somente em situações de perigo",
    efeito: "<p>Mais poderoso do que parece. Em emergências, pode aumentar qualquer característica em +1 por PM (máximo +5 em múltiplas, ou +10 em uma escolhida na criação). Ativar leva 1 turno por nível. Indefeso durante concentração. Dura até o fim do combate.</p>",
    effects: [effCombat("Poder Oculto — +1 caract. (editar alvo)", [chg("system.abilities.habilidade.bonus", 1)])]
  },
  {
    name: "Pontos de Magia Extras", custo: 1,
    categoria: "Recurso",
    efeito: "<p>Pontos de Magia adicionais, além dos oferecidos pela Resistência. Cada compra dá PMs equivalentes a R+2. Não afeta Resistência nem PVs, apenas os PMs. Pode comprar várias vezes.</p>"
  },
  {
    name: "Pontos de Vida Extras", custo: 1,
    categoria: "Recurso",
    efeito: "<p>Pontos de Vida adicionais, além dos da Resistência. Cada compra dá PVs equivalentes a R+2. Não afeta Resistência nem PMs, apenas os PVs. Pode comprar várias vezes.</p>"
  },
  {
    name: "Possessão", custo: 2,
    categoria: "Combate",
    custoPMs: "Igual à Resistência da vítima",
    prerequisitos: "Vítima descordada (dormindo ou inconsciente)",
    efeito: "<p>Possui o corpo de outro ser inteligente. Usa todas as características, PVs, perícias, conhecimentos e valores morais do hospedeiro. PMs, perícias, conhecimentos e códigos de honra próprios não são afetados — você ainda é você, só não a vítima. Resistência à magia da vítima custa 5 PMs.</p>"
  },
  {
    name: "Reflexão", custo: 2,
    categoria: "Defesa",
    custoPMs: "2 PMs (duplica H para FD contra um ataque)",
    duracao: "Uma esquiva",
    efeito: "<p>Como Deflexão, mas melhor — devolve o ataque ao atacante. Se conseguir deter completamente (FD igual ou superior à FA), devolve com a FA original. Conta como esquiva (limitada a H usos por rodada).</p>"
  },
  {
    name: "Regeneração", custo: 3,
    categoria: "Recuperação",
    efeito: "<p>Muito difícil de matar. Recupera 1 PV por turno. Testes de Morte têm resultados diferentes (1: Muito Fraco, mas já recupera 1 PV; 2-3: retorna à consciência em 1 minuto; 4-5: Quase Morto mas recupera 1 PV em 8 horas; 6: Morto volta em dias ou semanas). Pode sofrer colapso total com dano ≥ 10× PVs atuais.</p>"
  },
  {
    name: "Resistência à Magia", custo: 1,
    categoria: "Defesa",
    efeito: "<p>Muito resistente aos efeitos de qualquer vantagem ou magia (exceto dano direto). Recebe R+2 em testes para ignorar efeito (Cegueira, Paralisia, Silêncio, Pânico). Um resultado 6 ainda é falha. Não funciona contra veneno, doença ou ataques especiais de certas criaturas (sopro de dragão, olhar petrificante de medusa).</p>",
    effects: [effCombat("Resistência à Magia — R+2 contra magia", [chg("system.abilities.resistencia.bonus", 2)])]
  },
  {
    name: "Riqueza", custo: 2,
    categoria: "Social",
    custoPMs: "1 PM para invocar ajuda financeira",
    efeito: "<p>Como Patrono, mas melhor: não precisa seguir ordens. Dinheiro não é problema para pagar viagens, contratar equipes e comprar equipamento não-mágico. Nunca pode comprar nada que represente uma vantagem ou livrar-se de uma desvantagem.</p>"
  },
  {
    name: "Sentidos Especiais", custo: 1,
    categoria: "Perícia",
    efeito: "<p>Sentidos muito mais aguçados. Por 1 pt escolha três sentidos; por 2 pts: todos. Opções: <strong>Audição Aguçada</strong> (ouve sons baixos/distantes), <strong>Faro Aguçado</strong> (sensores químicos), <strong>Infravisão</strong> (calor), <strong>Radar</strong> (enxerga em total escuridão, mesmo de costas), <strong>Ver o Invisível</strong>, <strong>Visão Aguçada</strong> (enxerga mais longe), <strong>Visão de Raio X</strong>.</p>"
  },
  {
    name: "Separação", custo: 2,
    categoria: "Combate",
    custoPMs: "4 PMs para criar uma cópia",
    efeito: "<p>Em combate, invoca cópias exatas de si. Cópias compartilham características, vantagens, desvantagens, mas sofrem −1 em todas (cumulativo: 2 cópias = ambas em −2). Número máximo de cópias = Resistência. Cópias têm mesmos PVs/PMs que você no momento, mas não podem criar novas.</p>"
  },
  {
    name: "Telepatia", custo: 1,
    categoria: "Magia",
    custoPMs: "2 PMs por uso",
    duracao: "Uma utilização por turno",
    efeito: "<p>Não consome ação. Utilidades: <strong>Ler pensamentos</strong> (H+2 em Interrogatório, Intimidação, Lábia), <strong>Analisar poder de combate</strong>, <strong>Revelar tesouro</strong>, <strong>Prever movimentos</strong> (+1 em iniciativa e esquivas até fim do combate). Só funciona em criaturas vivas; não afeta alvo com Resistência superior à sua Habilidade.</p>"
  },
  {
    name: "Teleporte", custo: 2,
    categoria: "Movimento",
    custoPMs: "1 PM por uso",
    duracao: "Um movimento",
    efeito: "<p>Desaparece e reaparece em outro lugar. Distância máxima = Habilidade × 10 metros. Para lugares não à vista exige teste de Habilidade. Oferece +2 em esquivas (não cumulativo com Aceleração). Pode teleportar-se e agir na mesma rodada. Com Aceleração, duas vezes por rodada.</p>"
  },
  {
    name: "Tiro Carregável", custo: 1,
    categoria: "Combate",
    custoPMs: "2 PMs + um turno inteiro de concentração",
    prerequisitos: "Poder de Fogo",
    efeito: "<p>Concentra energia em um tiro mais poderoso. Durante o turno de concentração, considera-se indefeso. Perde concentração se sofrer dano. No turno seguinte, faz um ataque normal com PdF dobrado.</p>"
  },
  {
    name: "Tiro Múltiplo", custo: 2,
    categoria: "Combate",
    custoPMs: "1 PM por disparo",
    prerequisitos: "Poder de Fogo",
    efeito: "<p>Faz mais ataques com PdF em uma rodada. Cada disparo (incluindo o primeiro) consome 1 PM. Número máximo de ataques por rodada = Habilidade.</p>"
  },
  {
    name: "Torcida", custo: 1,
    categoria: "Social",
    duracao: "Enquanto houver torcida presente",
    efeito: "<p>Tem fãs que o inspiram. Grupo de admiradores acompanha e torce pelo seu sucesso. Quando uma torcida está vibrando a seu favor, ganha H+1 e impõe H−1 ao oponente (se falhar em Resistência). Benefícios só com torcida presente.</p>",
    effects: [effCombat("Torcida — H+1 com torcida presente", [chg("system.abilities.habilidade.bonus", 1)])]
  },
  {
    name: "Toque de Energia", custo: 1,
    categoria: "Combate",
    custoPMs: "1 PM por carga (máximo = Armadura)",
    efeito: "<p>Transmite carga energética pela própria pele: FA = Armadura + 1d para cada PM gasto. Ex: 3 PMs = FA = A + 3d. Habilidade não entra. Escolha um tipo de energia ao comprar (não trocável). Pode comprar várias vezes, uma para cada energia.</p>"
  },
  {
    name: "Voo", custo: 2,
    categoria: "Movimento",
    efeito: "<p>Capaz de voar. Velocidade depende da Habilidade: H1 levita + move a 10m/s; H2 10m/s; H3 voa a 40m/s; H4 80m/s; H5 160m/s. Pode dobrar velocidade gastando PM extra. Com penalidade em H, tenta voar mais alto (cada ponto acima da H = penalidade de -1 e 10m de queda em falha).</p>"
  },
  {
    name: "Xamã", custo: 1,
    categoria: "Magia",
    efeito: "<p>Forte ligação com o mundo dos espíritos. Pode interagir com fantasmas e criaturas incorpóreas, podendo atacá-las (e ser atacado) livremente. Também pode Ver o Invisível como se tivesse esse Sentido Especial.</p>"
  }
];

/* ============================================================
   DESVANTAGENS (Manual pp. 40–46)
   ============================================================ */
export const DESVANTAGENS = [
  {
    name: "Ambiente Especial", custo: 1,
    categoria: "Física",
    efeito: "<p>Dependente de ambiente de origem (água, clima ártico, etc.) que não existe onde a campanha acontece. Pode ficar dias igual à Resistência fora dele; depois começa a perder F e R por dia. Gasta 1 PE para recuperação instantânea no ambiente natural.</p>"
  },
  {
    name: "Assombrado", custo: 2,
    categoria: "Mental",
    efeito: "<p>Fantasma, aparição ou dever dedicado que atormenta. Em combate, mestre rola 1d; com 4, 5 ou 6 aparece e impõe −1 em todas as características até ele ir embora. Conjuradores gastam 2× os PMs para lançar magias. Pode significar doença ou mal-funcionamento.</p>"
  },
  {
    name: "Bateria", custo: 1,
    categoria: "Física",
    efeito: "<p>Reserva de energia: 2 horas por ponto de Resistência. Esgotado, perde 1 F e 1 R por hora. Se F e R chegam a 0, 'desliga' por 1d horas. Recarga possível com repouso absoluto.</p>"
  },
  {
    name: "Código de Honra", custo: 1,
    categoria: "Mental",
    efeito: "<p>Segue código rígido. Cada código vale −1 pt (até −4). Violar perde 1 PE no fim da aventura. Opções: <strong>1ª Lei de Asimov</strong> (não prejudicar humano), <strong>2ª Lei de Asimov</strong> (obedecer humanos), <strong>Código de Arena</strong> (não lutar em certos terrenos), <strong>Caçador</strong>, <strong>Cavalheiro</strong>, <strong>Combate</strong> (não atacar indefesos), <strong>Derrota</strong> (não se render), <strong>Gratidão</strong>, <strong>Heróis</strong>, <strong>Honestidade</strong>, <strong>Redenção</strong>.</p>"
  },
  {
    name: "Deficiência Física", custo: 1,
    categoria: "Física",
    efeito: "<p>Escolha: <strong>Audição Ruim</strong> (0 pts, H−1 para notar inimigos escondidos), <strong>Cego</strong> (−2 pts, H−1 corpo-a-corpo, H−3 à distância e esquivas), <strong>Mudo</strong> (−1 pt), <strong>Sem Faro</strong> (0 pts), <strong>Surdo</strong> (−1 pt), <strong>Visão Ruim</strong> (0 pts). Sentidos compensatórios reduzem penalidades.</p>"
  },
  {
    name: "Dependência", custo: 2,
    categoria: "Mental",
    efeito: "<p>Depende de coisa rara, proibida ou desumana (morte, crime). Não satisfaz diariamente: sofre −1 R cumulativo por dia. Se R chega a 0, morre a próximos dias. Mais apropriada para vilões NPCs.</p>"
  },
  {
    name: "Devoção", custo: 1,
    categoria: "Mental",
    efeito: "<p>Devotado a dever sagrado, missão, obsessão. Vida dedicada; quase nada importa além disso. Raramente se desvia. Sofre −1 em tudo quando envolvido em tarefa não ligada à Devoção. Devoção não pode ser usada em todas situações de combate.</p>"
  },
  {
    name: "Fetiche", custo: 1,
    categoria: "Física",
    prerequisitos: "Magia Branca, Elemental ou Negra",
    efeito: "<p>Não pode fazer mágica sem objeto especial (cajado, amuleto, instrumento, etc.). Se perder/quebrar, não pode usar magia até recuperar ou conseguir igual. Sempre que sofre dano, teste de H para não derrubar. Fetiche quebrado/improvisado duplica PMs gastos.</p>"
  },
  {
    name: "Fúria", custo: 1,
    categoria: "Mental",
    efeito: "<p>Quando sofre dano ou é irritado, teste de R. Falha = entra em frenesi de batalha e ataca imediatamente a fonte. Durante Fúria não pode esquivar, usar magia ou vantagens que usem PMs. Termina quando oponente é derrotado ou foge. Depois: −1 em todas as características por 1 hora.</p>"
  },
  {
    name: "Inculto", custo: 1,
    categoria: "Social",
    efeito: "<p>Não sabe ler, tem dificuldade de fazê-lo e se comunicar. Com Mentor, Patrono, Parceiro, Aliado ou Protegido Indefeso representado por vantagem, ele será capaz de interpretar você.</p>"
  },
  {
    name: "Insano", custo: 2,
    categoria: "Mental",
    efeito: "<p>Louco. Após 2 minutos de conversa, ninguém confia em você. Variantes: <strong>Cleptomaníaco</strong> (−1 pt), <strong>Compulsivo</strong> (−1 pt), <strong>Demente</strong> (−1 pt, igual Inculto), <strong>Depressivo</strong> (−2 pts, igual Assombrado), <strong>Dupla Personalidade</strong> (0 pts), <strong>Distraído</strong> (0 pts, −1 em tarefas desinteressantes), <strong>Fantasia</strong> (−1 pt), <strong>Fobia</strong> (−1 a −3 pts), <strong>Fúria</strong> (−1 pt), <strong>Histérico</strong> (−2 pts, como Assombrado), <strong>Homicida</strong> (−2 pts), <strong>Megalomaníaco</strong> (−1 pt), <strong>Mentiroso</strong> (−1 pt), <strong>Obsessivo</strong> (−1 pt, igual Devoção), <strong>Paranoico</strong> (−1 pt), <strong>Sonâmbulo</strong> (0 pts), <strong>Suicida</strong> (0 pts).</p>"
  },
  {
    name: "Interferência", custo: 0,
    categoria: "Física",
    efeito: "<p>Emite continuamente campo de interferência que prejudica aparelhos. Mensagens de rádio não são enviadas nem recebidas (10m por ponto de PV). Adaptador, Memória Expandida e Sentidos Especiais não funcionam dentro da área. Às vezes pode ser usada como vantagem (funciona contra inimigos também).</p>"
  },
  {
    name: "Interferência Mágica", custo: 0,
    categoria: "Física",
    efeito: "<p>Aura de 'antimágica' que dificulta uso de magia nas proximidades. Magia lançada a até 10m: mestre rola 1d secretamente; 1 ou 2 = magia falha, mas gasta PMs normalmente. Conjuradores sentem mal-estar. Conjurador pode gastar 1 PM extra para ignorar chance de falha.</p>"
  },
  {
    name: "Má Fama", custo: 1,
    categoria: "Social",
    efeito: "<p>Infame — fracasso em missão importante, ou ex-criminoso tentando se regenerar, ou membro de raça detestada. Sempre sob suspeita. Difícil fazer amizades. Se algum crime for constatado, será acusado e perseguido mesmo inocente.</p>"
  },
  {
    name: "Maldição", custo: 1,
    categoria: "Mental",
    efeito: "<p>Vítima de maldição que perturba a vida. <strong>Suave (−1 pt):</strong> irritante/constrangedora, nunca penaliza. <strong>Grave (−2 pts):</strong> coloca vida em risco. Pode ser removida com magia Cura de Maldição (exige grande serviço ou dinheiro).</p>"
  },
  {
    name: "Modelo Especial", custo: 1,
    categoria: "Física",
    efeito: "<p>Corpo diferente: muito maior/menor, com membros nos lugares errados, etc. Não pode usar armas, roupas, equipamentos ou veículos humanoides — apenas específicos. O inverso também é válido.</p>"
  },
  {
    name: "Monstruoso", custo: 1,
    categoria: "Física",
    efeito: "<p>Aparência repulsiva e assustadora. Não pode sair pelas ruas como gente normal; pessoas assustadas ou furiosas. Disfarçável com roupas não vale. Incompatível com Aparência Inofensiva.</p>"
  },
  {
    name: "Munição Limitada", custo: 1,
    categoria: "Combate",
    prerequisitos: "Poder de Fogo",
    efeito: "<p>Munição limitada: 3× PdF tiros (com PdF4, 12 tiros). Esgotada, precisa comprar/fabricar mais. Em cenários primitivos, ganha pontos automaticamente sem a desvantagem.</p>"
  },
  {
    name: "Poder Vergonhoso", custo: 1,
    categoria: "Magia",
    efeito: "<p>Magia/vantagem com PMs sempre vem acompanhada de efeito embaraçoso. Opções: <strong>Agradável</strong> (−1 pt, efeitos visuais/sonoros charmosos dão +1 esquiva nos alvos), <strong>Constrangedor</strong> (−1 pt, ritos envergonhantes dão F−1 nos ataques), <strong>Exagerado</strong> (−1 pt, gestos elaborados permitem R+1 em resistência e esquivas), <strong>Hentai</strong> (0 pts, deixa alvo nu por um instante).</p>"
  }
];

/* ============================================================
   VANTAGENS ÚNICAS / PERÍCIAS — placeholders
   ============================================================ */
export const VANTAGENS_UNICAS = [
  // Conteúdo das páginas 47–61 do core a ser expandido em follow-up.
  // Exemplos típicos: Elfo (H+1), Anão (R+1), Humano (pontos extras),
  // Hobbit (Aparência Inofensiva + Furtividade), Orc (F+1), etc.
];

export const PERICIAS = [
  // Conteúdo das páginas 62-66 do core a ser expandido em follow-up.
  // Grupos: Máquinas, Manipulação, Medicina, Sobrevivência.
];
