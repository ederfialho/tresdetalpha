/**
 * Semeadura de compêndios do mundo para o sistema 3D&T Alpha.
 *
 * Estratégia: na primeira vez que um mundo abre, cria compêndios próprios do
 * mundo (não do sistema — por isso ficam editáveis) e popula com os dados
 * embutidos em `compendia-seed.mjs`.
 *
 * Um flag em `game.settings` evita repopular em cada abertura. Se o GM quiser
 * re-semear (por exemplo depois de apagar acidentalmente), basta executar a
 * macro `TresDeTAlpha.reseedCompendia()` no console ou via macro.
 */

import { VANTAGENS, DESVANTAGENS, VANTAGENS_UNICAS, PERICIAS, MAGIAS } from "./compendia-seed.mjs";
import { iconFor } from "./icon-mapping.mjs";

const SYSTEM_ID = "3det-foundry-rework";
const SETTING_SEEDED = "compendiaSeeded";

const COMPENDIA = [
  {
    name: "tresdetalpha-vantagens",
    label: "3D&T — Vantagens",
    icon: "icons/sundries/books/book-red-exclamation.webp",
    itemType: "vantagem",
    source: () => VANTAGENS
  },
  {
    name: "tresdetalpha-desvantagens",
    label: "3D&T — Desvantagens",
    icon: "icons/sundries/books/book-worn-brown-gray.webp",
    itemType: "desvantagem",
    source: () => DESVANTAGENS
  },
  {
    name: "tresdetalpha-vantagens-unicas",
    label: "3D&T — Vantagens Únicas",
    icon: "icons/sundries/books/book-purple-tan.webp",
    itemType: "vantagemUnica",
    source: () => VANTAGENS_UNICAS
  },
  {
    name: "tresdetalpha-pericias",
    label: "3D&T — Perícias",
    icon: "icons/sundries/books/book-green-gold.webp",
    itemType: "pericia",
    source: () => PERICIAS
  },
  {
    name: "tresdetalpha-magias",
    label: "3D&T — Magias",
    icon: "icons/sundries/books/book-blue-gold.webp",
    itemType: "magia",
    source: () => MAGIAS
  }
];

/**
 * Registra o setting e a API global.
 * Chame isso no hook `init`.
 */
export function registerCompendiaSeeding() {
  game.settings.register(SYSTEM_ID, SETTING_SEEDED, {
    name: "Compêndios já semeados",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.tresdetalpha ??= {};
  game.tresdetalpha.reseedCompendia = () => seedCompendia({ force: true });
  game.tresdetalpha.rebuildCompendia = () => seedCompendia({ force: true, wipe: true });
  game.tresdetalpha.getCompendiaStatus = () => {
    const rows = [];
    for (const def of COMPENDIA) {
      const pack = game.packs.get(`world.${def.name}`);
      rows.push({
        nome: def.label,
        existe: !!pack,
        itens: pack?.index.size ?? 0
      });
    }
    console.table(rows);
    return rows;
  };
}

/**
 * Cria (se necessário) e popula os compêndios.
 * Chame isso no hook `ready`, uma vez por sessão.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.force] Se true, reseta e refaz mesmo se já foi semeado.
 */
export async function seedCompendia({ force = false, wipe = false } = {}) {
  if (!game.user?.isGM) return;
  const already = game.settings.get(SYSTEM_ID, SETTING_SEEDED);
  if (already && !force) return;

  const msg = wipe ? "rebuilding (apagando e recriando)" : "semeando compêndios do mundo";
  ui.notifications.info(`3D&T Alpha: ${msg}...`);
  let totalCreated = 0;

  for (const def of COMPENDIA) {
    try {
      const pack = await ensurePack(def);
      if (!pack) continue;
      if (wipe) await wipePack(pack);
      const created = await populatePack(pack, def);
      totalCreated += created;
    } catch (err) {
      console.error(`3D&T Alpha | Falha ao semear ${def.name}`, err);
    }
  }

  await game.settings.set(SYSTEM_ID, SETTING_SEEDED, true);
  ui.notifications.info(`3D&T Alpha: compêndios prontos (${totalCreated} itens criados).`);
}

/**
 * Monta o `system` de um item embasado no tipo — cada tipo tem schema próprio.
 * Pra vantagem/desvantagem/vantagemUnica: nome, custo, categoria, prerequisitos, custoPMs, duracao, efeito, description.
 * Pra magia: escola, custo (string de PMs), alcance, duracao, exigencias, description.
 * Pra pericia: nome, custo, description.
 * Pra objetoMagico: custo, tipo, description.
 */
function buildSystemData(row, type) {
  switch (type) {
    case "magia": {
      const tpl = row.template ?? {};
      return {
        description: row.efeito ?? row.description ?? "",
        escola: row.escola ?? "",
        custo: String(row.custo ?? ""),
        alcance: row.alcance ?? "",
        duracao: row.duracao ?? "",
        exigencias: row.exigencias ?? "",
        template: {
          type: tpl.type ?? "",
          distance: Number(tpl.distance ?? 0),
          width: Number(tpl.width ?? 0),
          angle: Number(tpl.angle ?? 0)
        }
      };
    }
    case "pericia":
      return {
        description: row.efeito ?? row.description ?? "",
        nome: row.name,
        custo: Number(row.custo ?? 2)
      };
    case "objetoMagico":
      return {
        description: row.efeito ?? row.description ?? "",
        custo: Number(row.custo ?? 0),
        tipo: row.tipo ?? ""
      };
    case "vantagem":
    case "desvantagem":
    case "vantagemUnica":
    default:
      return {
        nome: row.name,
        custo: Number(row.custo ?? 0),
        categoria: row.categoria ?? "",
        prerequisitos: row.prerequisitos ?? "",
        custoPMs: row.custoPMs ?? "",
        duracao: row.duracao ?? "",
        efeito: row.efeito ?? "",
        description: row.description ?? ""
      };
  }
}

/**
 * Apaga todos os documentos de um compêndio. Usado pelo `rebuildCompendia()`.
 */
async function wipePack(pack) {
  await pack.getIndex();
  const ids = [...pack.index.keys()];
  if (!ids.length) return;
  await Item.deleteDocuments(ids, { pack: pack.collection });
}

/**
 * Garante que o compêndio existe. Se não existir, cria um novo CompendiumCollection
 * de tipo Item no escopo `world`.
 */
async function ensurePack(def) {
  const packId = `world.${def.name}`;
  let pack = game.packs.get(packId);
  if (pack) return pack;

  try {
    const metadata = {
      name: def.name,
      label: def.label,
      type: "Item",
      system: SYSTEM_ID,
      package: "world",
      path: `packs/${def.name}`,
      ownership: { PLAYER: "OBSERVER", ASSISTANT: "OWNER" }
    };
    pack = await CompendiumCollection.createCompendium(metadata);
    return pack;
  } catch (err) {
    console.error(`3D&T Alpha | Não foi possível criar compêndio ${def.name}`, err);
    return null;
  }
}

/**
 * Popula o compêndio com os itens do source, pulando os que já existem pelo nome.
 */
async function populatePack(pack, def) {
  const entries = def.source() ?? [];
  if (!entries.length) return 0;

  await pack.getIndex();
  const existingNames = new Set([...pack.index.values()].map((e) => e.name));

  const toCreate = [];
  for (const row of entries) {
    if (existingNames.has(row.name)) continue;

    // Usa ícone mapeado por categoria/nome (icon-mapping.mjs); cai no default do pack se falhar.
    const mappedIcon = iconFor({
      name: row.name,
      escola: row.escola,
      categoria: row.categoria
    }, def.itemType);

    toCreate.push({
      name: row.name,
      type: def.itemType,
      img: row.img ?? mappedIcon ?? def.icon,
      system: buildSystemData(row, def.itemType),
      effects: (row.effects ?? []).map((e) => ({
        name: e.name,
        img: e.img ?? "icons/svg/aura.svg",
        changes: e.changes ?? [],
        transfer: e.transfer ?? true,
        disabled: e.disabled ?? false,
        flags: e.flags ?? {}
      }))
    });
  }

  if (!toCreate.length) return 0;

  const docs = await Item.createDocuments(toCreate, { pack: pack.collection });
  return docs?.length ?? toCreate.length;
}
