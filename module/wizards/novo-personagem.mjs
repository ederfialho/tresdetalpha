/**
 * Wizard de criação de personagem 3D&T Alpha.
 *
 * Oferece uma UI única (DialogV2) com:
 *  - Identidade (nome + conceito)
 *  - Orçamento de pontos (escala de poder)
 *  - Distribuição de características (máx. 5 cada na criação — regra p.23)
 *  - Seleção de vantagens e desvantagens a partir dos compêndios do mundo
 *  - Contador de pontos em tempo real
 *
 * Ao confirmar, cria o Actor, embute Items a partir dos compêndios e abre a ficha.
 *
 * Uso:
 *   game.tresdetalpha.novoPersonagem()
 */

const VANTAGENS_PACK = "world.tresdetalpha-vantagens";
const DESVANTAGENS_PACK = "world.tresdetalpha-desvantagens";

const ESCALAS = [
  { key: "iniciante",   label: "Iniciante",   budget: 5 },
  { key: "novato",      label: "Novato",      budget: 10 },
  { key: "lutador",     label: "Lutador",     budget: 15 },
  { key: "aventureiro", label: "Aventureiro", budget: 20 },
  { key: "veterano",    label: "Veterano",    budget: 30 },
  { key: "mestre",      label: "Mestre",      budget: 50 }
];

const ABILITIES = [
  { key: "forca",       label: "Força" },
  { key: "habilidade",  label: "Habilidade" },
  { key: "resistencia", label: "Resistência" },
  { key: "armadura",    label: "Armadura" },
  { key: "poderDeFogo", label: "PdF" }
];

const MAX_ABILITY_ON_CREATE = 5;
const MAX_DESVANTAGENS_POINTS = 6;

export async function novoPersonagem() {
  const [vPack, dPack] = await loadCompendia();

  const vItems = vPack ? (await vPack.getDocuments()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")) : [];
  const dItems = dPack ? (await dPack.getDocuments()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")) : [];

  const content = buildContent(vItems, dItems);

  const DialogV2 = foundry.applications.api.DialogV2;
  const result = await DialogV2.prompt({
    window: { title: "Criação de Personagem — 3D&T Alpha", icon: "fas fa-user-plus" },
    position: { width: 760, height: 720 },
    content,
    ok: {
      label: "Criar personagem",
      icon: "fas fa-check",
      callback: (_ev, _button, dialog) => extractData(dialog, vItems, dItems)
    },
    render: (_ev, dialog) => wireUp(dialog, vItems, dItems),
    rejectClose: false,
    classes: ["tdt-wizard-dialog"]
  });

  if (!result || !result.nome) return null;
  return await createActorFromData(result);
}

/* -------------------------------------------- */
/*  UI build                                    */
/* -------------------------------------------- */

function buildContent(vItems, dItems) {
  const escalasHtml = ESCALAS.map((e, i) => `
    <option value="${e.key}" data-budget="${e.budget}" ${i === 1 ? "selected" : ""}>${e.label} (${e.budget} pt)</option>
  `).join("");

  const abilitiesHtml = ABILITIES.map((a) => `
    <label class="tdt-wiz-ability">
      <span>${a.label}</span>
      <input type="number" name="caract.${a.key}" value="0" min="0" max="${MAX_ABILITY_ON_CREATE}" data-role="ability" />
    </label>
  `).join("");

  const itemList = (items, kind) => items.map((it) => {
    const custo = Number(it.system?.custo ?? 0);
    const categoria = it.system?.categoria ?? "";
    return `
      <label class="tdt-wiz-item" data-id="${it.id}" data-custo="${custo}" data-kind="${kind}">
        <input type="checkbox" name="${kind}" value="${it.id}" data-role="pick" />
        <span class="tdt-wiz-item-name">${it.name}</span>
        ${categoria ? `<span class="tdt-wiz-item-tag">${categoria}</span>` : ""}
        <span class="tdt-wiz-item-cost">${kind === "desvantagem" ? "−" : ""}${custo} pt</span>
      </label>
    `;
  }).join("");

  return `
    <div class="tdt-wizard tdt-wizard--personagem">

      <section class="tdt-wiz-section">
        <h3>1. Identidade</h3>
        <div class="tdt-wizard-row">
          <label>Nome
            <input type="text" name="nome" placeholder="Nome do herói" required />
          </label>
          <label>Escala de poder
            <select name="escala" data-role="escala">${escalasHtml}</select>
          </label>
        </div>
        <label>Conceito / história inicial
          <textarea name="conceito" rows="2" placeholder="Quem é esse personagem? Origem, motivação, arquétipo..."></textarea>
        </label>
      </section>

      <section class="tdt-wiz-section">
        <h3>2. Características <small>— máx. 5 cada na criação</small></h3>
        <div class="tdt-wiz-abilities">${abilitiesHtml}</div>
      </section>

      <section class="tdt-wiz-section">
        <h3>3. Vantagens <small>— clique pra selecionar</small></h3>
        <div class="tdt-wiz-filter">
          <input type="text" placeholder="Filtrar vantagens..." data-role="filter" data-target="vantagens" />
        </div>
        <div class="tdt-wiz-list" data-role="list-vantagens">
          ${vItems.length ? itemList(vItems, "vantagem") : `<p class="tdt-wiz-empty">Compêndio 'Vantagens' vazio. Re-abra o mundo ou rode <code>game.tresdetalpha.reseedCompendia()</code>.</p>`}
        </div>
      </section>

      <section class="tdt-wiz-section">
        <h3>4. Desvantagens <small>— devolvem pontos (máx. ${MAX_DESVANTAGENS_POINTS} pt)</small></h3>
        <div class="tdt-wiz-filter">
          <input type="text" placeholder="Filtrar desvantagens..." data-role="filter" data-target="desvantagens" />
        </div>
        <div class="tdt-wiz-list" data-role="list-desvantagens">
          ${dItems.length ? itemList(dItems, "desvantagem") : `<p class="tdt-wiz-empty">Compêndio 'Desvantagens' vazio.</p>`}
        </div>
      </section>

      <aside class="tdt-wiz-budget" data-role="budget">
        <div class="tdt-wiz-budget-main">
          <span class="tdt-wiz-budget-label">Disponível</span>
          <span class="tdt-wiz-budget-remaining" data-role="remaining">10</span>
          <span class="tdt-wiz-budget-sep">/</span>
          <span data-role="total">10</span>
          <span class="tdt-wiz-budget-unit">pontos</span>
        </div>
        <div class="tdt-wiz-budget-parts">
          <span>Caract. <strong data-role="parts-abilities">0</strong></span>
          <span>Vantagens <strong data-role="parts-vantagens">0</strong></span>
          <span>Desvantagens <strong data-role="parts-desvantagens">0</strong></span>
        </div>
      </aside>

    </div>
  `;
}

/* -------------------------------------------- */
/*  Estado reativo                              */
/* -------------------------------------------- */

function wireUp(dialog, vItems, dItems) {
  const root = dialog.element;
  const $ = (sel, ctx = root) => ctx.querySelector(sel);
  const $$ = (sel, ctx = root) => Array.from(ctx.querySelectorAll(sel));

  const recompute = () => {
    const escalaKey = $("[data-role='escala']").value;
    const escala = ESCALAS.find((e) => e.key === escalaKey) ?? ESCALAS[1];
    const budget = escala.budget;

    let absAbilities = 0;
    for (const input of $$("[data-role='ability']")) {
      const v = Math.max(0, Math.min(MAX_ABILITY_ON_CREATE, Number(input.value) || 0));
      if (String(v) !== input.value) input.value = v;
      absAbilities += v;
    }

    let absVantagens = 0;
    for (const cb of $$("[data-role='pick']:checked")) {
      const parent = cb.closest(".tdt-wiz-item");
      if (parent.dataset.kind === "vantagem") {
        absVantagens += Number(parent.dataset.custo) || 0;
      }
    }

    let absDesvantagens = 0;
    for (const cb of $$("[data-role='pick']:checked")) {
      const parent = cb.closest(".tdt-wiz-item");
      if (parent.dataset.kind === "desvantagem") {
        absDesvantagens += Number(parent.dataset.custo) || 0;
      }
    }
    // Impõe o limite de desvantagens na criação (−6).
    const desvantagensCapped = Math.min(absDesvantagens, MAX_DESVANTAGENS_POINTS);

    const spent = absAbilities + absVantagens - desvantagensCapped;
    const remaining = budget - spent;

    $("[data-role='total']").textContent = String(budget);
    $("[data-role='remaining']").textContent = String(remaining);
    $("[data-role='parts-abilities']").textContent = String(absAbilities);
    $("[data-role='parts-vantagens']").textContent = String(absVantagens);
    $("[data-role='parts-desvantagens']").textContent = `−${desvantagensCapped}${absDesvantagens > desvantagensCapped ? ` (de −${absDesvantagens})` : ""}`;

    const budgetEl = $("[data-role='budget']");
    budgetEl.classList.toggle("is-over", remaining < 0);
    budgetEl.classList.toggle("is-under", remaining > 0);
    budgetEl.classList.toggle("is-ok", remaining === 0);
  };

  // Filtros de lista.
  for (const filter of $$("[data-role='filter']")) {
    filter.addEventListener("input", (ev) => {
      const target = ev.currentTarget.dataset.target;
      const query = ev.currentTarget.value.trim().toLowerCase();
      const list = $(`[data-role='list-${target}']`);
      if (!list) return;
      for (const card of list.querySelectorAll(".tdt-wiz-item")) {
        const txt = card.textContent.toLowerCase();
        card.style.display = query === "" || txt.includes(query) ? "" : "none";
      }
    });
  }

  // Qualquer mudança recalcula.
  root.addEventListener("change", recompute);
  root.addEventListener("input", (ev) => {
    if (ev.target.dataset.role === "ability") recompute();
  });

  recompute();
}

/* -------------------------------------------- */
/*  Extração + criação                          */
/* -------------------------------------------- */

function extractData(dialog, vItems, dItems) {
  const root = dialog.element;
  const get = (name) => root.querySelector(`[name="${name}"]`)?.value ?? "";
  const escalaKey = get("escala");
  const escala = ESCALAS.find((e) => e.key === escalaKey) ?? ESCALAS[1];

  const abilities = {};
  for (const a of ABILITIES) {
    abilities[a.key] = Math.max(0, Math.min(MAX_ABILITY_ON_CREATE, Number(get(`caract.${a.key}`)) || 0));
  }

  const pickedVantagemIds = Array.from(root.querySelectorAll('input[name="vantagem"]:checked')).map(cb => cb.value);
  const pickedDesvantagemIds = Array.from(root.querySelectorAll('input[name="desvantagem"]:checked')).map(cb => cb.value);

  const pickedVantagens = vItems.filter(it => pickedVantagemIds.includes(it.id));
  const pickedDesvantagens = dItems.filter(it => pickedDesvantagemIds.includes(it.id));

  return {
    nome: get("nome").trim(),
    conceito: get("conceito").trim(),
    escala,
    abilities,
    vantagens: pickedVantagens,
    desvantagens: pickedDesvantagens
  };
}

async function createActorFromData(data) {
  const systemData = {
    pontos: data.escala.budget,
    biography: data.conceito ? `<p>${foundry.utils.escapeHTML(data.conceito)}</p>` : "",
    abilities: {
      forca:       { value: data.abilities.forca,       bonus: 0, total: data.abilities.forca },
      habilidade:  { value: data.abilities.habilidade,  bonus: 0, total: data.abilities.habilidade },
      resistencia: { value: data.abilities.resistencia, bonus: 0, total: data.abilities.resistencia },
      armadura:    { value: data.abilities.armadura,    bonus: 0, total: data.abilities.armadura },
      poderDeFogo: { value: data.abilities.poderDeFogo, bonus: 0, total: data.abilities.poderDeFogo }
    },
    vida: { value: Math.max(data.abilities.resistencia * 5, 1), bonus: 0, min: 0, max: Math.max(data.abilities.resistencia * 5, 1) },
    magia: { value: Math.max(data.abilities.resistencia * 5, 1), bonus: 0, min: 0, max: Math.max(data.abilities.resistencia * 5, 1) },
    experiencia: { value: 0, min: 0, max: 0 }
  };

  const actor = await Actor.create({
    name: data.nome,
    type: "personagem",
    img: "icons/svg/mystery-man.svg",
    system: systemData
  });

  if (!actor) {
    ui.notifications.error("Falha ao criar o personagem.");
    return null;
  }

  // Clona vantagens/desvantagens selecionadas (com seus ActiveEffects embutidos).
  const toEmbed = [];
  for (const item of [...data.vantagens, ...data.desvantagens]) {
    const raw = item.toObject();
    delete raw._id; // Foundry gera novo _id ao embutir.
    toEmbed.push(raw);
  }
  if (toEmbed.length) {
    await actor.createEmbeddedDocuments("Item", toEmbed);
  }

  actor.sheet.render(true);
  ui.notifications.info(`Personagem "${data.nome}" criado.`);
  return actor;
}

/* -------------------------------------------- */
/*  Utilidades                                  */
/* -------------------------------------------- */

async function loadCompendia() {
  const vPack = game.packs.get(VANTAGENS_PACK);
  const dPack = game.packs.get(DESVANTAGENS_PACK);
  if (!vPack || !dPack) {
    ui.notifications.warn("Compêndios de vantagens/desvantagens não encontrados. Rode game.tresdetalpha.reseedCompendia() se necessário.");
  }
  return [vPack, dPack];
}
