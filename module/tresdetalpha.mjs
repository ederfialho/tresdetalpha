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
import { novoPersonagem } from "./wizards/novo-personagem.mjs";
import { registerChatActions, postItemChatCard, castMagia } from "./helpers/chat.mjs";

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
  // Usamos `??= {}` + Object.assign para não sobrescrever chaves já definidas
  // por outros módulos init (ex.: `reseedCompendia` de seed-compendia.mjs).
  game.tresdetalpha ??= {};
  Object.assign(game.tresdetalpha, {
    TresDeTAlphaActor,
    TresDeTAlphaItem,
    rollItemMacro,
    novaVantagem,
    novoPersonagem,
    postItemChatCard,
    castMagia
  });

  // Registra listeners globais nos cards de chat (botões Abrir ficha / Conjurar / etc).
  registerChatActions();

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

  // Intercepta o fluxo padrão de "Criar Personagem" pra oferecer o wizard.
  // Só age quando a chamada vem sem `type` pré-definido (caso típico do botão "+" da sidebar).
  const originalCreateDialog = TresDeTAlphaActor.createDialog.bind(TresDeTAlphaActor);
  TresDeTAlphaActor.createDialog = async function patchedCreateDialog(data = {}, options = {}) {
    if (data?.type || options?.bypassTdtWizard) return originalCreateDialog(data, options);
    const mode = await askActorCreationMode();
    if (mode === null) return null;
    if (mode === "wizard") return novoPersonagem();
    return originalCreateDialog(data, { ...options, bypassTdtWizard: true });
  };

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

  // Status effect customizado: "Perto da Morte" (p.26) — PV ≤ Resistência.
  // Para 0 PVs usamos o flag `defeated` nativo do Combatant (Foundry já aplica
  // o overlay de caveira no token automaticamente quando em combate).
  CONFIG.statusEffects.push({
    id: "pertoDaMorte",
    name: "Perto da Morte",
    img: "icons/svg/blood.svg"
  });

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
}

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));

  // Insere um botão "Criação guiada" no topo da sidebar de Actors.
  Hooks.on("renderActorDirectory", injectGuidedCreationButton);

  // Sincroniza status effects (Perto da Morte, Caído) sempre que PV muda.
  Hooks.on("updateActor", onActorPvChange);

  // Auto-desativa Active Effects marcados como `combatOnly` quando o combate termina.
  // Isso inclui vantagens como Aceleração, Arena, Ataque Especial, etc. que só
  // aplicam bônus enquanto ativas em combate.
  Hooks.on("deleteCombat", disableCombatOnlyEffects);

  Hooks.on("updateCombat", onCombatTurnAdvance);

  // Popula os compêndios do mundo com vantagens/desvantagens do Manual Core
  // na primeira abertura. Depois disso, o GM pode editar à vontade.
  await seedCompendia();
});

/**
 * Diálogo que pergunta ao usuário como quer criar o personagem:
 * com o wizard guiado ou em branco (fluxo padrão Foundry).
 * @returns {Promise<"wizard"|"standard"|null>} `null` se fechou/cancelou.
 */
async function askActorCreationMode() {
  const DialogV2 = foundry.applications.api.DialogV2;
  try {
    const choice = await DialogV2.wait({
      window: { title: "Criar personagem — 3D&T Alpha", icon: "fas fa-user-plus" },
      position: { width: 460 },
      classes: ["tdt-creation-choice"],
      content: `
        <div style="padding: 10px 4px; display: flex; flex-direction: column; gap: 10px;">
          <p style="margin: 0;">Como você quer criar esse ator?</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: var(--color-text-subtle, #777);">
            <li><strong>Guiado</strong> — distribui pontos, escolhe vantagens/desvantagens dos compêndios e cria a ficha pronta.</li>
            <li><strong>Em branco</strong> — fluxo padrão (só nome e tipo).</li>
          </ul>
        </div>
      `,
      buttons: [
        { action: "wizard",   label: "Com wizard guiado", icon: "fas fa-wand-magic-sparkles", default: true },
        { action: "standard", label: "Em branco",          icon: "fas fa-file" },
        { action: "cancel",   label: "Cancelar",           icon: "fas fa-xmark" }
      ],
      submit: (result) => result,
      rejectClose: false
    });
    if (choice === "cancel" || !choice) return null;
    return choice;
  } catch (_err) {
    return null;
  }
}

/**
 * Adiciona um botão "Criação guiada" no topo da sidebar de Actors.
 */
function injectGuidedCreationButton(app, element) {
  const root = element instanceof HTMLElement ? element : element?.[0];
  if (!root) return;
  if (root.querySelector(".tdt-sidebar-guided")) return; // idempotente
  const header = root.querySelector(".directory-header") ?? root.querySelector("header");
  if (!header) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tdt-sidebar-guided";
  btn.innerHTML = `<i class="fas fa-wand-magic-sparkles"></i> Criação guiada 3D&T`;
  btn.addEventListener("click", (ev) => {
    ev.preventDefault();
    novoPersonagem();
  });
  header.appendChild(btn);
}

/**
 * Reage a mudanças de PV do actor:
 *  - Aplica/remove o status "Perto da Morte" (PV > 0 e ≤ Resistência)
 *  - Marca/desmarca o(s) combatant(s) como `defeated` quando PV chega a 0
 *    (Foundry aplica overlay de caveira no token e rasga o nome no Combat Tracker)
 *
 * Gate: status effect roda no cliente que originou (se tem ownership).
 *       Defeated roda só no GM ativo primário (pra ter permissão e evitar duplicação).
 */
async function onActorPvChange(actor, changes, _options, userId) {
  if (actor.type !== "personagem" && actor.type !== "npc") return;

  const newPv = foundry.utils.getProperty(changes, "system.vida.value");
  if (newPv === undefined || newPv === null) return;

  const pv = Number(newPv);
  const resistencia = Number(actor.system?.abilities?.resistencia?.total ?? 0);

  // ==== Perto da Morte (status effect) ====
  // Processa no cliente que originou E tem ownership.
  if (game.user.id === userId && actor.isOwner) {
    const shouldBePerto = pv > 0 && resistencia > 0 && pv <= resistencia;
    const isPerto = actor.statuses?.has("pertoDaMorte") ?? false;
    if (shouldBePerto !== isPerto) {
      try { await actor.toggleStatusEffect("pertoDaMorte", { active: shouldBePerto }); }
      catch (err) { console.warn("3D&T | Perto da Morte:", err); }
    }
  }

  // ==== Defeated no Combat Tracker ====
  // Só roda no GM ativo primário: (a) só ele tem permissão pra atualizar combatants
  // de outros actors; (b) evita duplicação em cenários com múltiplos GMs conectados.
  const primaryGM = game.users?.activeGM;
  if (primaryGM && primaryGM !== game.user) return;
  if (!primaryGM && !game.user.isGM) return; // sem GM ativo: qualquer GM processa; sem GM, nada.

  const shouldBeDefeated = pv <= 0;
  const combatants = findActiveCombatants(actor);

  if (combatants.length === 0 && shouldBeDefeated) {
    console.debug(`3D&T | ${actor.name} chegou a 0 PVs mas não está em combate ativo — defeated não aplica.`);
    return;
  }

  for (const combatant of combatants) {
    if (combatant.defeated === shouldBeDefeated) continue;
    try {
      await combatant.update({ defeated: shouldBeDefeated });
      console.debug(`3D&T | combatant "${combatant.name}" → defeated=${shouldBeDefeated}`);
    } catch (err) {
      console.error(`3D&T | falha ao marcar defeated em "${combatant.name}":`, err);
    }
  }
}

/**
 * Retorna todos os combatants em combates ativos que referenciam o actor.
 * Lida com linked (mesma id) e unlinked tokens (synthetic actor).
 */
function findActiveCombatants(actor) {
  const matches = [];
  const actorId = actor.id;
  const actorUuid = actor.uuid;
  const tokenId = actor.token?.id ?? null;

  for (const combat of game.combats?.contents ?? []) {
    for (const c of combat.combatants) {
      // 1) Mesmo objeto de actor (raro mas exato)
      if (c.actor === actor) { matches.push(c); continue; }
      // 2) Match por id de actor (funciona pra linked e synthetic)
      if (c.actor?.id === actorId) { matches.push(c); continue; }
      // 3) Match por UUID (mais robusto)
      if (c.actor?.uuid === actorUuid) { matches.push(c); continue; }
      // 4) Match por id do world actor salvo no combatant
      if (c.actorId === actorId) { matches.push(c); continue; }
      // 5) Match por token id (unlinked)
      if (tokenId && c.tokenId === tokenId) { matches.push(c); continue; }
    }
  }
  return matches;
}

/**
 * Ao apagar um Combat (encerrando o encontro), percorre os actors envolvidos
 * e desativa todo ActiveEffect marcado com flag `combatOnly`.
 */
async function disableCombatOnlyEffects(combat) {
  if (!game.user?.isGM) return;
  const actors = new Set();
  for (const combatant of combat.combatants.values()) {
    if (combatant.actor) actors.add(combatant.actor);
  }
  for (const actor of actors) {
    const toDisable = [];
    for (const effect of actor.effects) {
      if (effect.flags?.[SYSTEM_ID]?.combatOnly && !effect.disabled) {
        toDisable.push({ _id: effect.id, disabled: true });
      }
    }
    if (toDisable.length) {
      await actor.updateEmbeddedDocuments("ActiveEffect", toDisable);
    }
  }
}

/**
 * Ao avançar de turno/round no combate, dreena PMs de vantagens ativáveis
 * com `custoPMsPorTurno > 0`. Se o personagem não tem PMs suficientes, a
 * vantagem é automaticamente desativada.
 *
 * Processa só no GM ativo primário (permissão + evitar duplicação).
 */
async function onCombatTurnAdvance(combat, updates, _options, _userId) {
  const primaryGM = game.users?.activeGM;
  if (primaryGM && primaryGM !== game.user) return;
  if (!primaryGM && !game.user.isGM) return;
  // Só processa quando turn ou round avançou.
  if (!("turn" in updates) && !("round" in updates)) return;

  const actors = new Set();
  for (const combatant of combat.combatants.values()) {
    if (combatant.actor) actors.add(combatant.actor);
  }

  for (const actor of actors) {
    for (const item of actor.items) {
      if (item.system?.mode !== "activatable") continue;
      const drain = Number(item.system?.activation?.custoPMsPorTurno ?? 0);
      if (drain <= 0) continue;
      // Item ativo? (algum effect transferido dele está enabled)
      // V13+: parent aponta pro item; origin não é auto-setado em transferred effects.
      const activeEffects = actor.effects.filter(e =>
        (e.parent?.id === item.id || e.origin === item.uuid) && !e.disabled
      );
      if (!activeEffects.length) continue;

      const currentPm = Number(actor.system?.magia?.value ?? 0);
      if (currentPm < drain) {
        // Sem PMs — desativa automaticamente.
        await actor.updateEmbeddedDocuments("ActiveEffect",
          activeEffects.map(e => ({ _id: e.id, disabled: true }))
        );
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: `<div class="tdt-chat-card tdt-chat-card--deactivate">
            <strong>${actor.name}</strong> ficou sem PMs — <em>${item.name}</em> desativou-se sozinha.
          </div>`
        });
      } else {
        await actor.update({ "system.magia.value": currentPm - drain });
      }
    }
  }
}

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
