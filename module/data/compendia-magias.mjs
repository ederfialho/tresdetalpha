/**
 * Lista completa de magias do Manual Core 3D&T Alpha (pp. 78-115).
 *
 * Cada magia é criada como Item do tipo `magia`, com os campos:
 *   escola, custo (PMs), alcance, duracao, exigencias, description
 *
 * Descrições foram condensadas; o GM pode expandir com textos completos.
 */

/** Helper pra escrever magias de forma compacta. */
const m = (name, escola, custo, alcance, duracao, efeito, exigencias = "", template = null) => ({
  name, escola, custo, alcance, duracao, efeito, exigencias, template
});

/** Helpers pros tipos de template mais comuns. */
const circle = (distance) => ({ type: "circle", distance });
const cone   = (distance, angle = 90) => ({ type: "cone", distance, angle });
const ray    = (distance, width = 1.5) => ({ type: "ray", distance, width });
const rect   = (distance) => ({ type: "rect", distance });

export const MAGIAS = [
  /* ================ A ================ */
  m("Acordar", "Elemental (espírito)", "1 PM (ou 5 PMs para Coma)", "longo", "instantânea",
    "<p>Desperta criaturas adormecidas, incluindo vítimas de Sono (1 PM/criatura) ou Coma (5 PMs).</p>"),

  m("Ao Alcance da Mão", "Elemental (água ou terra) ou Negra", "2 PMs", "pessoal", "sustentável",
    "<p>Reproduz o efeito de Membros Elásticos — projeta mãos mágicas de água, pedra ou sombra pra alcançar alvos distantes em combate corpo-a-corpo.</p>"),

  m("O Amor Incontestável de Raviollius", "Branca ou Elemental (espírito)", "2 PMs", "longo", "sustentável",
    "<p>A vítima se apaixona pela primeira pessoa que ver após a magia. Não pode atacá-la nem permitir que seja atacada (como se tivesse Código de Honra). Sofrer qualquer ataque cancela a magia.</p>"),

  m("Anfíbio", "Elemental (ar ou água)", "1 PM por criatura", "curto", "sustentável",
    "<p>Permite se mover e respirar livremente na água (doce ou salgada). Velocidade normal de natação.</p>"),

  m("A Aporrinhação de Nimb", "Elemental (ar)", "1 PM por turno", "curto", "sustentável",
    "<p>Enxame de criaturas ou objetos que o alvo odeia, atacando com FA=1d. Eficiente distração.</p>"),

  m("O Apavorante Gás de Luigi", "Elemental (ar)", "1 PM por criatura", "curto", "1d minutos",
    "<p>Alvo tem R para resistir. Se falhar, emite flatulência sonora por minutos. Só constrangimento, sem dano.</p>"),

  m("Arma de Allihanna", "Elemental (água ou terra)", "2 a 10 PMs", "pessoal", "sustentável",
    "<p>Brotar uma arma mágica do solo (espada, arco, lança...). Adiciona +1 à FA/FD para cada 2 PMs gastos, até FA+5.</p>"),

  m("Armadura de Allihanna", "Elemental (água ou terra)", "2 a 10 PMs", "pessoal", "sustentável",
    "<p>Armadura natural de madeira e cipó. FD+1 para cada 2 PMs gastos, até FD+5. Difícil de ser invocada em terrenos estéreis (custo 2x).</p>"),

  m("Armadura Elétrica", "Elemental (ar)", "2 a 10 PMs por turno", "pessoal", "sustentável",
    "<p>Carga elétrica que dá dano. 2 PMs atacam com FA=A+1d; 8 PMs com FA=A+4d. Ataca todas criaturas em corpo-a-corpo automaticamente.</p>"),

  m("Armadura Extra", "todas", "1 a 3 PMs por turno", "curto", "sustentável",
    "<p>Reproduz o efeito da vantagem Armadura Extra. Cada tipo é uma magia diferente: Corte/Perfuração/Esmagamento (1 PM), Fogo/Frio/Elétrico/Químico/Sônico (2 PMs), Magia/Força/PdF (3 PMs).</p>"),

  m("Armadura Espiritual", "Elemental (espírito)", "5 PMs", "pessoal", "sustentável",
    "<p>Protege a mente contra efeitos espirituais, Magia Elemental (espírito), Telepatia. Não afeta ataques não-mentais.</p>"),

  m("Arpão", "Negra", "15 PMs", "longo", "instantânea",
    "<p>Onda de choque em forma de arpão. Supersônico, ataca com FA=H+6d. Devastador.</p>"),

  m("Asfixia", "Elemental (ar) ou Negra", "2 PMs", "curto", "sustentável",
    "<p>Vítima faz teste de R; se falhar, não consegue mais respirar. Pode prender respiração Rx5 minutos normal/1 turno em combate. Depois, perde 1 PV por turno até morrer.</p>"),

  m("Ataque Mágico*", "todas", "1 a 5 PMs", "longo", "instantânea",
    "<p>Magia básica de dano. FA=H+1d+Armadura. Até 5 alvos (1 PM por alvo extra). Conhecida por todos os magos iniciantes.</p>"),

  m("Ataque Vibratório", "Elemental (ar)", "10 PMs", "curto", "instantânea",
    "<p>Vibrações destroem através do alvo. FA=H+5d. Pequeno terremoto concentrado, ótimo pra abrir buracos em tetos e paredes.</p>"),

  m("Ataque Vorpal", "Branca ou Elemental (ar)", "1 PM por turno", "curto", "sustentável",
    "<p>Sempre que o alvo consegue um acerto crítico e vence a FD, a vítima tem que fazer um teste de Armadura: se falhar, terá a cabeça cortada (decapitação instantânea).</p>"),

  m("Aumento de Dano", "todas", "1 a 5 PMs por turno", "curto", "sustentável",
    "<p>Aumenta a F de uma arma existente em 1d por PM gasto, até máximo de 5 PMs. Dano passa a ser mágico.</p>"),

  /* ================ B ================ */
  m("Barreira Mística", "Branca", "1 a 5 PMs por turno", "pessoal", "sustentável",
    "<p>Escudo mágico em forma de escudo. Dá A+3 para cada PM gasto. Funciona apenas contra ataques gerados por magia.</p>"),

  m("Barreira de Vento", "Elemental (ar)", "5+ PMs por alvo/turno", "curto", "sustentável",
    "<p>Barreira de vento que oferece FD +10. Desvia projéteis. +5 PMs pra cada criatura afetada além do mago.</p>"),

  m("Bola de Fogo", "Elemental (fogo)", "1 a 10 PMs", "longo", "instantânea",
    "<p>Bola de fogo. FA=H+1d+PMs. Atinge tudo num raio de 5m do alvo. Pode provocar incêndios.</p>", "", circle(5)),

  m("Bola de Lama", "Elemental (terra)", "1 PM", "curto", "instantânea",
    "<p>Bolas de matéria barrenta malcheirosa com FA=1d, ignora Armadura. Vítima fica suja e fedorenta por 1 hora (Monstruosa). Até H bolas por lançamento.</p>"),

  m("Bola de Vento", "Elemental (ar)", "8 PMs", "longo", "instantânea",
    "<p>FA=H+4d. Vítimas até 6m fazem teste de F; se falhar, arremessadas longe e sofrem 1d de dano.</p>"),

  m("Bolas Explosivas", "Elemental (fogo)", "1 PM", "curto", "instantânea",
    "<p>Bolas de luz que explodem espalhando chamas. FA=1d+2. Dano pequeno mas visual impressionante.</p>"),

  m("Bomba Aérea", "Elemental (ar)", "1 a 10 PMs", "longo", "instantânea",
    "<p>Bola de ar que explode no local. Permite ataque com FA=H+1d+PMs. Principal uso: proteção contra flechas e magias (FD=A+1d+PMs no próximo turno).</p>", "", circle(3)),

  m("Bomba de Luz", "Elemental (fogo)", "1 a 5 PMs", "longo", "instantânea",
    "<p>Explosão de luz que ataca todas criaturas num raio de 3m com FA=H+PMs. Não afeta objetos (perfeita pra abater inimigos sem destruir pertences).</p>", "", circle(3)),

  m("Bomba de Terra", "Elemental (terra)", "10 PMs", "longo", "instantânea",
    "<p>Trecho de rocha/terra explode com FA=H+15. Só em solo natural.</p>", "", circle(5)),

  m("Bomba de Vento", "Elemental (ar)", "1 a 10 PMs", "longo", "instantânea",
    "<p>Vento empurra com F=PMs gastos. Criaturas em 50m testam F; arremessadas a metros proporcionais. Sofrem 1d de dano.</p>", "", cone(50, 60)),

  m("Brilho de Espírito", "Elemental (espírito)", "10 PMs", "longo", "instantânea",
    "<p>Raio de luz azul. FA=H+3d. Além de PVs, vítima perde a mesma quantidade em PMs.</p>"),

  m("Brilho Explosivo", "Elemental (fogo)", "25 PMs", "longo", "instantânea",
    "<p>Bola de luz em chamas azuis/brancas. FA=10d, ignora qualquer Armadura.</p>", "", circle(5)),

  m("Buraco Negro", "Negra", "60 PMs", "veja abaixo", "3 turnos",
    "<p>Vácuo poderoso que puxa tudo em 90m (teste F com penalidade). Falha = sugados pra sempre. Dura 3 turnos. Terrível e rara.</p>",
    "Clericato"),

  /* ================ C ================ */
  m("Cajado em Cobra", "Elemental (terra) ou Negra", "2 PMs", "curto", "sustentável",
    "<p>Transforma objeto de madeira (cajado, vara) em cobra venenosa controlada. Se acertar, vítima faz teste de R ou é envenenada (−1 em tudo, perde 1 PV/turno).</p>"),

  m("Cancelamento de Magia*", "todas", "2x o custo original", "curto", "permanente",
    "<p>Dissipa magia de outro mago. Para lançar é preciso gastar o dobro do custo em PMs. Mesma escola requerida (Magia Negra cancela qualquer outra escola).</p>"),

  m("Cancelamento Superior", "Branca", "custo original", "curto", "permanente",
    "<p>Versão mais eficaz de Cancelamento — Magia Branca dispersa qualquer magia pagando apenas o custo original.</p>"),

  m("O Canto da Sereia", "Elemental (espírito)", "2 PMs por criatura", "longo", "sustentável",
    "<p>Domina mentalmente vítimas em 50m vendo/ouvindo. R+1 pra negar. Aceita sugestões razoáveis. Não pode violar Códigos de Honra, causar dano próprio, etc.</p>"),

  m("Cegueira", "Branca ou Negra", "3 PMs", "longo", "permanente",
    "<p>Ofusca ou obscurece a visão do alvo. R para resistir. Cego sofre H−1 em ataques corpo-a-corpo, H−3 à distância e esquivas.</p>"),

  m("Chuva Congelante", "Elemental (água)", "10+ PMs", "pessoal", "permanente",
    "<p>Esfera de gelo acima do mago solta pedras de gelo. Ataca tudo com FA=3d. Cancelável com magia de fogo (mín. 10 PMs).</p>", "", circle(5)),

  m("Chuva Quente", "Elemental (água e fogo)", "0", "pessoal", "sustentável",
    "<p>Chuva de água quente num aposento. Apenas conforto e higiene — ótima pra banho. Não serve pra matar sede nem apagar chamas.</p>"),

  m("Coma", "Elemental (espírito) e Negra", "20 PMs", "toque", "permanente até cancelada",
    "<p>Teste de R−1. Falha = PVs reduzidos a zero e vítima tomba inconsciente. Não envelhece nem sofre maldições. Só Acordar, Cancelamento ou Desejo interrompem.</p>"),

  m("Comando de Khalmyr", "Elemental (espírito)", "4 PMs", "curto", "instantânea",
    "<p>Palavra de comando. Teste de R−1 pra evitar. 5 comandos possíveis: Venha, Solte, Caia, Fuja, Pare. Cada um com efeito dramático por 1 turno.</p>"),

  m("Consertar", "Elemental (terra)", "1 PM ou mais", "toque", "instantânea",
    "<p>Repara objetos (não desentorta). Cerâmica, madeira, metal. Também restaura construtos: 1 PV por PM.</p>"),

  m("Contra-Ataque Mental", "Elemental (espírito)", "10 PMs", "pessoal", "sustentável",
    "<p>Versão poderosa de Armadura Espiritual. Bloqueia ataques telepáticos E contra-ataca. Alvo testa R; falha = dano H+1d ignorando Armadura. Se PVs a zero, entra em Coma.</p>"),

  m("Controle de Mortos-Vivos", "Negra", "2 PMs por morto-vivo", "longo", "permanente até cancelada",
    "<p>Controla total mortos-vivos que falharem em R. Podem atacar, proteger. Resistência ≥ H do mago = imune. Druidas/paladinos e Código dos Heróis proibidos.</p>"),

  m("Corpo Elemental", "Elemental (todas)", "20+ PMs/hora", "pessoal", "sustentável",
    "<p>Transforma em elemento. Invulnerabilidade contra ataques do elemento. Cada escola gera forma diferente (água, ar, fogo, terra, espírito).</p>"),

  m("O Crânio Voador de Vladislav", "Negra", "3 PMs", "longo", "instantânea",
    "<p>Dispara pelas mãos um crânio humano flamejante em magia negra. FA=H+2d, ignora Armadura (exceto Armadura Extra contra Magia).</p>"),

  m("Criar Pântano", "Elemental (água ou terra) ou Negra", "1 PM por área", "longo", "permanente",
    "<p>Transforma área de 1m (por PM) em pântano. Penalidade F−1 e H−1 corpo-a-corpo e esquivas. Ótimo contra combatentes corpo-a-corpo.</p>"),

  m("Criar Vento", "Elemental (ar)", "1 a 5 PMs por turno", "longo", "sustentável",
    "<p>Vento forte impede criatura de se aproximar. FD=PMs gastos contra ataques dessa mesma criatura.</p>"),

  m("Criação de Mortos-Vivos", "Negra", "1 a 5 PMs", "longo", "sustentável",
    "<p>Variante necromântica de Criatura Mágica. Lança sobre cadáver; ele não volta à vida mas se levanta e obedece. Código dos Heróis proíbe.</p>"),

  m("Criatura Mágica", "todas", "1 a 5 PMs", "longo", "sustentável",
    "<p>Cria criatura mágica — diabretes de fogo, pássaros de luz, estátuas... Qualquer coisa. 4 PMs = 4 pts pra distribuir em características (até 5). 0 pt OK.</p>"),

  m("Criatura Mágica Superior", "todas", "2 a 10 PMs", "longo", "sustentável",
    "<p>Versão melhorada: cada 2 PMs valem 3 pts pra características (5 é máximo). 10 PMs = 15 pts.</p>"),

  m("Criatura Mágica Suprema", "todas", "1 a 10 PMs", "longo", "sustentável",
    "<p>Ainda mais eficiente: cada PM vale 2 pts pra características. 10 PMs = 20 pts (máximo 5 por caract.).</p>"),

  m("Cura Mágica", "Branca", "2 PMs por 1d PVs", "toque", "instantânea",
    "<p>Cura divina. Cada 2 PMs gastos restauram 1d PVs. 4 PMs = cura doenças, venenos, cegueira ou paralisia (não cura PVs). Contra mortos-vivos: causa dano em vez de curar.</p>",
    "Clericato"),

  m("Cura Mágica Superior", "Branca", "1 PM por cada 1d PVs", "toque", "instantânea",
    "<p>Melhor que Cura Mágica comum. Cada 1 PM gasto restaura 1d PVs.</p>",
    "Clericato, Código de Honra (1ª Lei de Asimov, Honestidade ou Heróis)"),

  m("Cura de Maldição", "Branca", "10+ PMs", "toque", "instantânea",
    "<p>Cura aflições imunes a outras formas (licantropia, petrificação, envelhecimento, maldições). Exceto morte. Gravidade: 20 PMs (−0), 40 PMs (−1), 60 PMs (−2), 80 PMs (−3).</p>",
    "Clericato, Código de Honra (1ª Lei, Honestidade ou Heróis)"),

  m("Cura Para o Mal", "Branca", "4 PMs", "toque", "instantânea",
    "<p>Elimina o mal no coração. Criatura torna-se aliada, pelo menos deixa de ser inimiga. Cancela Canto da Sereia, Marionete, etc. Afeta apenas indefesos. Resistência>H = imune.</p>"),

  m("Cura para os Mortos", "Negra", "2 PMs por 1d PVs", "toque", "instantânea",
    "<p>Restaura PVs em mortos-vivos, já que magias convencionais não funcionam. Versão Superior (1 PM cura 1d PVs) também existe.</p>"),

  m("Cura Total", "Branca", "10 ou 20 PMs", "toque", "instantânea",
    "<p>10 PMs: restaura TODOS os PVs. 20 PMs: também cura doenças/venenos/cegueira/paralisia (não restaura PVs). Usada contra mortos-vivos exige R+2 ou destrói totalmente.</p>",
    "Clericato, Código de Honra"),

  /* ================ D ================ */
  m("Dardos da Agonia", "Elemental (água)", "5 PMs", "curto", "instantânea",
    "<p>Dardos de gelo diminutos. FA=H+1d. Sem dano real, vítima sente frio e sofre −1 em R até fim do combate.</p>"),

  m("Desejo", "Branca, Elemental e Negra (todas)", "5 PMs permanentes", "ilimitado", "permanente",
    "<p>A mais poderosa magia. Faz quase qualquer coisa: ressuscitar, cancelar maldição, aumentar característica até 5 (3 Desejos pra 6), imitar qualquer magia, ganhar vantagem de 1 pt, eliminar desvantagem até −1. Nunca: desafiar deuses, matar, pedir mais Desejos.</p>",
    "Arcano ou Clericato"),

  m("Desmaio", "Branca, Elemental (espírito) ou Negra", "2+ PMs por criatura", "longo", "1 minuto",
    "<p>R+1 pra resistir. Vítima inconsciente 1 minuto (ou cancela). Desperta automaticamente se sofrer dano. Mortos-vivos, construtos e não-vivos imunes.</p>"),

  m("Destrancar", "Branca", "1 PM", "toque", "instantânea",
    "<p>Abre qualquer fechadura, trancada ou mágica. Mesmo Trancar.</p>"),

  m("Destruição do Espírito", "Elemental (espírito)", "40 PMs", "curto", "instantânea",
    "<p>A mais poderosa e terrível magia espiritual. Vítima morre e sua alma é destruída — não pode ressuscitar, exceto por Desejo. R−3 pra evitar.</p>"),

  m("Desvio de Disparos", "Branca ou Elemental (ar)", "1 a 5 PMs", "pessoal", "sustentável",
    "<p>Enquanto ativa, ataques com PdF contra você têm FA reduzida em −1 por PM gasto. Apenas ataques mundanos; não afeta mágica.</p>"),

  m("Detecção de Magia*", "todas", "1 PM", "longo", "sustentável",
    "<p>Vê brilho luminoso suave emitido por objetos/criaturas/lugares sob efeito mágico. Não detecta natureza de seres sobrenaturais (mortos-vivos, magos, dragões).</p>"),

  m("Detecção do Mal", "Branca", "1 PM ou 5 PMs", "pessoal", "sustentável",
    "<p>Detecta presença de mal (criaturas inteligentes com intenção maligna). 1º turno: presença. 2º: quantidade/intensidade. 3º: localização. Detecta itens amaldiçoados por 5 PMs.</p>"),

  m("Dominação Total", "Branca, Elemental e Negra (todas)", "40 PMs", "curto", "permanente até cancelada",
    "<p>A mais poderosa magia de controle mental. Vítima faz R−3. Falha = escrava total. Não desobedece nem pra sacrificar própria vida. Ignora Devoções, Códigos, etc.</p>"),

  /* ================ E ================ */
  m("Encontro Aleatório", "Negra", "4 PMs", "10km", "instantânea",
    "<p>Conjura criaturas agressivas locais. Surgem em 1d turnos e atacam. Pra atrair caça ou distrair inimigos.</p>"),

  m("Enfraquecer Magia", "Branca", "10 PMs", "pessoal", "sustentável",
    "<p>Círculo de 10m radial. Lançar qualquer magia dentro (exceto Branca) requer o dobro de PMs.</p>"),

  m("Enxame de Trovões", "Branca ou Elemental (ar)", "4 PMs", "longo", "instantânea",
    "<p>Pequenas lâminas luminosas giratórias. FA=H+2d, ignora Armadura (a menos que Armadura Extra Magia).</p>"),

  m("A Erupção de Aleph", "Elemental (fogo ou terra)", "5 PMs", "longo", "instantânea",
    "<p>Abre buraco no chão sob oponente com jato de lava. FA=H+2d, ignora Armadura (exceto Armadura Extra Fogo ou Magia).</p>"),

  m("A Escapatória de Valkaria", "Branca ou Negra", "1 PM por 4 criaturas", "curto", "instantânea",
    "<p>Dentro de masmorra/ruína, transporta mago e aliados pra entrada. Não usa em locais não visitados. Afeta apenas voluntários.</p>"),

  m("Esconjuro de Mortos-Vivos", "Branca ou Elemental (espírito)", "1 PM por morto-vivo", "longo", "permanente",
    "<p>Clérigos expulsam esqueletos, zumbis, múmias. Falhar = criatura foge nunca mais volta. Resistência > H = imune.</p>",
    "Clericato"),

  m("Escuridão", "Negra", "2 PMs", "curto", "permanente até cancelada",
    "<p>Objeto tocado irradia escuridão em 6m de raio. Criaturas com Visão Aguçada, Infravisão, Ver o Invisível e Raio X enxergam normalmente. Luzes normais não funcionam.</p>", "", circle(6)),

  m("Explosão", "Elemental (todas) ou Negra", "2 PMs por 1d de dano", "longo", "instantânea",
    "<p>Ataque devastador. Explode no ponto de impacto em grande bola de fogo/água/rocha/trevas. FA=H+1d por 2 PMs (máximo 10 PMs=H+5d). Dano reduz em 1d a cada 3m do impacto.</p>", "", circle(5)),

  /* ================ F ================ */
  m("Fada Servil", "Branca ou Elemental (espírito)", "1 PM", "longo", "sustentável",
    "<p>Conjura fada feita de luz esverdeada. Tarefas rotineiras: apanhar lenha, pescar, alimentar cavalo. Não pode lutar nem resistir a dano.</p>"),

  m("Farejar Tesouro", "Branca ou Elemental (espírito)", "1 PM", "veja abaixo", "instantânea",
    "<p>Detecta existência de tesouro escondido (ouro, pedras preciosas, itens valiosos) na área (masmorra, cidade). Não indica localização — apenas presença.</p>"),

  m("Fascinação", "Branca ou Elemental (espírito)", "10 PMs", "toque", "permanente até cancelada",
    "<p>Lançada sobre peça artística. Observador faz R+1; falha = totalmente encantado, não tira os olhos do objeto. Dura dias (sem comer/beber/dormir), até morrer de inanição.</p>"),

  m("Feras de Tenebra", "Negra", "2 PMs por turno", "longo", "sustentável",
    "<p>Convoca 1d feras negras da Deusa das Trevas. F2, H2, R1, A1, PdF0. Causam dano aos PMs em vez dos PVs. Só feridas por magias Branca/Elemental espírito/Negra.</p>"),

  m("Ferrões Venenosos", "Elemental (água) ou Negra", "3 PMs", "curto", "instantânea",
    "<p>Chuva de dardos pelos dedos. FA=H+2d. R−1 pra evitar envenenamento. Vítima envenenada: −1 em tudo, perde 1 PV/turno até morrer ou ser curada.</p>"),

  m("Fios de Gelo", "Elemental (água)", "10 PMs", "curto", "instantânea",
    "<p>Ao tocar superfície, fios de gelo em 10m. Todos em contato testam R. Falha = estátua de gelo por 1d horas.</p>", "", circle(10)),

  m("Flecha de Vento", "Elemental (ar)", "0", "curto", "instantânea",
    "<p>Magia simples. Flecha de vento com FA=2. Fraca — só pra demonstrar hostilidade ou romper objetos similares.</p>"),

  m("A Flor Perene de Milady \"A\"", "Branca ou Elemental (água)", "0", "curto", "permanente até cancelada",
    "<p>Flor indefinível nasce no local, impossível remover por meios normais. Vítima recebe R para negar; falha = florzinha nasce em parte do corpo. Só Cancelamento de Magia remove.</p>"),

  m("Fome de Megalokk", "Negra", "15 PMs", "curto", "instantânea",
    "<p>Dispara 1d cargas de energia em formato de insetos. Criaturas/objetos tocados são desintegrados. Cada carga: FA=3d, ignora Armadura.</p>"),

  m("Força Mágica*", "todas", "2 a 10 PMs", "curto", "sustentável",
    "<p>Braço de pedra, tentáculo de trevas... Força = metade dos PMs (limite 16 PMs = F8 pra levantar 2.000 quilos). Ataque tem FA=F+H0+1d.</p>"),

  m("Fúria de Beluhga", "Elemental (água)", "30 PMs", "longo", "instantânea",
    "<p>Mais poderosa e brutal magia de gelo. Bola gigante explode com FA=10d. Criaturas reduzidas a 0 PVs morrem instantaneamente (sem Teste de Morte).</p>", "", circle(10)),

  m("Fúria Guerreira", "Elemental (espírito)", "2 PMs", "curto", "sustentável",
    "<p>Desperta fúria em pessoa afetada. Luta melhor (H+1, F+1, PdF+1) mas não pensa claramente, ataca primeiro inimigo visível. Não esquiva, não usa magia.</p>"),

  m("A Furtividade de Hyninn", "Branca ou Negra", "1 PM", "toque", "sustentável",
    "<p>H+2 em testes de Furtividade. Sem a especialização Furtividade, pode fazer testes de Tarefas Difíceis.</p>"),

  /* ================ G ================ */
  m("A Gagueira de Raviollius", "Branca ou Elemental (água ou ar)", "2 PMs", "curto", "sustentável",
    "<p>Alvo testa R. Falha = gagueira terrível. Impede Manipulação. Lançar magias também fica difícil (teste H pra não falhar).</p>"),

  m("Garras de Atavus", "Elemental (água ou terra)", "5 PMs", "curto", "sustentável",
    "<p>Garras crescem nas mãos. Alvo recebe F+2 e causa dano por corte.</p>"),

  /* ================ I ================ */
  m("Ilusão", "todas", "1+ PMs", "longo", "sustentável",
    "<p>Imagens falsas baseadas em coisas que o mago conhece bem. 1 PM: objeto pequeno móvel (uma mão). 2 PMs: pequena móvel/1m imóvel. Progressão até 10 PMs = montanha em movimento.</p>"),

  m("Ilusão Avançada", "todas", "2+ PMs", "longo", "sustentável",
    "<p>Como Ilusão, mas produz sons e cheiros. Custo dobrado pra cada tamanho.</p>"),

  m("Ilusão Total", "todas", "4+ PMs", "longo", "sustentável",
    "<p>Engana todos os sentidos — ilusão sólida. Pode causar dano. Dano=FA de ilusão+1d. Se vítima \"morre\" por ilusão, percebe não ferimento real ao acordar.</p>"),

  m("Imagem Turva", "Branca ou Negra", "3 PMs", "curto", "sustentável",
    "<p>Imagem difícil de enxergar. Adversários H−1 em ataques/esquivas contra alvo. Sentidos Especiais ignoram.</p>"),

  m("Impulso", "Elemental (espírito)", "2 PMs", "curto", "sustentável",
    "<p>Enche pessoa de coragem e burrice. R pra evitar. Se falhar, recebe +1 em iniciativa (impetuosidade) mas −1 em Armadura e R.</p>"),

  m("Inferno de Gelo", "Branca ou Elemental (água)", "5 PMs", "curto", "instantânea",
    "<p>Dispara pontas de gelo afiadas. FA=H+2d. Ignora totalmente Armadura.</p>"),

  m("Invisibilidade", "todas", "1+ PMs", "curto", "sustentável",
    "<p>Torna objetos/criaturas invisíveis. Ver o Invisível ou Sentidos Especiais vencem. 1 PM = pequeno imóvel. 2 PMs: pequeno móvel/1m imóvel. Progressão similar à Ilusão. Cancela ao atacar/magicar.</p>"),

  m("Invisibilidade Superior", "todas", "2+ PMs", "curto", "sustentável",
    "<p>Custa dobro da Invisibilidade mas não cancela quando o alvo ataca ou sofre dano. Mais eficiente.</p>"),

  m("Invocação do Dragão", "veja abaixo", "veja abaixo", "100km", "instantânea",
    "<p>Atrai atenção de dragão local. Custo depende da espécie: Branco (5 PMs, Branca), Negro (5 PMs, Negra), Verde (7 PMs, Elemental terra), Azul (8 PMs, Elemental ar), Marinho (9 PMs, Elemental água), Vermelho (10 PMs, Elemental fogo). Dragões não obedecem — apenas vêm curiosos.</p>"),

  m("Invocação do Elemental", "Elemental (todas)", "2 a 10 PMs", "longo", "sustentável",
    "<p>Conjura elemental de um elemento. Cada 2 PMs = 1 pt pra características (máximo 5).</p>"),

  m("Invocação do Elemental Superior", "todas", "2 a 10 PMs", "longo", "sustentável",
    "<p>Cada PM vale 1 pt. 10 PMs = 10 pts pra distribuir.</p>"),

  m("Invocação do Elemental Supremo", "todas", "2 a 10 PMs", "longo", "sustentável",
    "<p>Cada 2 PMs vale 3 pts. 10 PMs = 15 pts. Elementais furiosos — invocador precisa vencer na primeira ou será atacado.</p>"),

  m("Invulnerabilidade", "todas", "2 a 6 PMs por turno", "curto", "sustentável",
    "<p>Reproduz vantagem Invulnerabilidade pra um tipo de dano. Custo: Corte/Perf/Esmag (2 PMs), Fogo/Frio/Elétrico/Quím/Sônico (4 PMs), Magia/Força/PdF (6 PMs, raros).</p>"),

  /* ================ L ================ */
  m("Lágrimas de Hyninn", "Branca", "3 PMs", "toque", "permanente até cancelada",
    "<p>Lançada em aposentos. Ladrão tem habilidades reduzidas (Crime em Tarefas Difíceis). Ativa em vários castelos de Arton.</p>"),

  m("Lágrimas de Wynna", "Negra", "25 PMs", "toque", "permanente",
    "<p>Remove totalmente habilidades mágicas da vítima. R−3. Se falhar, perde todas vantagens mágicas e magias. Pode ser revertido pagando pontos normais.</p>"),

  m("Lâmina d'Água", "Elemental (água) ou Negra", "10 PMs", "curto", "sustentável",
    "<p>Lâmina de água sob altíssima pressão, cortante. Vorpal. Ataca à distância (até 10m) com FA=H+1d+10.</p>"),

  m("A Lança Infalível de Talude", "Branca ou Elemental (fogo)", "1 a 5 PMs", "longo", "instantânea",
    "<p>Lança luminosa surge ao lado do mago e dispara. FA=2, sempre acerta (considerado indefeso: apenas Armadura=FD). +1 PM por lança extra (máximo 5).</p>"),

  m("Leitura de Lábios", "Branca ou Elemental (ar)", "1 PM", "longo", "sustentável",
    "<p>Ouve perfeitamente palavras de qualquer criatura visível. Ótima pra espionagem e aprender magias alheias.</p>"),

  m("A Loucura de Atavus", "Negra", "2 a 15 PMs", "toque", "1 dia",
    "<p>Só magos loucos. Vítima testa R−1; falha = Insano por 1 dia. Gravidade da insanidade escolhida pelo mago (2/5/10/15 PMs = 0/−1/−2/−3 pts).</p>",
    "Insano"),

  m("Luz", "Branca ou Elemental (fogo)", "1 PM", "toque", "sustentável",
    "<p>Objeto brilha como tocha. Ilumina 6m (+6m com luz fraca). Dobrado pra personagens com Visão Aguçada.</p>"),

  /* ================ M ================ */
  m("A Mágica Silenciosa de Talude", "Elemental (ar)", "1 PM", "pessoal", "sustentável",
    "<p>Lança magias sem emitir som. Impede ser afetado por Silêncio, amordaçamento, embaixo d'água.</p>"),

  m("Maldição das Trevas", "Negra", "5 a 15 PMs permanentes", "visão", "permanente",
    "<p>Drena permanentemente PMs do conjurador. 5 PMs = Maldição ínfima (0 pts), 10 PMs = suave (−1), 15 PMs = grave (−2). R pra evitar. Efeito à escolha: Deficiência Física, Má Fama, Monstruoso, Insano, Inculto.</p>"),

  m("Marcha da Batalha", "Elemental (espírito)", "2 a 10 PMs por turno", "curto", "sustentável",
    "<p>Usado por bardos. Música vibrante. Todos os aliados recebem FA+1 e FD+1 para cada 2 PMs gastos.</p>"),

  m("Marcha da Coragem", "Branca ou Elemental (espírito)", "1 PM", "curto", "sustentável",
    "<p>Impede aliados na área de serem afetados por medo (natural ou mágico). Cancela Pânico.</p>"),

  m("Magia Perdida", "Branca ou Elemental (espírito)", "1 PM", "toque", "permanente",
    "<p>Apaga da mente de outro mago uma magia específica. Vítima inconsciente necessária. Magias Iniciais não podem ser apagadas.</p>"),

  m("Marionete", "Elemental (terra) ou Negra", "10 PMs", "curto", "sustentável",
    "<p>Controla totalmente o corpo (não mente) de uma criatura. R−1. Vítima consciente mas impotente. Se ordenarem sacrifício, R novo. Ataques têm dano =0 nela.</p>"),

  m("Mata-Dragão", "Negra", "30 PMs", "longo", "instantânea",
    "<p>Energia destrutiva explosiva. FA=H+2d+30. Destrói tudo em 100m. 2 turnos de cast. Invocador indefeso.</p>"),

  m("Megalon", "Elemental (água ou terra)", "3 PMs por turno", "toque", "sustentável",
    "<p>Torna criatura maior e mais forte. Cada 3 PMs aumentam 50% tamanho/velocidade, dá F+1, R+1 (incluindo PVs, não PMs) e PdF+1 (até +0).</p>"),

  m("Mikron", "Elemental (água ou terra)", "5 PMs", "toque", "permanente até cancelada",
    "<p>Oposto de Megalon. Criatura fica 50% menor/mais lenta, penalidade F−1/R−1/PdF−1 (incluindo PVs/PMs). R pra negar efeito.</p>"),

  m("Um Momento de Tormenta", "Negra", "10 PMs", "pessoal", "sustentável",
    "<p>Manifestação de Tormenta em menor escala. Nuvem rubra, chuva ácida 1 PV/turno (ignora Armadura exceto Invulnerabilidade/Químico). Afeta tudo em 100m, exceto mago.</p>"),

  m("Monstros do Pântano", "Elemental (água ou terra) ou Negra", "3 PMs por troll", "curto", "sustentável",
    "<p>Invoca 1+ trolls. F2, H2, R3, A1, PdF0. Regeneram 2 PVs/turno. Fogo/químico são as únicas formas de realmente matar (não regeneram).</p>"),

  m("Morte Estelar", "Branca, Elemental e Negra (todas)", "5 PMs permanentes", "longo", "instantânea",
    "<p>A mais poderosa magia destrutiva. Destrói qualquer coisa: criatura, montanha, deus, planeta. Sem teste de R. 5 PMs sacrificados permanentemente.</p>",
    "Arcano"),

  m("Mundo dos Sonhos", "Elemental (espírito)", "2 PMs por alvo", "longo", "sustentável por 1 hora",
    "<p>Vítima acredita viver outra realidade sob desejo do mago. Dano no mundo real cancela. Aventuras no Mundo dos Sonhos não rendem PEs.</p>"),

  m("Muralha de Energia", "Elemental (espírito)", "4+ PMs por turno", "curto", "sustentável",
    "<p>Barreira de energia invisível. 3m de altura/largura por 4 PMs. Imune a dano. Atravessável apenas por Porta Dimensional/Teletransporte.</p>"),

  /* ================ N ================ */
  m("Nevasca", "Elemental (água)", "5 PMs", "longo", "sustentável",
    "<p>Tempestade de gelo em 30m. Sem dano real, mas dificulta enormemente visibilidade e movimentação. Velocidade/2, criaturas voadoras sem F5 caem. Fogo não-mágico se extingue.</p>", "", circle(15)),

  m("Nevoeiro de Hyninn", "Elemental (água)", "1 PM por turno", "curto", "sustentável",
    "<p>Névoa densa em 10m impedindo visibilidade. Mago também cego. Fácil de dispersar mas custo baixo.</p>", "", circle(10)),

  m("Nevoeiro de Sszzaas", "Elemental (água) ou Negra", "2 PMs por turno", "curto", "sustentável",
    "<p>Variante venenosa de Nevoeiro de Hyninn. Todos cegos e perdem 1 PV por turno (exceto mago, exposto ao veneno também). Imunes: homens-serpente, mortos-vivos, etc.</p>"),

  m("Nobre Montaria", "Branca ou Elemental (ar)", "5 PMs por grifo", "longo", "sustentável",
    "<p>Invoca grifos (F2, H4, R3, A1, PdF0). Ataques: 2 garras (F+H+1d−1) e bico (F+H+1d+1). Deve haver grifos na região.</p>"),

  m("A Nulificação Total de Talude", "Branca ou Negra", "50 PMs", "toque", "permanente",
    "<p>Criatura ou objeto desaparece — memória de todos apagada. Só Talude conhece. R−4 pra resistir. Exceção: façanhas notáveis persistem.</p>"),

  /* ================ O ================ */
  m("Ondas de Vento", "Elemental (ar)", "2 a 10 PMs", "longo", "instantânea",
    "<p>1 onda por 2 PMs (máx 5). FA=H+1d cada. Invisíveis, apanham o alvo indefeso a menos que Audição Aguçada/Radar/Ver o Invisível.</p>"),

  /* ================ P ================ */
  m("Pacto com a Serpente", "Elemental (fogo) ou Negra", "1 PM", "longo", "sustentável",
    "<p>Convoca 1+ dragoas-caçadoras (F2, H3, R2, A0, PdF0). Selvagens, não obedecem. Lutam até morrer. Se não houver oponentes quando invocadas, atacam o próprio mago.</p>"),

  m("Pânico", "Elemental (espírito) ou Negra", "2 PMs por criatura", "longo", "sustentável",
    "<p>R pra evitar. Pânicado foge, não pode esquivar ou usar vantagens com PMs (exceto pra fugir). Dragões/mortos-vivos imunes.</p>"),

  m("Paralisia", "Branca ou Negra", "2 PMs por criatura", "curto", "sustentável",
    "<p>Vítima testa R. Falha = paralisada, incapaz de mover/esquivar/magicar. Indefesa. Atacar (mesmo sem dano) cancela.</p>"),

  m("Paz de Marah", "Branca", "10 PMs", "longo", "sustentável",
    "<p>Anula intenções violentas em 50m. Calma tumultos. Não contra criaturas com razão pra lutar (vilão versus heróis). Dispara fantasmas ofensivos.</p>"),

  m("Pequenos Desejos*", "todas", "0", "curto", "sustentável ou 1 hora",
    "<p>Pequenos truques por 1 hora: criar pequenos objetos, mover lentamente com F0, colorir/limpar/sujar (não produzir) 500g material, esquentar/esfriar. Não pode atacar, causar dano ou atrapalhar magia.</p>"),

  m("Permanência", "Elemental (terra)", "1 a 5 PMs permanentes", "curto", "permanente até cancelada",
    "<p>Torna magia sustentada em permanente (PMs não ficam \"presos\"). Sacrificar metade dos PMs da magia original. Pode ser cancelada por Cancelamento de Magia.</p>"),

  m("Petrificação", "Elemental (terra)", "20 PMs", "toque", "permanente até cancelada",
    "<p>Transforma em pedra. Visual ou toque. R pra evitar. Só revertido por poção/pergaminho ou magias Cancelamento/Cura Maldição/Desejo. Estátuas quase indestrutíveis; dano normal fere ao desfazer.</p>"),

  m("Poder Telepático", "Elemental (espírito)", "5 PMs", "pessoal", "sustentável",
    "<p>Enquanto ativa, oferece todos os poderes e benefícios da vantagem Telepatia.</p>"),

  m("Porta Dimensional", "Elemental (espírito)", "5 PMs", "pessoal", "instantânea",
    "<p>Transporta o mago e criaturas tocadas até 150m. Criaturas relutantes fazem R.</p>"),

  m("Praga de Kobolds", "Elemental (terra) ou Negra", "5 a 15 PMs", "curto", "sustentável",
    "<p>Invoca 1d kobolds (F1, H0, R0, A1, PdF1) por 5 PMs (máx 3d com 15 PMs). Atacam quaisquer criaturas à vista, exceto aliados do mago.</p>"),

  m("Presença Distante", "Elemental (espírito)", "1 a 10 PMs por minuto", "veja abaixo", "sustentável",
    "<p>Projeta imagem ilusória do mago em grande distância. 1 PM/minuto no mesmo mundo, 10 PMs/min pra outros mundos. Imagem translúcida, reconhecível como ilusão.</p>"),

  m("Proteção Mágica*", "todas", "1 a 5 PMs por turno", "curto", "sustentável",
    "<p>Protege com parede de fogo, armadura de pedra, escudo de luz. A+1 por PM gasto. 4 PMs = A+4 pra mago ou companheiro. Cumulativa com Armadura natural.</p>"),

  m("Proteção Mágica Superior", "Branca", "1 a 5 PMs por turno", "curto", "sustentável",
    "<p>Versão Branca mais eficaz: A+2 por PM gasto.</p>"),

  m("Proteção Contra a Tormenta", "Branca, Elemental (fogo) ou Negra", "2 PMs", "curto", "sustentável",
    "<p>Invulnerabilidade contra chuva ácida/relâmpagos/neblina venenosa da Tormenta. Só os efeitos climáticos, não veneno normal.</p>"),

  m("Proteção Superior Contra a Tormenta", "Branca", "4 PMs", "curto", "sustentável",
    "<p>Versão aprimorada da Proteção contra Tormenta. Disponível apenas na Academia Arcana.</p>"),

  /* ================ R ================ */
  m("Raio Desintegrador", "Elemental (ar) ou Negra", "10 a 50 PMs", "toque ou longo", "instantânea",
    "<p>Destrói por completo objeto ou criatura (reduzindo a pó). Cada 10 PMs desintegra objeto com F1 (até 50 PMs F5, 10 toneladas). Apenas Desejo recupera. Contra seres vivos: R pra negar.</p>"),

  m("Raio Espiritual", "Elemental (espírito)", "10 PMs", "longo", "instantânea",
    "<p>Raio luminoso espiralado. FA=6d. Trajetória irregular (vítima H+2 em esquiva).</p>"),

  m("Recuperação", "Branca", "5 PMs + 1d PMs da vítima", "toque", "instantânea",
    "<p>Cura sem poder divino. Usa as próprias energias. Custo alto pro mago e vítima, mas pode ser única opção sem Clericato.</p>"),

  m("Recuperação Natural", "Branca", "5 PMs", "toque", "sustentável",
    "<p>Acelera regeneração. 1d PMs/turno curam = PVs. Cada aplicação exige +5 PMs. Só funciona em áreas selvagens ou populadas (não ruínas/desertos).</p>"),

  m("Reflexos", "Branca ou Negra", "2 PMs", "pessoal", "sustentável",
    "<p>Cria 1d duplicatas ilusórias do mago agrupadas a 1,5m. Inimigos escolhem alvo aleatório. Qualquer ataque destrói uma ilusão. Mago pode passar através.</p>"),

  m("A Resistência de Helena", "Branca ou Elemental (terra)", "2 PMs por turno", "toque", "sustentável",
    "<p>Objeto comum fica inquebrável por meios mundanos. Armaduras mágicas podem quebrar.</p>"),

  m("A Retribuição de Wynna", "Branca", "4 PMs por turno", "pessoal", "sustentável",
    "<p>Qualquer magia contra o mago é refletida volta (incluindo benéficas). Alvo original tem testes. Só uma magia por vez é refletida.</p>"),

  m("A Rocha Cadente de Vectorius", "Elemental (ar ou terra)", "5 PMs", "curto", "instantânea",
    "<p>Meteoro cai do céu sobre vítima. FA=H+2d. Vítima pode esquivar com −2. Presa embaixo, perde metade dos PVs; indefesa 1 turno ou teste de F.</p>"),

  m("Ressurreição", "Branca", "1 PM permanente", "toque", "instantânea",
    "<p>Devolve criatura morta por causas não naturais. Não velhice ou esmagamento/desintegração. R+2 pra criatura completar ressureição. Só uma vez por mesma pessoa.</p>",
    "Clericato"),

  m("Roubo de Magia", "Elemental (espírito) ou Negra", "0", "toque", "enquanto toque durar",
    "<p>Rouba 2 PMs por turno da vítima (transferidos pro mago). Sem teste de R. Vilões prisionam pra drenar.</p>"),

  m("Roubo de Vida", "Negra", "1 PM por turno", "toque", "enquanto toque durar",
    "<p>\"Mordida do Vampiro\". Rouba 1d PVs por turno (transferidos pro mago). Mais famosa entre vampiros.</p>"),

  /* ================ S ================ */
  m("Sacrifício do Herói", "Branca", "0", "pessoal", "1d+2 turnos",
    "<p>Poder máximo dos paladinos. PVs restaurados ao máximo, bônus +3 em F/H/A por 1d+2 turnos. Depois, paladino morre. Nunca pode ser ressuscitado.</p>",
    "Paladino"),

  m("Sacrifício de Marah", "Branca", "10 PMs", "curto", "instantânea",
    "<p>Último recurso. Reduz PVs do mago a 0 (Teste de Morte!). Todos os aliados em 10m têm PVs totalmente restaurados. Qualquer magia que impeça mago morrer impede a magia.</p>"),

  m("Sanidade", "Branca", "1 PM", "toque", "1 hora",
    "<p>Anula temporariamente a desvantagem Insano por 1 hora. Ou cancela Loucura de Atavus.</p>"),

  m("Sentidos Especiais", "Branca ou Elemental (ar)", "2 PMs", "pessoal", "sustentável",
    "<p>Simula uma das habilidades de Sentidos Especiais temporariamente (Audição/Faro/Infravisão/Radar/Ver Invisível/Visão Aguçada/Raio X). Só um por vez.</p>"),

  m("A Seta Infalível de Talude", "Branca ou Elemental (fogo)", "0", "curto", "instantânea",
    "<p>Versão modesta da Lança Infalível. Pequena seta luminosa com FA=1. Sempre acerta. Mago pode criar setas adicionais (+1 PM cada, máx 5).</p>"),

  m("Silêncio", "Branca ou Elemental (ar)", "2 a 10 PMs", "curto", "permanente até cancelada",
    "<p>Lança sobre local ou criatura. Volume esférico (3m/2 PMs, até 15m/10 PMs). Impossível ouvir ou fazer som dentro — nem lançar magia falada.</p>"),

  m("O Soco de Arsenal", "Elemental (todas)", "2 a 10 PMs", "curto", "instantânea",
    "<p>Soco com FA=F+1d pra cada 2 PMs gastos. Só em alcance corpo-a-corpo. Vítima arremessada 1m por ponto de dano sofrido.</p>"),

  m("Socos Explosivos", "Elemental (fogo)", "1 PM por rodada", "curto", "sustentável",
    "<p>Esferas flamejantes em volta da vítima com FA=1d/rodada. Dano pequeno, mas ignora Armadura e explodem em fumaça (alvo fica cego).</p>"),

  m("Sono", "Elemental (espírito)", "3+ PMs por criatura", "longo", "veja abaixo",
    "<p>Mais poderosa que Desmaio. Vítima testa R+1; falha = adormece profundamente. 1 hora por 3 PMs gastos.</p>"),

  /* ================ T ================ */
  m("Teia de Megalokk", "Negra", "2 PMs por criatura", "curto", "sustentável",
    "<p>Teia de fibras pegajosas. Criaturas apanhadas ficam indefesas. Escapa gastando turno e vencendo F. Serve pra bloquear portas até 3m.</p>"),

  m("Teleportação", "Branca, Elemental (ar) ou Negra", "2 PMs por criatura ou 50kg", "veja abaixo", "instantânea",
    "<p>Transporta mago + voluntários pra lugar já visitado. Distância ilimitada, mesmo plano. R+1 pra evitar. Falha (1 em 1d6) = outro lugar.</p>"),

  m("A Teleportação Aprimorada de Vectorius", "Branca, Elemental (ar) ou Negra", "3 PMs por criatura ou 50kg", "veja abaixo", "instantânea",
    "<p>Teleportação melhorada. Pode alcançar locais via observação (bola de cristal) ou tocando item da pessoa. Baseada apenas em mapa: 1 em 1d6 de sucesso.</p>"),

  m("Teleportação Planar", "Branca, Elemental (ar) ou Negra", "5 PMs por criatura ou 50kg", "veja abaixo", "instantânea",
    "<p>Alcança outros planos. 2d6 pra sucesso (1 = falha). Não acessa deuses nem oferece proteção contra planos hostis.</p>"),

  m("Tempestade Explosiva", "Elemental (fogo)", "60 PMs", "longo", "instantânea",
    "<p>A mais destrutiva Elemental (fogo). Até 2d esferas de luz aniquiladora. Cada uma com Brilho Explosivo (FA=10d, ignora Armadura).</p>", "", circle(20)),

  m("Terremoto", "Elemental (fogo ou terra)", "4 a 40 PMs", "longo", "instantânea",
    "<p>Versão massiva de Explosão, afeta apenas solo. FA=2d+4 para cada 4 PMs. Dano reduz em 1d+2 para cada 10m. Alvos podem se esquivar (+1 em FD).</p>", "", circle(10)),

  m("Terreno Escorregadio de Neo", "Elemental (água ou terra)", "1 PM ou mais", "longo", "sustentável",
    "<p>Área circular (1m diâmetro por PM). Criaturas testam H−2 (H+1 com Esporte). Falha = caem indefesas por 1 turno até levantarem.</p>"),

  m("Toque de Beluhga", "Elemental (água)", "2 a 10 PMs", "pessoal", "instantânea",
    "<p>Mãos do mago envoltas em gelo infernal. FA=F+H+1d por cada 2 PMs. Pequeno dano mas corpo-a-corpo necessário — poucos magos usam.</p>"),

  m("Toque do Unicórnio", "Branca", "4 PMs", "longo", "sustentável",
    "<p>Invoca unicórnio nobre. F2, H3, R3, A1, PdF0, Aceleração + Sentidos Especiais. Lança Cura Mágica e Teleportação sem PMs. Matar = Maldição imediata.</p>",
    "Animais, Código de Honra (Heróis ou Honestidade)"),

  m("Trancar", "Branca", "2 PMs", "toque", "permanente até cancelada",
    "<p>Tranca coisas magicamente: janelas, portas, armários, baús. Não podem ser abertos/arrombados (ainda destruíveis). Portas sem fechadura também podem.</p>"),

  m("Transformação", "Branca, Elemental (água ou terra) ou Negra", "5 a 40 PMs", "toque", "permanente até cancelada",
    "<p>Milhares de versões. Transforma criaturas em outras ou objetos. Custo depende da dificuldade de resistir: 5 PMs=R+3 (R1+imunes), 40 PMs=R−3.</p>"),

  m("Transformação em Orc", "Branca, Elemental (água ou terra) ou Negra", "10 PMs", "toque", "permanente até cancelada",
    "<p>Transforma criatura em orc horroroso. R+2 pra evitar. F2, H2, R2, A1, PdF0 (independente da original). Perícias/códigos/desvantagens permanecem.</p>")
];
