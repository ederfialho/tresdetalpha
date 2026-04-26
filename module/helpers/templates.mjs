/**
 * Pré-carrega os partials Handlebars usados pelas fichas.
 *
 * Em Foundry V14 a função canônica é `foundry.applications.handlebars.loadTemplates`.
 * Mantemos compatibilidade com a global `loadTemplates` caso o runtime seja mais antigo.
 */
export const preloadHandlebarsTemplates = async function () {
  const paths = [
    "systems/tresdetalpha/templates/actor/parts/actor-effects.html"
  ];
  const loader = foundry.applications?.handlebars?.loadTemplates ?? globalThis.loadTemplates;
  return loader(paths);
};
