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
    rollData.item = foundry.utils.deepClone(this.system);
    return rollData;
  }

  /**
   * Rolada padrão disparada ao clicar na imagem do item na ficha.
   * - Sem fórmula: envia uma mensagem com a descrição.
   * - Com fórmula: cria um `Roll`, avalia e despacha para o chat.
   * @returns {Promise<ChatMessage|Roll|undefined>}
   */
  async roll() {
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");
    const label = `[${this.type}] ${this.name}`;

    if (!this.system.formula) {
      return ChatMessage.create({
        speaker,
        rollMode,
        flavor: label,
        content: this.system.description ?? ""
      });
    }

    const rollData = this.getRollData();
    const roll = new Roll(rollData.item.formula, rollData);
    await roll.evaluate();
    await roll.toMessage({ speaker, rollMode, flavor: label });
    return roll;
  }
}
