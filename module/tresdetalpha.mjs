/**
 * Entrypoint do sistema 3D&T Alpha para Foundry VTT V14.
 *
 * Responsabilidades:
 *  - Registrar classes de Document (Actor, Item)
 *  - Registrar DataModels (TypeDataModel) para cada tipo
 *  - Registrar sheets V2 via DocumentSheetConfig
 *  - Pré-carregar partials Handlebars
 *  - Registrar helpers de template
 *  - Fornecer integração com o hotbar via macros de item
 */

import { TresDeTAlphaActor } from "./documents/actor.mjs";
import { TresDeTAlphaItem } from "./documents/item.mjs";
import { TresDeTAlphaActorSheet } from "./sheets/actor-sheet.mjs";
import { TresDeTAlphaItemSheet } from "./sheets/item-sheet.mjs";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { TRESDETALPHA } from "./helpers/config.mjs";
import { ACTOR_DATA_MODELS, ITEM_DATA_MODELS } from "./data/_models.mjs";
import { registerCompendiaSeeding, seedCompendia } from "./data/seed-compendia.mjs";
import { novaVantagem } from "./wizards/nova-vantagem.mjs";

const SYSTEM_ID = "3det-foundry-rework";

/* -------------------------------------------- */
/*  i18n Safety Net                             */
/* -------------------------------------------- */

/**
 * Se por algum motivo o Foundry não carregou o arquivo de idioma do sistema
 * (system.json ainda em cache, idioma do cliente não registrado em `languages`,
 * etc.), carregamos manualmente as chaves — preferindo pt-BR, com fallback pra en.
 */
Hooks.once("i18nInit", async () => {
  const loaded = game.i18n?.has?.("TRESDETALPHA.Pontos.label");
  if (loaded) return;

  const lang = game.i18n?.lang ?? "en";
  const candidate = lang.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
  const urls = [
    `systems/${SYSTEM_ID}/lang/${candidate}.json`,
    `systems/${SYSTEM_ID}/lang/pt-BR.json`  // último recurso
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const translations = await response.json();
      foundry.utils.mergeObject(game.i18n.translations, translations);
      console.log(`3D&T Alpha | i18n fallback: carregou ${url}`);
      return;
    } catch (err) {
      console.warn(`3D&T Alpha | i18n fallback: falhou ao carregar ${url}`, err);
    }
  }
});

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  console.log(`3D&T Alpha | Init — sistema "${SYSTEM_ID}" (V14)`);

  // Namespace global de conveniência (o id do manifest tem hífen/dígito inicial,
  // então usamos `game.tresdetalpha` por ergonomia — é só convenção interna).
  game.tresdetalpha = {
    TresDeTAlphaActor,
    TresDeTAlphaItem,
    rollItemMacro,
    novaVantagem
  };

  // Constantes do sistema.
  CONFIG.TRESDETALPHA = TRESDETALPHA;

  // Fórmula de iniciativa.
  CONFIG.Combat.initiative = {
    formula: "1d20 + @abilities.habilidade.total",
    decimals: 2
  };

  // Classes de Document.
  CONFIG.Actor.documentClass = TresDeTAlphaActor;
  CONFIG.Item.documentClass  = TresDeTAlphaItem;

  // TypeDataModels — schema e cálculos derivados por tipo.
  CONFIG.Actor.dataModels = ACTOR_DATA_MODELS;
  CONFIG.Item.dataModels  = ITEM_DATA_MODELS;

  // Registro de sheets (forma canônica V14).
  const { DocumentSheetConfig } = foundry.applications.apps;
  const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;

  DocumentSheetConfig.unregisterSheet(Actor, "core", ActorSheetV2);
  DocumentSheetConfig.registerSheet(Actor, SYSTEM_ID, TresDeTAlphaActorSheet, {
    types: ["personagem", "npc"],
    makeDefault: true,
    label: "TRESDETALPHA.SheetLabels.Actor"
  });

  DocumentSheetConfig.unregisterSheet(Item, "core", ItemSheetV2);
  DocumentSheetConfig.registerSheet(Item, SYSTEM_ID, TresDeTAlphaItemSheet, {
    types: ["vantagem", "desvantagem", "vantagemUnica", "pericia", "magia", "objetoMagico"],
    makeDefault: true,
    label: "TRESDETALPHA.SheetLabels.Item"
  });

  // Handlebars helpers.
  registerHandlebarsHelpers();

  // Registro do flag de seeding e da API `game.tresdetalpha.reseedCompendia()`.
  registerCompendiaSeeding();

  // Pré-carrega partials.
  await preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

function registerHandlebarsHelpers() {
  Handlebars.registerHelper("concat", function (...args) {
    return args.slice(0, -1).filter(a => typeof a !== "object").join("");
  });

  Handlebars.registerHelper("toLowerCase", function (str) {
    return typeof str === "string" ? str.toLowerCase() : str;
  });

  Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
  });

  // Foundry V13 tinha um helper built-in `{{#select value}}...options...{{/select}}` que
  // marcava a <option> com value correspondente como `selected`. O V14 removeu esse helper
  // em favor de `{{selectOptions}}`. Re-registramos aqui pra manter os templates antigos funcionando.
  if (!Handlebars.helpers.select) {
    Handlebars.registerHelper("select", function (selected, options) {
      const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escaped = escapeRegex(String(selected ?? ""));
      const rgx = new RegExp(` value=["']${escaped}["']`);
      const html = options.fn(this);
      return html.replace(rgx, "$& selected");
    });
  }
}

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));

  // Popula os compêndios do mundo com vantagens/desvantagens do Manual Core
  // na primeira abertura. Depois disso, o GM pode editar à vontade.
  await seedCompendia();
});

/* -------------------------------------------- */
/*  Macros de Item na Hotbar                    */
/* -------------------------------------------- */

async function createItemMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!data.uuid?.includes("Actor.") && !data.uuid?.includes("Token.")) {
    ui.notifications.warn("Só é possível criar macros para itens pertencentes a um Actor.");
    return false;
  }
  const item = await Item.fromDropData(data);
  if (!item) return false;

  const command = `game.tresdetalpha.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command,
      flags: { [`${SYSTEM_ID}.itemMacro`]: true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

function rollItemMacro(itemUuid) {
  const dropData = { type: "Item", uuid: itemUuid };
  Item.fromDropData(dropData).then(item => {
    if (!item || !item.parent) {
      const name = item?.name ?? itemUuid;
      ui.notifications.warn(`Não foi possível encontrar o item ${name}. Apague e recrie esta macro.`);
      return;
    }
    item.roll();
  });
}
