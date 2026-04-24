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

/** Vantagens que podem ser compradas mais de uma vez (p.29-39 do core). */
const STACKABLE_VANTAGENS = new Set([
  "Aliado",
  "Ataque Especial",
  "Elementalista",
  "Energia Extra",
  "Forma Alternativa",
  "Imortal",
  "Inimigo",
  "Magia Irresistível",
  "Membros Extras",
  "Parceiro",
  "Pontos de Magia Extras",
  "Pontos de Vida Extras",
  "Toque de Energia"
]);
const MAX_STACK = 10;

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
  return await createActorFromData(result, { vItems, dItems, rItems, pItems, mItems });
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

    // Vantagens empilháveis (Pontos de Vida Extras, Ataque Especial, etc.): stepper em vez de checkbox.
    if (kind === "vantagem" && STACKABLE_VANTAGENS.has(it.name)) {
      return `
        <div class="tdt-wiz-item tdt-wiz-item--stackable" data-id="${it.id}" data-custo="${custo}" data-kind="${kind}" data-stack-count="0">
          <div class="tdt-stack-controls">
            <button type="button" class="tdt-step-btn tdt-step-btn--sm" data-stack="dec" aria-label="Diminuir">−</button>
            <output class="tdt-stack-count" data-role="stack-count">0</output>
            <button type="button" class="tdt-step-btn tdt-step-btn--sm" data-stack="inc" aria-label="Aumentar">+</button>
          </div>
          <span class="tdt-wiz-item-name">${it.name}</span>
          ${categoria ? `<span class="tdt-wiz-item-tag">${categoria}</span>` : ""}
          <span class="tdt-wiz-item-cost">× ${custo} pt</span>
        </div>
      `;
    }

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

  // Persistent state for race sub-pickers, keyed by raceId.
  // Shape: { [raceId]: { [choiceId]: [optionName, ...] } }
  if (!dialog.tdtRaceChoices) dialog.tdtRaceChoices = {};

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

    /* Vantagens (checkbox) + Desvantagens + Perícias */
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

    /* Vantagens empilháveis (stepper): custo = count × unit */
    for (const el of $$(".tdt-wiz-item--stackable")) {
      const count = Number(el.dataset.stackCount) || 0;
      if (count <= 0) continue;
      const cost = (Number(el.dataset.custo) || 0) * count;
      absVantagens += cost;
      pickedVantagensNames.add(normalize(el.querySelector(".tdt-wiz-item-name")?.textContent || ""));
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

    /* Vantagens (checkbox): bloqueia as que não cabem */
    for (const item of $$(".tdt-wiz-item[data-kind='vantagem']:not(.tdt-wiz-item--stackable)")) {
      const cb = item.querySelector("input");
      if (cb.checked) { item.classList.remove("is-unaffordable"); cb.disabled = false; continue; }
      const cost = Number(item.dataset.custo) || 0;
      const can = cost <= remaining;
      item.classList.toggle("is-unaffordable", !can);
      cb.disabled = !can;
    }

    /* Vantagens empilháveis: atualiza contador e habilita/desabilita + e − */
    for (const el of $$(".tdt-wiz-item--stackable")) {
      const count = Number(el.dataset.stackCount) || 0;
      const cost = Number(el.dataset.custo) || 0;
      const inc = el.querySelector("[data-stack='inc']");
      const dec = el.querySelector("[data-stack='dec']");
      const countEl = el.querySelector("[data-role='stack-count']");
      if (countEl) countEl.textContent = String(count);
      if (dec) dec.disabled = count <= 0;
      if (inc) inc.disabled = count >= MAX_STACK || cost > remaining;
      el.classList.toggle("is-stacked", count > 0);
    }

    /* Desvantagens: bloqueia novas que estouram o cap −6 */
    const desvRemaining = Math.max(0, MAX_DESVANTAGENS_POINTS - desvantagensCapped);
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

    /* Contagem de escolhas raciais pendentes */
    let pendingRaceChoices = 0;
    let bonusBudgetExceeded = false;
    if (pickedRace) {
      const raceItem = rIndex[String(pickedRace.value)];
      const choices = raceItem?.system?.package?.choices ?? [];
      const saved = dialog.tdtRaceChoices?.[String(pickedRace.value)] ?? {};
      for (const ch of choices) {
        // vantagemBonus: valida custo total contra orçamento.
        if (ch.optionType === "vantagemBonus") {
          const budget = Math.max(0, Number(ch.budget) || 0);
          const picks = Array.isArray(saved[ch.id]) ? saved[ch.id] : [];
          let spent = 0;
          for (const name of picks) {
            const v = vItems.find((x) => x.name === name);
            if (v) spent += Number(v.system?.custo ?? 0) || 0;
          }
          if (spent > budget) {
            bonusBudgetExceeded = true;
            pendingRaceChoices += 1;
          }
          continue;
        }
        const need = Math.max(1, Number(ch.pick) || 1);
        const got = Array.isArray(saved[ch.id]) ? saved[ch.id].length : 0;
        if (got !== need) pendingRaceChoices += Math.abs(need - got);
      }
    }

    /* OK button */
    const nomeVazio = !$("[name='nome']").value.trim();
    const valid = remaining >= 0 && !nomeVazio && pendingRaceChoices === 0;
    if (okButton) {
      okButton.disabled = !valid;
      okButton.title = nomeVazio ? "Informe o nome"
        : (remaining < 0 ? "Orçamento estourado"
          : (bonusBudgetExceeded ? "Orçamento de Vantagem Bônus estourado"
            : (pendingRaceChoices > 0 ? `Faça ${pendingRaceChoices} escolha${pendingRaceChoices === 1 ? "" : "s"} racial${pendingRaceChoices === 1 ? "" : "is"} pendente${pendingRaceChoices === 1 ? "" : "s"}.` : "")));
    }
  };

  /* ----- Steppers (características + stackables) ----- */
  root.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".tdt-step-btn");
    if (!btn || btn.disabled) return;
    ev.preventDefault();

    // Stepper de característica
    const stepper = btn.closest(".tdt-stepper");
    if (stepper) {
      const input = stepper.querySelector("input[data-role='ability']");
      let v = Number(input.value) || 0;
      if (btn.dataset.action === "inc") v = Math.min(MAX_ABILITY_ON_CREATE, v + 1);
      else if (btn.dataset.action === "dec") v = Math.max(0, v - 1);
      input.value = String(v);
      recompute();
      return;
    }

    // Stepper de vantagem empilhável
    const stackItem = btn.closest(".tdt-wiz-item--stackable");
    if (stackItem) {
      const stack = btn.dataset.stack;
      let count = Number(stackItem.dataset.stackCount) || 0;
      if (stack === "inc") count = Math.min(MAX_STACK, count + 1);
      else if (stack === "dec") count = Math.max(0, count - 1);
      stackItem.dataset.stackCount = String(count);
      recompute();
    }
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

  const ABILITY_LABELS = {
    forca: "Força",
    habilidade: "Habilidade",
    resistencia: "Resistência",
    armadura: "Armadura",
    poderDeFogo: "PdF"
  };

  const renderRacePackagePreview = (item) => {
    const pkg = item?.system?.package;
    if (!pkg) return "";

    const raceId = String(item.id);
    const saved = dialog.tdtRaceChoices?.[raceId] ?? {};

    const parts = [];

    // Ability bonuses (green chips)
    const bonuses = pkg.abilityBonuses || {};
    const bonusChips = Object.entries(bonuses)
      .filter(([, v]) => Number(v) !== 0)
      .map(([ability, v]) => {
        const label = ABILITY_LABELS[ability] || ability;
        const sign = Number(v) > 0 ? "+" : "";
        return `<span class="tdt-chip tdt-chip--bonus">${label} ${sign}${v}</span>`;
      });

    // Granted items
    const granted = Array.isArray(pkg.granted) ? pkg.granted : [];
    const grantedChips = granted.map((g) => {
      const typeLabel = g.type === "vantagem" ? "Vantagem"
        : g.type === "desvantagem" ? "Desvantagem"
        : g.type === "pericia" ? "Perícia"
        : (g.type ?? "");
      return `<span class="tdt-chip tdt-chip--granted" title="${escapeAttr(typeLabel)}">${g.name}</span>`;
    });

    // Sub-pickers for choices
    const choices = Array.isArray(pkg.choices) ? pkg.choices : [];
    const choicesHtml = choices.map((choice) => {
      const pickN = Math.max(1, Number(choice.pick) || 1);
      const currentSaved = saved[choice.id];
      const savedList = Array.isArray(currentSaved) ? currentSaved : (currentSaved ? [currentSaved] : []);
      const label = choice.label ?? choice.id ?? "Escolha";

      // vantagemBonus: picker de vantagens com orçamento em pontos.
      if (choice.optionType === "vantagemBonus") {
        const budget = Math.max(0, Number(choice.budget) || 0);
        // Filtra o pool: se choice.options tem itens, restringe a eles; senão, usa tudo.
        const allowed = Array.isArray(choice.options) && choice.options.length
          ? vItems.filter((v) => choice.options.includes(v.name))
          : vItems;
        // Calcula custo inicial gasto pra exibir remaining correto no render.
        let spent = 0;
        for (const name of savedList) {
          const v = allowed.find((x) => x.name === name);
          if (v) spent += Number(v.system?.custo ?? 0) || 0;
        }
        const initialRemaining = budget - spent;

        const bonusItemsHtml = allowed.map((v) => {
          const cost = Number(v.system?.custo ?? 0) || 0;
          const checked = savedList.includes(v.name);
          return `
            <label class="tdt-wiz-item tdt-wiz-bonus-item" data-custo="${cost}">
              <input type="checkbox" name="race-choice-bonus"
                data-role="race-choice-bonus"
                data-race-id="${escapeAttr(raceId)}"
                data-choice-id="${escapeAttr(choice.id)}"
                data-choice-budget="${budget}"
                data-item-name="${escapeAttr(v.name)}"
                value="${escapeAttr(v.name)}" ${checked ? "checked" : ""} />
              <span class="tdt-wiz-item-name">${v.name}</span>
              <span class="tdt-wiz-bonus-cost tdt-wiz-item-cost">${cost} pt</span>
            </label>
          `;
        }).join("");

        return `
          <div class="tdt-wiz-race-choice tdt-wiz-race-choice--bonus" data-choice-id="${escapeAttr(choice.id)}" data-choice-budget="${budget}" data-option-type="vantagemBonus">
            <div class="tdt-wiz-race-choice-head"><strong>${label}</strong></div>
            <div class="tdt-wiz-race-choice-budget">
              Pontos restantes: <strong data-role="bonus-remaining">${initialRemaining}</strong> / ${budget}
            </div>
            <input type="text" class="tdt-wiz-bonus-filter" placeholder="Filtrar vantagens..." data-role="bonus-filter" />
            <div class="tdt-wiz-bonus-list">${bonusItemsHtml}</div>
          </div>
        `;
      }

      const inputType = pickN > 1 ? "checkbox" : "radio";
      const groupName = `raceChoice__${raceId}__${choice.id}`;

      const optsHtml = (Array.isArray(choice.options) ? choice.options : []).map((optName) => {
        const checked = savedList.includes(optName) ? "checked" : "";
        return `
          <label class="tdt-wiz-item tdt-wiz-item--choice" data-choice-id="${escapeAttr(choice.id)}" data-choice-value="${escapeAttr(optName)}">
            <input type="${inputType}" name="${escapeAttr(groupName)}" value="${escapeAttr(optName)}" data-role="race-choice" data-race-id="${escapeAttr(raceId)}" data-choice-id="${escapeAttr(choice.id)}" data-pick="${pickN}" ${checked} />
            <span class="tdt-wiz-item-name">${optName}</span>
          </label>
        `;
      }).join("");

      const hint = pickN > 1 ? `escolha ${pickN}` : "escolha 1";
      return `
        <div class="tdt-wiz-race-choice" data-choice-id="${escapeAttr(choice.id)}" data-pick="${pickN}">
          <div class="tdt-wiz-race-choice-head"><strong>${label}</strong> <small>— ${hint}</small></div>
          <div class="tdt-wiz-race-choice-opts">${optsHtml}</div>
        </div>
      `;
    }).join("");

    // Informational rows
    const infoRows = [];
    if (pkg.conditionalBonus) {
      infoRows.push(`<div class="tdt-wiz-detail-info"><strong>Bônus condicional:</strong> ${pkg.conditionalBonus}</div>`);
    }
    if (Array.isArray(pkg.aptidoes) && pkg.aptidoes.length) {
      infoRows.push(`<div class="tdt-wiz-detail-info"><strong>Aptidões:</strong> ${pkg.aptidoes.join(", ")}</div>`);
    }
    if (Array.isArray(pkg.forbidden) && pkg.forbidden.length) {
      infoRows.push(`<div class="tdt-wiz-detail-info"><strong>Proibido:</strong> ${pkg.forbidden.join(", ")}</div>`);
    }
    if (Array.isArray(pkg.exceptions) && pkg.exceptions.length) {
      infoRows.push(`<div class="tdt-wiz-detail-info"><strong>Exceções:</strong> ${pkg.exceptions.join(", ")}</div>`);
    }

    parts.push(`<div class="tdt-wiz-race-package" data-race-id="${escapeAttr(raceId)}">`);
    parts.push(`<h5 class="tdt-wiz-race-package-title">Pacote racial</h5>`);
    if (bonusChips.length) {
      parts.push(`<div class="tdt-wiz-race-package-section"><div class="tdt-wiz-race-package-label">Bônus de características</div><div class="tdt-wiz-detail-chips">${bonusChips.join("")}</div></div>`);
    }
    if (grantedChips.length) {
      parts.push(`<div class="tdt-wiz-race-package-section"><div class="tdt-wiz-race-package-label">Concedido automaticamente</div><div class="tdt-wiz-detail-chips">${grantedChips.join("")}</div></div>`);
    }
    if (choicesHtml) {
      parts.push(`<div class="tdt-wiz-race-package-section"><div class="tdt-wiz-race-package-label">Escolhas</div>${choicesHtml}</div>`);
    }
    if (infoRows.length) {
      parts.push(`<div class="tdt-wiz-race-package-section">${infoRows.join("")}</div>`);
    }
    parts.push(`</div>`);
    return parts.join("");
  };

  const renderDetail = (item, kind) => {
    const s = item?.system ?? {};
    const efeito = (s.efeito?.trim?.() || s.description?.trim?.() || "<p><em>Sem descrição.</em></p>");
    const chips = [];

    if (kind === "raca") {
      // Specialized preview for races
      const racePkgHtml = renderRacePackagePreview(item);
      if (s.categoria) chips.push(`<span class="tdt-chip">${s.categoria}</span>`);
      chips.push(`<span class="tdt-chip tdt-chip--cost">${s.custo ?? 0} pt</span>`);
      const preqR = s.prerequisitos ? `<div class="tdt-wiz-detail-prereq"><strong>Pré-requisitos:</strong> ${s.prerequisitos}</div>` : "";
      return `
        <div class="tdt-wiz-detail-head">
          <h4>${item?.name ?? "—"}</h4>
          <div class="tdt-wiz-detail-chips">${chips.join("")}</div>
        </div>
        ${preqR}
        <div class="tdt-wiz-detail-body">${efeito}</div>
        ${racePkgHtml}
      `;
    }

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
    // Rehidrata o estado dos blocos vantagemBonus (remaining + disabled).
    if (kind === "raca") {
      for (const block of panel.querySelectorAll(".tdt-wiz-race-choice--bonus")) {
        refreshBonusBlock(block);
      }
    }
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

  /* ----- Race change: clear picks of the previously-selected race ----- */
  let lastRaceId = null;
  root.addEventListener("change", (ev) => {
    if (ev.target?.name === "raca") {
      const newId = ev.target.value || null;
      if (lastRaceId && lastRaceId !== newId) {
        delete dialog.tdtRaceChoices[lastRaceId];
      }
      lastRaceId = newId;
      // Re-render the race detail panel to reflect the new selection's package.
      const item = rIndex[String(newId)];
      if (item) {
        const panel = root.querySelector(`[data-role="${PANEL_ROLE.raca}"]`);
        if (panel) {
          panel.innerHTML = renderDetail(item, "raca");
          for (const block of panel.querySelectorAll(".tdt-wiz-race-choice--bonus")) {
            refreshBonusBlock(block);
          }
        }
      }
    }
  });

  /* ----- Race sub-choice interactions (delegated) ----- */
  root.addEventListener("change", (ev) => {
    const input = ev.target;
    if (!input || input.dataset?.role !== "race-choice") return;
    const raceId = input.dataset.raceId;
    const choiceId = input.dataset.choiceId;
    const pickN = Math.max(1, Number(input.dataset.pick) || 1);
    if (!raceId || !choiceId) return;

    if (!dialog.tdtRaceChoices[raceId]) dialog.tdtRaceChoices[raceId] = {};

    if (pickN === 1) {
      // Radio: replace
      dialog.tdtRaceChoices[raceId][choiceId] = input.checked ? [input.value] : [];
    } else {
      // Checkbox multi: toggle, respecting cap
      const current = Array.isArray(dialog.tdtRaceChoices[raceId][choiceId])
        ? [...dialog.tdtRaceChoices[raceId][choiceId]]
        : [];
      if (input.checked) {
        if (!current.includes(input.value)) current.push(input.value);
        // Enforce cap: if over, uncheck the current input and re-sync
        if (current.length > pickN) {
          input.checked = false;
          const idx = current.indexOf(input.value);
          if (idx >= 0) current.splice(idx, 1);
        }
      } else {
        const idx = current.indexOf(input.value);
        if (idx >= 0) current.splice(idx, 1);
      }
      dialog.tdtRaceChoices[raceId][choiceId] = current;
    }
    // No need to re-render panel (DOM checked state is already live); just recompute.
    recompute();
  });

  /* ----- vantagemBonus: checkbox + filtro (delegated) ----- */
  // Helper: recalcula remaining e desabilita itens fora do orçamento, para um bloco bonus.
  const refreshBonusBlock = (block) => {
    if (!block) return;
    const budget = Number(block.dataset.choiceBudget) || 0;
    let spent = 0;
    for (const cb of block.querySelectorAll("input[data-role='race-choice-bonus']:checked")) {
      const item = cb.closest(".tdt-wiz-bonus-item");
      spent += Number(item?.dataset.custo) || 0;
    }
    const remaining = budget - spent;
    const remainingEl = block.querySelector("[data-role='bonus-remaining']");
    if (remainingEl) remainingEl.textContent = String(remaining);
    // Desabilita quem não cabe (mas mantém o já marcado habilitado pra poder desmarcar).
    for (const item of block.querySelectorAll(".tdt-wiz-bonus-item")) {
      const cb = item.querySelector("input[data-role='race-choice-bonus']");
      if (!cb) continue;
      if (cb.checked) { cb.disabled = false; item.classList.remove("is-unaffordable"); continue; }
      const cost = Number(item.dataset.custo) || 0;
      const can = cost <= remaining;
      cb.disabled = !can;
      item.classList.toggle("is-unaffordable", !can);
    }
  };

  root.addEventListener("change", (ev) => {
    const input = ev.target;
    if (!input || input.dataset?.role !== "race-choice-bonus") return;
    const raceId = input.dataset.raceId;
    const choiceId = input.dataset.choiceId;
    if (!raceId || !choiceId) return;

    if (!dialog.tdtRaceChoices[raceId]) dialog.tdtRaceChoices[raceId] = {};
    const current = Array.isArray(dialog.tdtRaceChoices[raceId][choiceId])
      ? [...dialog.tdtRaceChoices[raceId][choiceId]]
      : [];
    if (input.checked) {
      if (!current.includes(input.value)) current.push(input.value);
    } else {
      const idx = current.indexOf(input.value);
      if (idx >= 0) current.splice(idx, 1);
    }
    dialog.tdtRaceChoices[raceId][choiceId] = current;

    const block = input.closest(".tdt-wiz-race-choice--bonus");
    refreshBonusBlock(block);
    recompute();
  });

  root.addEventListener("input", (ev) => {
    const input = ev.target;
    if (!input || input.dataset?.role !== "bonus-filter") return;
    const block = input.closest(".tdt-wiz-race-choice--bonus");
    if (!block) return;
    const q = input.value.trim().toLowerCase();
    for (const item of block.querySelectorAll(".tdt-wiz-bonus-item")) {
      const txt = item.textContent.toLowerCase();
      item.style.display = q === "" || txt.includes(q) ? "" : "none";
    }
  });

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

  // Validate & collect race choice picks.
  const raceChoicePicks = {};
  if (pickedRace) {
    const choices = pickedRace.system?.package?.choices ?? [];
    const saved = dialog.tdtRaceChoices?.[String(pickedRace.id)] ?? {};
    for (const ch of choices) {
      const need = Math.max(1, Number(ch.pick) || 1);
      const picks = Array.isArray(saved[ch.id]) ? saved[ch.id].slice(0, need) : [];
      if (picks.length !== need) {
        console.warn(`3D&T wizard | raça ${pickedRace.name}: escolha "${ch.id}" incompleta (${picks.length}/${need}).`);
      }
      raceChoicePicks[ch.id] = picks;
    }
  }

  const selectedIds = (name) => Array.from(root.querySelectorAll(`input[name="${name}"]:checked`)).map((cb) => cb.value);

  // Vantagens normais (checkbox) + empilháveis (stepper com count).
  const vantagens = [];
  for (const id of selectedIds("vantagem")) {
    const it = vItems.find((x) => String(x.id) === String(id));
    if (it) vantagens.push({ item: it, count: 1 });
  }
  for (const el of root.querySelectorAll(".tdt-wiz-item--stackable")) {
    const count = Number(el.dataset.stackCount) || 0;
    if (count <= 0) continue;
    const it = vItems.find((x) => String(x.id) === String(el.dataset.id));
    if (it) vantagens.push({ item: it, count });
  }

  return {
    nome: get("nome").trim(),
    conceito: get("conceito").trim(),
    escala,
    abilities,
    raca: pickedRace,
    raceChoicePicks,
    vantagens,
    desvantagens: selectedIds("desvantagem").map((id) => dItems.find((it) => String(it.id) === String(id))).filter(Boolean),
    pericias: selectedIds("pericia").map((id) => pItems.find((it) => String(it.id) === String(id))).filter(Boolean),
    magias: selectedIds("magia").map((id) => mItems.find((it) => String(it.id) === String(id))).filter(Boolean)
  };
}

async function createActorFromData(data, pools = {}) {
  const { vItems = [], dItems = [], pItems = [] } = pools;
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
  for (const entry of data.vantagens) {
    const count = entry.count ?? 1;
    for (let i = 0; i < count; i++) pushItem(entry.item);
  }
  for (const item of data.desvantagens) pushItem(item);
  for (const item of data.pericias) pushItem(item);
  for (const item of data.magias) pushItem(item);

  /* ----- Materializa o pacote racial ----- */
  const POOL_BY_TYPE = { vantagem: vItems, desvantagem: dItems, pericia: pItems };

  // B. Itens concedidos automaticamente pela raça.
  const grantedList = data.raca?.system?.package?.granted ?? [];
  for (const g of grantedList) {
    const pool = POOL_BY_TYPE[g.type];
    if (!pool) continue;
    const match = pool.find((p) => p.name === g.name);
    if (!match) {
      console.warn(`3D&T wizard | raça ${data.raca.name} granted '${g.name}' mas não encontrado no compêndio de ${g.type}.`);
      continue;
    }
    const raw = match.toObject();
    delete raw._id;
    raw.flags = raw.flags ?? {};
    raw.flags["3det-foundry-rework"] = { ...(raw.flags["3det-foundry-rework"] ?? {}), grantedByRace: data.raca.name };

    // Preconfigura damageModifiers[0].types se a entrada granted declarou damageTypes.
    if (Array.isArray(g.damageTypes) && g.damageTypes.length
        && Array.isArray(raw.system?.damageModifiers) && raw.system.damageModifiers.length) {
      raw.system.damageModifiers = foundry.utils.deepClone(raw.system.damageModifiers);
      raw.system.damageModifiers[0] = { ...raw.system.damageModifiers[0], types: [...g.damageTypes] };
    }

    toEmbed.push(raw);
  }

  // C. Opções escolhidas pelo jogador.
  const choicePicks = data.raceChoicePicks ?? {};
  const choiceDefs = data.raca?.system?.package?.choices ?? [];
  for (const def of choiceDefs) {
    const picks = choicePicks[def.id] ?? [];

    // vantagemBonus: materializa cada vantagem escolhida a partir do pool de vantagens,
    // com flag indicando que veio do orçamento bônus da raça.
    if (def.optionType === "vantagemBonus") {
      for (const pickedName of picks) {
        const match = vItems.find((p) => p.name === pickedName);
        if (!match) {
          console.warn(`3D&T wizard | vantagem bônus "${pickedName}" da raça ${data.raca.name} não encontrada.`);
          continue;
        }
        const raw = match.toObject();
        delete raw._id;
        raw.flags = raw.flags ?? {};
        raw.flags["3det-foundry-rework"] = {
          ...(raw.flags["3det-foundry-rework"] ?? {}),
          grantedByRaceBonus: { raceName: data.raca.name, choiceId: def.id }
        };
        toEmbed.push(raw);
      }
      continue;
    }

    const pool = POOL_BY_TYPE[def.optionType];
    if (!pool) continue; // tipo "ability" ou outro: tratado à parte se/quando existir
    for (const pickedName of picks) {
      const match = pool.find((p) => p.name === pickedName);
      if (!match) {
        console.warn(`3D&T wizard | escolha "${pickedName}" da raça ${data.raca.name} não encontrada.`);
        continue;
      }
      const raw = match.toObject();
      delete raw._id;
      raw.flags = raw.flags ?? {};
      raw.flags["3det-foundry-rework"] = { ...(raw.flags["3det-foundry-rework"] ?? {}), grantedByRaceChoice: { raceName: data.raca.name, choiceId: def.id } };
      toEmbed.push(raw);
    }
  }

  if (toEmbed.length) {
    await actor.createEmbeddedDocuments("Item", toEmbed);
  }

  // A. ActiveEffect para os bônus de característica da raça.
  const bonuses = data.raca?.system?.package?.abilityBonuses || {};
  const abilityChanges = Object.entries(bonuses)
    .filter(([, v]) => Number(v) !== 0)
    .map(([ability, v]) => ({
      key: `system.abilities.${ability}.bonus`,
      mode: 2,             // CONST.ACTIVE_EFFECT_MODES.ADD
      value: String(v),
      priority: 20
    }));

  if (abilityChanges.length) {
    await actor.createEmbeddedDocuments("ActiveEffect", [{
      name: `${data.raca.name} — Bônus raciais`,
      img: "icons/magic/holy/angel-wings-gray.webp",
      changes: abilityChanges,
      transfer: false,
      disabled: false,
      flags: { "3det-foundry-rework": { racialPackage: true, raceItemName: data.raca.name } }
    }]);
  }

  actor.sheet.render(true);
  ui.notifications.info(`Personagem "${data.nome}" criado com ${toEmbed.length} item(s).`);
  return actor;
}
