/**
 * Wizard de criação de personagem 3D&T Alpha.
 *
 * Seções:
 *   1. Identidade (nome, escala, conceito)
 *   2. Raça (vantagem única, seleção única)
 *   3. Características (steppers +/−, máx 5 cada)
 *   4. Vantagens (multi-select, custo em pontos)
 *   5. Desvantagens (multi-select, cap de -6 pts)
 *   6. Perícias (multi-select, 2 pts cada)
 *   7. Magias (multi-select, filtradas pela vantagem de magia correspondente)
 *
 * Uso:
 *   game.tresdetalpha.novoPersonagem()
 */

const PACKS = {
  vantagens:       "world.tresdetalpha-vantagens",
  desvantagens:    "world.tresdetalpha-desvantagens",
  racas:           "world.tresdetalpha-vantagens-unicas",
  pericias:        "world.tresdetalpha-pericias",
  magias:          "world.tresdetalpha-magias"
};

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
const PERICIA_COST = 2;

/* Nomes das vantagens de magia (normalizados sem acento pra comparação). */
const MAGIC_VANTAGENS = {
  "magia branca":    ["Branca"],
  "magia elemental": ["Elemental"],
  "magia negra":     ["Negra"],
  "arcano":          ["Branca", "Elemental", "Negra"]
};

export async function novoPersonagem() {
  const { vItems, dItems, rItems, pItems, mItems } = await loadAllItems();

  const content = buildContent({ vItems, dItems, rItems, pItems, mItems });

  const DialogV2 = foundry.applications.api.DialogV2;
  const result = await DialogV2.prompt({
    window: { title: "Criação de Personagem — 3D&T Alpha", icon: "fas fa-user-plus", resizable: true },
    position: { width: 860, height: 860 },
    content,
    ok: {
      label: "Criar personagem",
      icon: "fas fa-check",
      callback: (_ev, _button, dialog) => extractData(dialog, { vItems, dItems, rItems, pItems, mItems })
    },
    render: (_ev, dialog) => wireUp(dialog, { vItems, dItems, rItems, pItems, mItems }),
    rejectClose: false,
    classes: ["tdt-wizard-dialog"]
  });

  if (!result || !result.nome) return null;
  return await createActorFromData(result);
}

/* -------------------------------------------- */
/*  Load                                         */
/* -------------------------------------------- */

async function loadAllItems() {
  const get = async (key) => {
    const pack = game.packs.get(PACKS[key]);
    if (!pack) return [];
    const docs = await pack.getDocuments();
    return docs.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  };

  const [vItems, dItems, rItems, pItems, mItems] = await Promise.all([
    get("vantagens"),
    get("desvantagens"),
    get("racas"),
    get("pericias"),
    get("magias")
  ]);

  if (!vItems.length || !dItems.length) {
    ui.notifications.warn("Compêndios de vantagens/desvantagens vazios. Rode game.tresdetalpha.rebuildCompendia() no console.");
  }

  return { vItems, dItems, rItems, pItems, mItems };
}

/* -------------------------------------------- */
/*  UI                                          */
/* -------------------------------------------- */

function buildContent({ vItems, dItems, rItems, pItems, mItems }) {
  const escalasHtml = ESCALAS.map((e, i) => `
    <option value="${e.key}" ${i === 1 ? "selected" : ""}>${e.label} (${e.budget} pt)</option>
  `).join("");

  const steppersHtml = ABILITIES.map((a) => `
    <div class="tdt-stepper" data-ability="${a.key}">
      <div class="tdt-stepper-label">${a.label}</div>
      <div class="tdt-stepper-row">
        <button type="button" class="tdt-step-btn" data-action="dec" aria-label="Diminuir ${a.label}">−</button>
        <output class="tdt-stepper-value" data-role="ability-value">0</output>
        <button type="button" class="tdt-step-btn" data-action="inc" aria-label="Aumentar ${a.label}">+</button>
      </div>
      <input type="hidden" name="caract.${a.key}" value="0" data-role="ability" />
    </div>
  `).join("");

  const itemList = (items, kind, inputType = "checkbox") => items.map((it) => {
    const custo = Number(it.system?.custo ?? 0) || 0;
    const categoria = it.system?.categoria ?? "";
    const escola = it.system?.escola ?? "";
    const costLabel = kind === "pericia" ? `${PERICIA_COST} pt`
      : kind === "magia" ? (escola || "mágica")
      : `${kind === "desvantagem" ? "−" : ""}${custo} pt`;
    return `
      <label class="tdt-wiz-item" data-id="${it.id}" data-custo="${custo}" data-kind="${kind}" data-escola="${escapeAttr(escola)}">
        <input type="${inputType}" name="${kind}" value="${it.id}" data-role="pick" />
        <span class="tdt-wiz-item-name">${it.name}</span>
        ${categoria ? `<span class="tdt-wiz-item-tag">${categoria}</span>` : ""}
        <span class="tdt-wiz-item-cost">${costLabel}</span>
      </label>
    `;
  }).join("");

  const section = (num, title, smallHint, body) => `
    <section class="tdt-wiz-section">
      <h3>${num}. ${title} ${smallHint ? `<small>— ${smallHint}</small>` : ""}</h3>
      ${body}
    </section>
  `;

  const pickerBlock = (kind, items, smallHint) => {
    const pluralLabels = { vantagem: "vantagens", desvantagem: "desvantagens", raca: "racas", pericia: "pericias", magia: "magias" };
    const kindPlural = pluralLabels[kind] || kind;
    const filterHtml = `<input type="text" class="tdt-wiz-filter-input" placeholder="Filtrar ${kindPlural}..." data-role="filter" data-target="${kindPlural}" />`;
    const empty = `<p class="tdt-wiz-empty">Compêndio vazio. Rode <code>game.tresdetalpha.rebuildCompendia()</code>.</p>`;
    const inputType = kind === "raca" ? "radio" : "checkbox";
    const listHtml = items.length ? itemList(items, kind, inputType) : empty;
    return `
      ${filterHtml}
      <div class="tdt-wiz-list" data-role="list-${kindPlural}">${listHtml}</div>
      <div class="tdt-wiz-detail" data-role="detail-${kindPlural}">
        <p class="tdt-wiz-detail-hint">Passe o mouse ou clique num item pra ver detalhes.</p>
      </div>
    `;
  };

  return `
    <div class="tdt-wizard tdt-wizard--personagem">

      <div class="tdt-wiz-budget-bar" data-role="budget">
        <div class="tdt-wiz-budget-main">
          <span class="tdt-wiz-budget-label">Pontos disponíveis</span>
          <span class="tdt-wiz-budget-remaining" data-role="remaining">10</span>
          <span class="tdt-wiz-budget-sep">/</span>
          <span data-role="total">10</span>
        </div>
        <div class="tdt-wiz-budget-parts">
          <span>Raça <strong data-role="parts-raca">0</strong></span>
          <span>Caract <strong data-role="parts-abilities">0</strong></span>
          <span>Vant <strong data-role="parts-vantagens">0</strong></span>
          <span>Desv <strong data-role="parts-desvantagens">0</strong></span>
          <span>Perícias <strong data-role="parts-pericias">0</strong></span>
        </div>
      </div>

      ${section(1, "Identidade", "", `
        <div class="tdt-wizard-row">
          <label>Nome
            <input type="text" name="nome" placeholder="Nome do herói" required />
          </label>
          <label>Escala de poder
            <select name="escala" data-role="escala">${escalasHtml}</select>
          </label>
        </div>
        <label>Conceito
          <textarea name="conceito" rows="2" placeholder="Origem, motivação, arquétipo..."></textarea>
        </label>
      `)}

      ${section(2, "Raça / Vantagem Única", "escolha uma (ou nenhuma = humano)", pickerBlock("raca", rItems))}

      ${section(3, "Características", "use os botões +/−, máx. 5 cada", `
        <div class="tdt-steppers">${steppersHtml}</div>
      `)}

      ${section(4, "Vantagens", "multi-select", pickerBlock("vantagem", vItems))}

      ${section(5, "Desvantagens", `devolvem pontos, máx. ${MAX_DESVANTAGENS_POINTS} pt`, pickerBlock("desvantagem", dItems))}

      ${section(6, "Perícias", `${PERICIA_COST} pt cada`, pickerBlock("pericia", pItems))}

      ${section(7, "Magias", "desbloqueiam via vantagens de magia correspondentes", pickerBlock("magia", mItems))}

    </div>
  `;
}

function escapeAttr(s) {
  return String(s ?? "").replace(/"/g, "&quot;");
}

/* -------------------------------------------- */
/*  Estado reativo                              */
/* -------------------------------------------- */

function wireUp(dialog, items) {
  const { vItems, dItems, rItems, pItems, mItems } = items;
  const root = dialog.element;
  const $ = (sel, ctx = root) => ctx.querySelector(sel);
  const $$ = (sel, ctx = root) => Array.from(ctx.querySelectorAll(sel));

  const okButton = dialog.element.querySelector("button[data-action='ok']");

  const indexById = (arr) => Object.fromEntries(arr.map((x) => [String(x.id), x]));
  const vIndex = indexById(vItems);
  const dIndex = indexById(dItems);
  const rIndex = indexById(rItems);
  const pIndex = indexById(pItems);
  const mIndex = indexById(mItems);

  /* ----- Recompute ----- */
  const recompute = () => {
    const escalaKey = $("[data-role='escala']").value;
    const escala = ESCALAS.find((e) => e.key === escalaKey) ?? ESCALAS[1];
    const budget = escala.budget;

    /* Stats (abilities) */
    let absAbilities = 0;
    for (const input of $$("input[data-role='ability']")) {
      absAbilities += Number(input.value) || 0;
    }

    /* Race */
    const pickedRace = $("input[name='raca']:checked");
    const raceCost = pickedRace ? Number(pickedRace.closest(".tdt-wiz-item")?.dataset.custo) || 0 : 0;

    /* Vantagens + Desvantagens + Perícias */
    let absVantagens = 0, absDesvantagens = 0, absPericias = 0;
    const pickedVantagensNames = new Set(); // nomes normalizados
    for (const cb of $$("[data-role='pick']:checked")) {
      const parent = cb.closest(".tdt-wiz-item");
      const kind = parent.dataset.kind;
      const cost = Number(parent.dataset.custo) || 0;
      if (kind === "vantagem") {
        absVantagens += cost;
        pickedVantagensNames.add(normalize(parent.querySelector(".tdt-wiz-item-name")?.textContent || ""));
      } else if (kind === "desvantagem") {
        absDesvantagens += cost;
      } else if (kind === "pericia") {
        absPericias += PERICIA_COST;
      }
    }

    const desvantagensCapped = Math.min(absDesvantagens, MAX_DESVANTAGENS_POINTS);
    const spent = raceCost + absAbilities + absVantagens + absPericias - desvantagensCapped;
    const remaining = budget - spent;

    /* Update budget display */
    $("[data-role='total']").textContent = String(budget);
    $("[data-role='remaining']").textContent = String(remaining);
    $("[data-role='parts-raca']").textContent = String(raceCost);
    $("[data-role='parts-abilities']").textContent = String(absAbilities);
    $("[data-role='parts-vantagens']").textContent = String(absVantagens);
    $("[data-role='parts-desvantagens']").textContent = `−${desvantagensCapped}${absDesvantagens > desvantagensCapped ? ` (de −${absDesvantagens})` : ""}`;
    $("[data-role='parts-pericias']").textContent = String(absPericias);

    const budgetEl = $("[data-role='budget']");
    budgetEl.classList.toggle("is-over", remaining < 0);
    budgetEl.classList.toggle("is-under", remaining > 0);
    budgetEl.classList.toggle("is-ok", remaining === 0);

    /* Steppers state */
    for (const stepper of $$(".tdt-stepper")) {
      const valInput = stepper.querySelector("input[data-role='ability']");
      const valEl = stepper.querySelector("[data-role='ability-value']");
      const incBtn = stepper.querySelector("[data-action='inc']");
      const decBtn = stepper.querySelector("[data-action='dec']");
      const v = Number(valInput.value) || 0;
      valEl.textContent = String(v);
      decBtn.disabled = v <= 0;
      incBtn.disabled = v >= MAX_ABILITY_ON_CREATE || remaining < 1;
    }

    /* Vantagens: bloqueia as que não cabem */
    for (const item of $$(".tdt-wiz-item[data-kind='vantagem']")) {
      const cb = item.querySelector("input");
      if (cb.checked) { item.classList.remove("is-unaffordable"); cb.disabled = false; continue; }
      const cost = Number(item.dataset.custo) || 0;
      const can = cost <= remaining;
      item.classList.toggle("is-unaffordable", !can);
      cb.disabled = !can;
    }

    /* Desvantagens: bloqueia novas que estouram o cap −6 */
    const desvRemaining = MAX_DESVANTAGENS_POINTS - absDesvantagens;
    for (const item of $$(".tdt-wiz-item[data-kind='desvantagem']")) {
      const cb = item.querySelector("input");
      if (cb.checked) { item.classList.remove("is-unaffordable"); cb.disabled = false; continue; }
      const cost = Number(item.dataset.custo) || 0;
      const can = cost <= desvRemaining;
      item.classList.toggle("is-unaffordable", !can);
      cb.disabled = !can;
    }

    /* Raça: bloqueia as que não cabem no orçamento restante (somando de volta o custo da atual) */
    for (const item of $$(".tdt-wiz-item[data-kind='raca']")) {
      const radio = item.querySelector("input");
      const cost = Number(item.dataset.custo) || 0;
      const wouldLeave = remaining + raceCost - cost; // se trocar pra essa raça
      const can = radio.checked || wouldLeave >= 0;
      item.classList.toggle("is-unaffordable", !can);
      radio.disabled = !can;
    }

    /* Perícias: bloqueia as que não cabem */
    for (const item of $$(".tdt-wiz-item[data-kind='pericia']")) {
      const cb = item.querySelector("input");
      if (cb.checked) { item.classList.remove("is-unaffordable"); cb.disabled = false; continue; }
      const can = PERICIA_COST <= remaining;
      item.classList.toggle("is-unaffordable", !can);
      cb.disabled = !can;
    }

    /* Magias: desbloqueia por escolas */
    const unlockedSchools = new Set();
    for (const name of pickedVantagensNames) {
      const escolas = MAGIC_VANTAGENS[name];
      if (escolas) escolas.forEach((e) => unlockedSchools.add(e));
    }
    for (const item of $$(".tdt-wiz-item[data-kind='magia']")) {
      const cb = item.querySelector("input");
      const escola = item.dataset.escola || "";
      const locked = !magiaUnlocked(escola, unlockedSchools);
      if (locked && !cb.checked) {
        item.classList.add("is-locked");
        item.classList.remove("is-unaffordable");
        cb.disabled = true;
      } else {
        item.classList.remove("is-locked");
        cb.disabled = false;
      }
    }

    /* OK button */
    const nomeVazio = !$("[name='nome']").value.trim();
    const valid = remaining >= 0 && !nomeVazio;
    if (okButton) {
      okButton.disabled = !valid;
      okButton.title = nomeVazio ? "Informe o nome" : (remaining < 0 ? "Orçamento estourado" : "");
    }
  };

  /* ----- Steppers ----- */
  root.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".tdt-step-btn");
    if (!btn || btn.disabled) return;
    ev.preventDefault();
    const stepper = btn.closest(".tdt-stepper");
    const input = stepper.querySelector("input[data-role='ability']");
    let v = Number(input.value) || 0;
    if (btn.dataset.action === "inc") v = Math.min(MAX_ABILITY_ON_CREATE, v + 1);
    else if (btn.dataset.action === "dec") v = Math.max(0, v - 1);
    input.value = String(v);
    recompute();
  });

  /* ----- Filtros ----- */
  for (const filter of $$("[data-role='filter']")) {
    filter.addEventListener("input", (ev) => {
      const target = ev.currentTarget.dataset.target;
      const q = ev.currentTarget.value.trim().toLowerCase();
      const list = $(`[data-role='list-${target}']`);
      if (!list) return;
      for (const card of list.querySelectorAll(".tdt-wiz-item")) {
        const txt = card.textContent.toLowerCase();
        card.style.display = q === "" || txt.includes(q) ? "" : "none";
      }
    });
  }

  /* ----- Detail panels ----- */
  const PANEL_ROLE = {
    vantagem: "detail-vantagens",
    desvantagem: "detail-desvantagens",
    raca: "detail-racas",
    pericia: "detail-pericias",
    magia: "detail-magias"
  };

  const renderDetail = (item, kind) => {
    const s = item?.system ?? {};
    const efeito = (s.efeito?.trim?.() || s.description?.trim?.() || "<p><em>Sem descrição.</em></p>");
    const chips = [];
    if (kind === "magia") {
      if (s.escola) chips.push(`<span class="tdt-chip">${s.escola}</span>`);
      if (s.custo) chips.push(`<span class="tdt-chip tdt-chip--cost">${s.custo}</span>`);
      if (s.alcance) chips.push(`<span class="tdt-chip">Alcance: ${s.alcance}</span>`);
      if (s.duracao) chips.push(`<span class="tdt-chip">Duração: ${s.duracao}</span>`);
      if (s.exigencias) chips.push(`<span class="tdt-chip">Exige: ${s.exigencias}</span>`);
    } else {
      if (s.categoria) chips.push(`<span class="tdt-chip">${s.categoria}</span>`);
      chips.push(`<span class="tdt-chip tdt-chip--cost">${kind === "desvantagem" ? "−" : ""}${s.custo ?? 0} pt</span>`);
      if (s.custoPMs) chips.push(`<span class="tdt-chip">${s.custoPMs}</span>`);
      if (s.duracao) chips.push(`<span class="tdt-chip">${s.duracao}</span>`);
    }
    const preq = s.prerequisitos ? `<div class="tdt-wiz-detail-prereq"><strong>Pré-requisitos:</strong> ${s.prerequisitos}</div>` : "";
    return `
      <div class="tdt-wiz-detail-head">
        <h4>${item?.name ?? "—"}</h4>
        <div class="tdt-wiz-detail-chips">${chips.join("")}</div>
      </div>
      ${preq}
      <div class="tdt-wiz-detail-body">${efeito}</div>
    `;
  };

  const showDetail = (el) => {
    if (!el) return;
    const id = String(el.dataset?.id ?? "");
    const kind = el.dataset?.kind;
    if (!id || !kind) return;

    const indexByKind = { vantagem: vIndex, desvantagem: dIndex, raca: rIndex, pericia: pIndex, magia: mIndex };
    const index = indexByKind[kind];
    if (!index) return;

    const panelRole = PANEL_ROLE[kind];
    const panel = panelRole ? root.querySelector(`[data-role="${panelRole}"]`) : null;
    if (!panel) { console.warn("3D&T wizard | painel não encontrado pra kind", kind); return; }

    const item = index[id];
    if (!item) {
      panel.innerHTML = `<p style="color:#e24b4a;">Item não encontrado. Execute <code>game.tresdetalpha.rebuildCompendia()</code>.</p>`;
      return;
    }
    panel.innerHTML = renderDetail(item, kind);
    panel.scrollTop = 0;
  };

  const highlightViewing = (el) => {
    const list = el.closest(".tdt-wiz-list");
    if (!list) return;
    for (const o of list.querySelectorAll(".tdt-wiz-item.is-viewing")) o.classList.remove("is-viewing");
    el.classList.add("is-viewing");
  };

  for (const item of $$(".tdt-wiz-item")) {
    item.addEventListener("click", () => { showDetail(item); highlightViewing(item); });
    item.addEventListener("mouseenter", () => { showDetail(item); highlightViewing(item); });
    item.addEventListener("focusin", () => { showDetail(item); highlightViewing(item); });
  }

  /* ----- Recompute on change ----- */
  root.addEventListener("change", recompute);
  root.addEventListener("input", (ev) => {
    if (ev.target.name === "nome") recompute();
  });

  recompute();
}

/* -------------------------------------------- */
/*  Utilidades                                   */
/* -------------------------------------------- */

function normalize(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function magiaUnlocked(escolaText, unlockedSchools) {
  if (!unlockedSchools.size) return false;
  const norm = escolaText.toLowerCase();
  // Se magia diz "todas" ou "Branca, Elemental e Negra", precisa de Arcano
  if (norm.includes("todas") || norm.includes("branca, elemental e negra")) {
    return unlockedSchools.has("Branca") && unlockedSchools.has("Elemental") && unlockedSchools.has("Negra");
  }
  // Substring match — escola da magia contém nome de escola desbloqueada
  for (const school of unlockedSchools) {
    if (norm.includes(school.toLowerCase())) return true;
  }
  return false;
}

/* -------------------------------------------- */
/*  Extração + criação                          */
/* -------------------------------------------- */

function extractData(dialog, items) {
  const { vItems, dItems, rItems, pItems, mItems } = items;
  const root = dialog.element;
  const get = (name) => root.querySelector(`[name="${name}"]`)?.value ?? "";
  const escala = ESCALAS.find((e) => e.key === get("escala")) ?? ESCALAS[1];

  const abilities = {};
  for (const a of ABILITIES) {
    abilities[a.key] = Math.max(0, Math.min(MAX_ABILITY_ON_CREATE, Number(get(`caract.${a.key}`)) || 0));
  }

  const pickedRaceId = root.querySelector("input[name='raca']:checked")?.value || null;
  const pickedRace = pickedRaceId ? rItems.find((it) => String(it.id) === String(pickedRaceId)) : null;

  const selectedIds = (name) => Array.from(root.querySelectorAll(`input[name="${name}"]:checked`)).map((cb) => cb.value);

  return {
    nome: get("nome").trim(),
    conceito: get("conceito").trim(),
    escala,
    abilities,
    raca: pickedRace,
    vantagens: selectedIds("vantagem").map((id) => vItems.find((it) => String(it.id) === String(id))).filter(Boolean),
    desvantagens: selectedIds("desvantagem").map((id) => dItems.find((it) => String(it.id) === String(id))).filter(Boolean),
    pericias: selectedIds("pericia").map((id) => pItems.find((it) => String(it.id) === String(id))).filter(Boolean),
    magias: selectedIds("magia").map((id) => mItems.find((it) => String(it.id) === String(id))).filter(Boolean)
  };
}

async function createActorFromData(data) {
  const r = data.abilities.resistencia;
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
    vida:  { value: Math.max(r * 5, 1), bonus: 0, min: 0, max: Math.max(r * 5, 1) },
    magia: { value: Math.max(r * 5, 1), bonus: 0, min: 0, max: Math.max(r * 5, 1) },
    experiencia: { value: 0, min: 0, max: 0 }
  };

  const actor = await Actor.create({
    name: data.nome,
    type: "personagem",
    img: "icons/svg/mystery-man.svg",
    system: systemData
  }, { bypassTdtWizard: true });

  if (!actor) {
    ui.notifications.error("Falha ao criar o personagem.");
    return null;
  }

  const toEmbed = [];
  const pushItem = (item) => {
    if (!item) return;
    const raw = item.toObject();
    delete raw._id;
    toEmbed.push(raw);
  };

  if (data.raca) pushItem(data.raca);
  for (const item of data.vantagens) pushItem(item);
  for (const item of data.desvantagens) pushItem(item);
  for (const item of data.pericias) pushItem(item);
  for (const item of data.magias) pushItem(item);

  if (toEmbed.length) {
    await actor.createEmbeddedDocuments("Item", toEmbed);
  }

  actor.sheet.render(true);
  ui.notifications.info(`Personagem "${data.nome}" criado com ${toEmbed.length} item(s).`);
  return actor;
}
