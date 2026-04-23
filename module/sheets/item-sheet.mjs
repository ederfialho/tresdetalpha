const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Ficha de Item para 3D&T Alpha.
 * ApplicationV2 + HandlebarsApplicationMixin.
 *
 * Uma PART por tipo de item — o `_configureRenderParts` seleciona a correta em runtime.
 */
export class TresDeTAlphaItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["tresdetalpha", "sheet", "item"],
    position: { width: 560, height: 560 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  /** @override */
  static PARTS = {
    vantagem:      { template: "systems/3det-foundry-rework/templates/item/item-vantagem-sheet.html" },
    desvantagem:   { template: "systems/3det-foundry-rework/templates/item/item-desvantagem-sheet.html" },
    vantagemUnica: { template: "systems/3det-foundry-rework/templates/item/item-vantagemUnica-sheet.html" },
    pericia:       { template: "systems/3det-foundry-rework/templates/item/item-pericia-sheet.html" },
    magia:         { template: "systems/3det-foundry-rework/templates/item/item-magia-sheet.html" },
    objetoMagico:  { template: "systems/3det-foundry-rework/templates/item/item-objetoMagico-sheet.html" },
    // Fallback genérico caso apareça um tipo inesperado.
    fallback:      { template: "systems/3det-foundry-rework/templates/item/item-sheet.html" }
  };

  /** @override */
  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    const type = this.document.type;
    if (parts[type]) return { [type]: parts[type] };
    return { fallback: parts.fallback };
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.document;
    context.system = this.document.system;
    context.flags = this.document.flags;
    context.editable = this.isEditable;
    context.owner = this.document.isOwner;
    context.cssClass = this.isEditable ? "editable" : "locked";

    // rollData pro editor de descrição e fórmulas embutidas.
    const actor = this.document.parent;
    context.rollData = actor ? actor.getRollData() : {};

    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    // Ganchos customizados futuros (ex: tabs dentro da ficha de item) vivem aqui.
  }
}
