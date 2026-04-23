/**
 * Gerenciamento de Active Effects via botões na ficha.
 *
 * Atualizado para Foundry V14:
 *  - `ActiveEffect#label` → `ActiveEffect#name`
 *  - `ActiveEffect#icon`  → `ActiveEffect#img`
 *  - `ActiveEffect#changes` agora vive em `system.changes` (não usado aqui diretamente)
 *  - `origin` é `DocumentUUIDField` (já funcionava com string UUID)
 *
 * @param {MouseEvent} event   Click no botão de controle
 * @param {Actor|Item} owner   Documento dono do efeito
 */
export function onManageActiveEffect(event, owner) {
  event.preventDefault();
  const a = event.currentTarget;
  const li = a.closest("li");
  const effect = li?.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;

  switch (a.dataset.action) {
    case "create":
      return owner.createEmbeddedDocuments("ActiveEffect", [{
        name: game.i18n.localize("TRESDETALPHA.Efeito.novo") || "Novo Efeito",
        img: "icons/svg/aura.svg",
        origin: owner.uuid,
        "duration.rounds": li?.dataset.effectType === "temporary" ? 1 : undefined,
        disabled: li?.dataset.effectType === "inactive"
      }]);
    case "edit":
      return effect?.sheet.render(true);
    case "delete":
      return effect?.deleteDialog();
    case "toggle":
      return effect?.update({ disabled: !effect.disabled });
  }
}

/**
 * Agrupa Active Effects em categorias (temporários, passivos, inativos) pra renderização.
 * @param {Collection<ActiveEffect>|ActiveEffect[]} effects
 * @returns {object}
 */
export function prepareActiveEffectCategories(effects) {
  const categories = {
    temporary: { type: "temporary", label: "Efeito(s) Temporário(s)", effects: [] },
    passive:   { type: "passive",   label: "Efeito(s) Passivo(s)",    effects: [] },
    inactive:  { type: "inactive",  label: "Efeito(s) Inativo(s)",    effects: [] }
  };

  for (const effect of effects) {
    if (effect.disabled) categories.inactive.effects.push(effect);
    else if (effect.isTemporary) categories.temporary.effects.push(effect);
    else categories.passive.effects.push(effect);
  }
  return categories;
}
