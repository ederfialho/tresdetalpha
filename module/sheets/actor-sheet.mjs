import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";
import { TRESDETALPHA } from "../helpers/config.mjs";
import { novaVantagem } from "../wizards/nova-vantagem.mjs";
import { rollAbilityTest, rollFormula, rollAttack } from "../helpers/chat.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Ficha de Actor para 3D&T Alpha.
 * Baseada em ApplicationV2 + HandlebarsApplicationMixin (Foundry V14).
 *
 * Abordagem:
 *  - Uma PART por tipo (`personagem`, `npc`); `_configureRenderParts` escolhe a correspondente
 *    ao Actor atual em tempo de renderização.
 *  - Tabs (marcação V1 — `.sheet-tabs .item[data-tab]`) e os botões de item/effect
 *    são amarrados manualmente em `_onRender`. Optamos por isso em vez de
 *    `DEFAULT_OPTIONS.actions` pra reaproveitar os templates existentes sem alterar markup.
 */
export class TresDeTAlphaActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["tresdetalpha", "sheet", "actor"],
    position: { width: 760, height: 820 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  /** @override */
  static PARTS = {
    personagem: {
      template: "systems/3det-foundry-rework/templates/actor/actor-personagem-sheet.html"
    },
    npc: {
      template: "systems/3det-foundry-rework/templates/actor/actor-npc-sheet.html"
    }
  };

  /* -------------------------------------------- */
  /*  Render lifecycle                            */
  /* -------------------------------------------- */

  /** Só renderiza a PART que corresponde ao tipo deste Actor. @override */
  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    const type = this.document.type;
    if (parts[type]) return { [type]: parts[type] };
    return parts;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.actor    = this.document;
    context.system   = this.document.system;
    context.flags    = this.document.flags;
    context.config   = CONFIG.TRESDETALPHA ?? TRESDETALPHA;
    context.rollData = this.document.getRollData();
    context.editable = this.isEditable;
    context.owner    = this.document.isOwner;
    context.cssClass = this.isEditable ? "editable" : "locked";

    // Labels localizadas das características.
    if (context.system.abilities) {
      for (const [key, ability] of Object.entries(context.system.abilities)) {
        ability.label = game.i18n.localize(CONFIG.TRESDETALPHA.abilities[key]) ?? key;
      }
    }

    // Percentuais pras barrinhas de PV e PM.
    const safePct = (value, max) => {
      const v = Number(value) || 0;
      const m = Number(max) || 0;
      if (m <= 0) return 0;
      return Math.max(0, Math.min(100, Math.round((v / m) * 100)));
    };
    context.vidaPercent  = safePct(context.system.vida?.value,  context.system.vida?.max);
    context.magiaPercent = safePct(context.system.magia?.value, context.system.magia?.max);

    // Movimento em metros por turno de combate (3D&T Alpha p.69).
    //  • Velocidade máxima = max(Habilidade × 10, 5) m/turno
    //  • Aceleração adiciona H+1 ⇒ +10m; Teleporte H+2 ⇒ +20m
    //  • Nado = metade; Escalada = um quarto; Voo = igual (tudo derivado na UI)
    const habilidade = Number(context.system.abilities?.habilidade?.total ?? 0);
    const baseMov = Math.max(habilidade * 10, 5);

    // Detecta vantagens de mobilidade cadastradas nos itens, de forma tolerante a capitalização.
    // Usa word-boundary regex pra evitar matches espúrios (ex: "voo" dentro de "Devoto").
    const hasVantagem = (name) => {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      return this.document.items.some(
        (i) => (i.type === "vantagem" || i.type === "vantagemUnica")
            && typeof i.name === "string"
            && regex.test(i.name)
      );
    };
    let bonusMov = 0;
    const bonuses = [];
    if (hasVantagem("aceleração") || hasVantagem("aceleracao")) { bonusMov += 10; bonuses.push("Aceleração +10m"); }
    if (hasVantagem("teleporte")) { bonusMov += 20; bonuses.push("Teleporte +20m"); }

    context.movimento = {
      combate: baseMov + bonusMov,
      nado:    Math.max(Math.floor((baseMov + bonusMov) / 2), 3),
      escalada:Math.max(Math.floor((baseMov + bonusMov) / 4), 2),
      voo:     hasVantagem("voo") ? baseMov + bonusMov : null,
      viagem:  Math.max(habilidade * 10, 5), // km/h fora de combate
      bonuses: bonuses.join(" · ") || null
    };

    // Opções dos selects de tipo de dano (F e PdF). Consumido pelo helper `{{selectOptions}}`.
    context.dano = {
      forca: { "Corte": "Corte", "Esmagamento": "Esmagamento", "Perfuração": "Perfuração" },
      pdf:   { "Elétrico": "Elétrico", "Fogo": "Fogo", "Químico": "Químico", "Sônico": "Sônico" }
    };

    // Items agrupados por tipo.
    this._prepareItems(context);

    // Active Effects categorizadas.
    context.effects = prepareActiveEffectCategories(this.document.effects);

    return context;
  }

  /**
   * Divide os itens do Actor em buckets por tipo. Mantém as chaves legadas
   * (`vantagems`, `desvantagems`) pra compatibilidade com os partials existentes.
   * @private
   */
  _prepareItems(context) {
    const buckets = {
      vantagems: [],
      desvantagems: [],
      vantagemUnica: [],
      pericias: [],
      magias: [],
      objetosMagicos: []
    };

    for (const item of this.document.items) {
      switch (item.type) {
        case "vantagem":      buckets.vantagems.push(item); break;
        case "desvantagem":   buckets.desvantagems.push(item); break;
        case "vantagemUnica": buckets.vantagemUnica.push(item); break;
        case "pericia":       buckets.pericias.push(item); break;
        case "magia":         buckets.magias.push(item); break;
        case "objetoMagico":  buckets.objetosMagicos.push(item); break;
      }
    }

    Object.assign(context, buckets);
    context.spells = {}; // legado; alguns templates podem referenciar.
  }

  /** Liga todos os ouvintes manualmente; os templates usam seletores por classe (marcação V1). @override */
  _onRender(context, options) {
    super._onRender(context, options);
    const root = this.element;
    if (!root) return;

    // Tabs.
    this._activeTab ??= "features";
    for (const link of root.querySelectorAll(".sheet-tabs .item[data-tab]")) {
      link.addEventListener("click", (ev) => {
        ev.preventDefault();
        this._activateTab(ev.currentTarget.dataset.tab);
      });
    }
    this._activateTab(this._activeTab);

    if (!this.isEditable) return;

    // Criar item (a partir de um header com data-type).
    for (const el of root.querySelectorAll(".item-create")) {
      el.addEventListener("click", this._onItemCreate.bind(this));
    }

    // Editar item.
    for (const el of root.querySelectorAll(".item-edit")) {
      el.addEventListener("click", this._onItemEdit.bind(this));
    }

    // Apagar item.
    for (const el of root.querySelectorAll(".item-delete")) {
      el.addEventListener("click", this._onItemDelete.bind(this));
    }

    // Rolls genéricos (características, ataque, defesa, itens via `.rollable`).
    for (const el of root.querySelectorAll(".rollable")) {
      el.addEventListener("click", this._onRoll.bind(this));
    }

    // Controles de Active Effect (create/edit/delete/toggle via data-action no partial).
    for (const el of root.querySelectorAll(".effect-control")) {
      el.addEventListener("click", (ev) => onManageActiveEffect(ev, this.document));
    }

    // Botões do wizard "Nova vantagem (guiado)".
    for (const el of root.querySelectorAll(".tdt-wizard-btn[data-wizard-type]")) {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        const type = ev.currentTarget.dataset.wizardType;
        novaVantagem({ type, actor: this.document });
      });
    }

    // Drag de itens pra macros.
    if (this.document.isOwner) {
      for (const li of root.querySelectorAll("li.item")) {
        if (li.classList.contains("items-header") || li.classList.contains("inventory-header")) continue;
        li.setAttribute("draggable", "true");
        li.addEventListener("dragstart", (ev) => this._onDragStart?.(ev));
      }
    }
  }

  /* -------------------------------------------- */
  /*  Tabs (manual)                               */
  /* -------------------------------------------- */

  _activateTab(tab) {
    if (!tab) return;
    this._activeTab = tab;
    const root = this.element;
    if (!root) return;
    for (const el of root.querySelectorAll(".sheet-tabs .item[data-tab]")) {
      el.classList.toggle("active", el.dataset.tab === tab);
    }
    for (const el of root.querySelectorAll(".sheet-body .tab[data-tab]")) {
      el.classList.toggle("active", el.dataset.tab === tab);
    }
  }

  /* -------------------------------------------- */
  /*  Handlers                                    */
  /* -------------------------------------------- */

  async _onItemCreate(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const type = target.dataset.type;
    if (!type) return;
    const initial = foundry.utils.deepClone(target.dataset);
    delete initial.type;
    const localizedType = game.i18n.localize(`TYPES.Item.${type}`) || type.capitalize?.() || type;
    return Item.create({
      name: `Novo(a) ${localizedType}`,
      type,
      system: initial
    }, { parent: this.document });
  }

  _onItemEdit(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.document.items.get(li?.dataset.itemId);
    return item?.sheet?.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.document.items.get(li?.dataset.itemId);
    return item?.deleteDialog();
  }

  async _onRoll(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const dataset = target.dataset;

    // Roll de item: posta card rico no chat (botões: Abrir ficha, Conjurar pra magias).
    if (dataset.rollType === "item") {
      const li = target.closest(".item");
      const item = this.document.items.get(li?.dataset.itemId);
      return item?.roll();
    }

    // Ataque: dispara rollAttack que resolve FD dos alvos e mostra botão "Aplicar dano".
    // Shift+click abre dialog de múltiplos ataques.
    if (dataset.rollMode === "attack" && dataset.roll) {
      const askMulti = !!(event.shiftKey);
      return rollAttack(this.document, dataset.roll, dataset.label || "Ataque", { askMulti });
    }

    // Teste de característica: rola 1d6 contra o valor (sucesso se ≤ alvo e !=6).
    const abilityTarget = Number(dataset.target);
    if (dataset.roll === "1d6" && Number.isFinite(abilityTarget) && abilityTarget > 0) {
      return rollAbilityTest(this.document, dataset.label || "Característica", abilityTarget);
    }

    // Roll de fórmula livre (FD, etc.).
    if (dataset.roll) {
      return rollFormula(this.document, dataset.roll, dataset.label || "Rolagem");
    }
  }
}
