/**
 * Pré-carrega os partials Handlebars usados pelas fichas.
 *
 * Em Foundry V14 a função canônica é `foundry.applications.handlebars.loadTemplates`.
 * Mantemos compatibilidade com a global `loadTemplates` caso o runtime seja mais antigo.
 */
export const preloadHandlebarsTemplates = async function () {
  const paths = [
    // Partials da ficha de Actor.
    "systems/3det-foundry-rework/templates/actor/parts/actor-desvantagens.html",
    "systems/3det-foundry-rework/templates/actor/parts/actor-effects.html",
    "systems/3det-foundry-rework/templates/actor/parts/actor-features.html",
    "systems/3det-foundry-rework/templates/actor/parts/actor-items.html",
    "systems/3det-foundry-rework/templates/actor/parts/actor-magias.html",
    "systems/3det-foundry-rework/templates/actor/parts/actor-pericias.html",
    "systems/3det-foundry-rework/templates/actor/parts/actor-spells.html",
    "systems/3det-foundry-rework/templates/actor/parts/actor-vantagemunica.html",
    "systems/3det-foundry-rework/templates/actor/parts/actor-vantagens.html"
  ];
  const loader = foundry.applications?.handlebars?.loadTemplates ?? globalThis.loadTemplates;
  return loader(paths);
};
