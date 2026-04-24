/**
 * Bestiário — NPCs pré-montados pra uso no sistema 3D&T Alpha.
 *
 * Estes são arquétipos genéricos de fantasia (goblin, orc, dragão, bandido, etc.)
 * com stats balanceados seguindo as escalas do sistema (Iniciante → Mestre).
 * Cada entrada define os valores das 5 características e flags de NPC.
 *
 * O mestre pode clonar pro mundo dele e ajustar à vontade. Vantagens e magias
 * adicionais podem ser arrastadas dos outros compêndios.
 */

const MODE = { MULTIPLY: 1, ADD: 2, DOWNGRADE: 3, UPGRADE: 4, OVERRIDE: 5 };
const chg = (key, value, mode = MODE.ADD, priority = 20) => ({ key, mode, value: String(value), priority });

/**
 * Helper pra montar um NPC com a estrutura esperada pelo DataModel.
 * @param {object} opts
 */
function npc({
  name, img, escala, xpReward = 1, tipo = "",
  forca = 0, habilidade = 0, resistencia = 1, armadura = 0, poderDeFogo = 0,
  vidaBonus = 0, magiaBonus = 0,
  tactics = "",
  biography = ""
}) {
  // Calcula PV/PM como o DataModel faria.
  const r = resistencia;
  const pv = Math.max(r * 5 + vidaBonus, 1);
  const pm = Math.max(r * 5 + magiaBonus, 1);
  return {
    name,
    img: img ?? "icons/svg/mystery-man.svg",
    type: "npc",
    system: {
      pontos: 0,
      biography,
      vida:  { value: pv, bonus: vidaBonus, min: 0, max: pv },
      magia: { value: pm, bonus: magiaBonus, min: 0, max: pm },
      experiencia: { value: 0, min: 0, max: 0 },
      abilities: {
        forca:       { value: forca,       bonus: 0, total: forca },
        habilidade:  { value: habilidade,  bonus: 0, total: habilidade },
        resistencia: { value: resistencia, bonus: 0, total: resistencia },
        armadura:    { value: armadura,    bonus: 0, total: armadura },
        poderDeFogo: { value: poderDeFogo, bonus: 0, total: poderDeFogo }
      },
      attributes: {
        tipoDeDano: {
          forca: { value: "" },
          poderDeFogo: { value: "" }
        },
        forcaDeAtaque: {
          forca: { value: forca + habilidade },
          poderDeFogo: { value: poderDeFogo + habilidade }
        },
        forcaDefesa: { value: armadura + habilidade }
      },
      npc: {
        escala: escala ?? "",
        xpReward,
        tipo: tipo ?? "",
        tactics
      }
    }
  };
}

export const BESTIARIO = [
  npc({
    name: "Goblin guerreiro",
    img: "icons/svg/combat.svg",
    escala: "Iniciante", xpReward: 1, tipo: "Humanoide",
    forca: 1, habilidade: 1, resistencia: 1, armadura: 1, poderDeFogo: 0,
    tactics: "<p>Ataca em grupo preferindo flanquear alvos isolados. Foge se o líder cair.</p>"
  }),
  npc({
    name: "Goblin arqueiro",
    img: "icons/svg/target.svg",
    escala: "Iniciante", xpReward: 1, tipo: "Humanoide",
    forca: 1, habilidade: 2, resistencia: 1, armadura: 0, poderDeFogo: 1,
    tactics: "<p>Mantém distância, ataca com arco curto. Esconde-se em árvores ou telhados.</p>"
  }),
  npc({
    name: "Orc brutamontes",
    img: "icons/svg/sword.svg",
    escala: "Novato", xpReward: 2, tipo: "Humanoide",
    forca: 3, habilidade: 1, resistencia: 2, armadura: 1, poderDeFogo: 0,
    tactics: "<p>Avança em linha reta pro alvo mais forte. Usa machado de duas mãos, não esquiva.</p>"
  }),
  npc({
    name: "Bandido de estrada",
    img: "icons/svg/combat.svg",
    escala: "Novato", xpReward: 2, tipo: "Humano",
    forca: 2, habilidade: 2, resistencia: 2, armadura: 1, poderDeFogo: 1,
    tactics: "<p>Embosca em terreno acidentado. Fica no corpo-a-corpo se o combate virar a favor, foge se perde aliados.</p>"
  }),
  npc({
    name: "Lobo faminto",
    img: "icons/svg/pawprint.svg",
    escala: "Iniciante", xpReward: 1, tipo: "Besta",
    forca: 2, habilidade: 2, resistencia: 1, armadura: 0, poderDeFogo: 0,
    tactics: "<p>Caça em matilha (2–4). Foca na garganta do alvo mais fraco. Foge se perder metade da matilha.</p>"
  }),
  npc({
    name: "Urso das cavernas",
    img: "icons/svg/pawprint.svg",
    escala: "Lutador", xpReward: 3, tipo: "Besta",
    forca: 4, habilidade: 2, resistencia: 4, armadura: 1, poderDeFogo: 0,
    tactics: "<p>Territorial. Ataca qualquer um que entrar na caverna. Recua apenas com fogo.</p>"
  }),
  npc({
    name: "Esqueleto soldado",
    img: "icons/svg/bones.svg",
    escala: "Iniciante", xpReward: 1, tipo: "Morto-vivo",
    forca: 2, habilidade: 1, resistencia: 1, armadura: 2, poderDeFogo: 0,
    tactics: "<p>Segue ordens do invocador sem desviar. Imune a medo e dor. Destruído pelo dano físico normal.</p>"
  }),
  npc({
    name: "Zumbi decadente",
    img: "icons/svg/skull.svg",
    escala: "Iniciante", xpReward: 1, tipo: "Morto-vivo",
    forca: 2, habilidade: 0, resistencia: 2, armadura: 0, poderDeFogo: 0,
    tactics: "<p>Lento (H−2 em iniciativa). Anda em direção ao som/movimento mais próximo. Não sente dor.</p>"
  }),
  npc({
    name: "Ogre mercenário",
    img: "icons/svg/combat.svg",
    escala: "Lutador", xpReward: 3, tipo: "Humanoide",
    forca: 5, habilidade: 1, resistencia: 3, armadura: 2, poderDeFogo: 0,
    tactics: "<p>Corpo-a-corpo direto com clava pesada. Ignora alvos pequenos e mira no mais volumoso. Foge só se próximo da morte.</p>"
  }),
  npc({
    name: "Cavaleiro da guarda",
    img: "icons/svg/holy-shield.svg",
    escala: "Lutador", xpReward: 3, tipo: "Humano",
    forca: 2, habilidade: 3, resistencia: 2, armadura: 3, poderDeFogo: 0,
    tactics: "<p>Combate honrosamente, nunca ataca alvos rendidos. Protege aliados feridos. Usa espada e escudo.</p>"
  }),
  npc({
    name: "Mago iniciante",
    img: "icons/svg/magic-swirl.svg",
    escala: "Novato", xpReward: 2, tipo: "Humano",
    forca: 1, habilidade: 2, resistencia: 2, armadura: 0, poderDeFogo: 2,
    magiaBonus: 5,
    tactics: "<p>Fica na retaguarda lançando Ataque Mágico e Bomba de Luz. Usa Invisibilidade se cercado.</p>"
  }),
  npc({
    name: "Assassino das sombras",
    img: "icons/svg/cowled.svg",
    escala: "Aventureiro", xpReward: 4, tipo: "Humano",
    forca: 2, habilidade: 4, resistencia: 2, armadura: 2, poderDeFogo: 2,
    tactics: "<p>Ataque surpresa com dano triplicado. Foge após um golpe crítico. Domina terrenos urbanos.</p>"
  }),
  npc({
    name: "Troll regenerador",
    img: "icons/svg/regen.svg",
    escala: "Aventureiro", xpReward: 4, tipo: "Humanoide",
    forca: 4, habilidade: 2, resistencia: 4, armadura: 1, poderDeFogo: 0,
    tactics: "<p>Regenera 1 PV/turno enquanto não receber dano de fogo ou ácido. Persegue o alvo mais fraco até morrer.</p>"
  }),
  npc({
    name: "Demônio menor",
    img: "icons/svg/fire.svg",
    escala: "Aventureiro", xpReward: 4, tipo: "Youkai",
    forca: 3, habilidade: 3, resistencia: 3, armadura: 1, poderDeFogo: 3,
    magiaBonus: 5,
    tactics: "<p>Ataca à distância com bolas de fogo e dispara no inimigo mais próximo no corpo-a-corpo. Imune a fogo.</p>"
  }),
  npc({
    name: "Dragão jovem",
    img: "icons/svg/fire-shield.svg",
    escala: "Veterano", xpReward: 8, tipo: "Dragão",
    forca: 5, habilidade: 3, resistencia: 5, armadura: 3, poderDeFogo: 5,
    magiaBonus: 10,
    tactics: "<p>Voa em círculos soltando chamas na primeira rodada. Desce pro combate corpo-a-corpo apenas contra alvos feridos.</p>"
  })
];
