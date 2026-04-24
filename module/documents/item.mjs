/**
 * Documento Item customizado do 3D&T Alpha.
 *
 * Os schemas de cada tipo de item estão em `module/data/_models.mjs`.
 * Aqui ficam comportamentos de alto nível — rolar o item, montar roll data, etc.
 *
 * @extends {Item}
 */
export class TresDeTAlphaItem extends Item {

  /**
   * Monta o contexto passado para fórmulas de Roll originadas deste item.
   * @override
   */
  getRollData() {
    if (!this.actor) return null;
    const rollData = this.actor.getRollData();
    rollData.item = this.system;
    return rollData;
  }

  get isActivable() {
    return ["activatable", "reaction"].includes(this.system?.mode);
  }

  get isActive() {
    const actor = this.actor;
    if (!actor || !this.isActivable) return false;
    // V13+: effects transferidos de items têm `parent` apontando pro item,
    // mas `origin` não é auto-setado. Checa os dois para robustez.
    return actor.effects.some(e =>
      (e.parent?.id === this.id || e.origin === this.uuid) && !e.disabled
    );
  }

  get isConditional() {
    return this.system?.mode === "conditional";
  }

  /**
   * Ao clicar no item na ficha: posta um card rico no chat com descrição,
   * chips de meta (categoria, custo, escola, etc.) e botões de ação
   * (Abrir ficha, Conjurar pra magias).
   */
  async roll() {
    const { postItemChatCard } = await import("../helpers/chat.mjs");
    return postItemChatCard(this);
  }
}
