/**
 * Wizard de criação de personagem 3D&T Alpha.
 *
 * - Painel de orçamento fixo no topo (sempre visível).
 * - Características via steppers +/− que respeitam o orçamento em tempo real.
 * - Vantagens/desvantagens com painel de detalhes abaixo da lista (full-width)
 *   atualizado ao passar o mouse ou clicar em um item.
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
    window: { title: "Criação de Personagem — 3D&T Alpha", icon: "fas fa-user-plus", resizable: true },
    position: { width: 820, height: 820 },
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
/*  UI                                          */
/* -------------------------------------------- */

function buildContent(vItems, dItems) {
  const escalasHtml = ESCALAS.map((e, i) => `
    <option value="${e.key}" data-budget="${e.budget}" ${i === 1 ? "selected" : ""}>${e.label} (${e.budget} pt)</option>
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

      <div class="tdt-wiz-budget-bar" data-role="budget">
        <div class="tdt-wiz-budget-main">
          <span class="tdt-wiz-budget-label">Pontos disponíveis</span>
          <span class="tdt-wiz-budget-remaining" data-role="remaining">10</span>
          <span class="tdt-wiz-budget-sep">/</span>
          <span data-role="total">10</span>
        </div>
        <div class="tdt-wiz-budget-parts">
          <span>Caract <strong data-role="parts-abilities">0</strong></span>
          <span>Vant <strong data-role="parts-vantagens">0</strong></span>
          <span>Desvant <strong data-role="parts-desvantagens">0</strong></span>
        </div>
      </div>

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
        <label>Conceito
          <textarea name="conceito" rows="2" placeholder="Origem, motivação, arquétipo..."></textarea>
        </label>
      </section>

      <section class="tdt-wiz-section">
        <h3>2. Características <small>— use os botões +/−, máx. 5 cada</small></h3>
        <div class="tdt-steppers">${steppersHtml}</div>
      </section>

      <section class="tdt-wiz-section">
        <h3>3. Vantagens <small>— passe o mouse ou clique pra ler, marque o checkbox pra escolher</small></h3>
        <input type="text" class="tdt-wiz-filter-input" placeholder="Filtrar vantagens..." data-role="filter" data-target="vantagens" />
        <div class="tdt-wiz-list" data-role="list-vantagens">
          ${vItems.length ? itemList(vItems, "vantagem") : `<p class="tdt-wiz-empty">Compêndio 'Vantagens' vazio. Rode <code>game.tresdetalpha.rebuildCompendia()</code>.</p>`}
        </div>
        <div class="tdt-wiz-detail" data-role="detail-vantagens">
          <p class="tdt-wiz-detail-hint">Nenhuma vantagem selecionada. Passe o mouse ou clique numa da lista acima pra ver o efeito completo aqui.</p>
        </div>
      </section>

      <section class="tdt-wiz-section">
        <h3>4. Desvantagens <small>— devolvem pontos, máx. ${MAX_DESVANTAGENS_POINTS} pt na criação</small></h3>
        <input type="text" class="tdt-wiz-filter-input" placeholder="Filtrar desvantagens..." data-role="filter" data-target="desvantagens" />
        <div class="tdt-wiz-list" data-role="list-desvantagens">
          ${dItems.length ? itemList(dItems, "desvantagem") : `<p class="tdt-wiz-empty">Compêndio 'Desvantagens' vazio.</p>`}
        </div>
        <div class="tdt-wiz-detail" data-role="detail-desvantagens">
          <p class="tdt-wiz-detail-hint">Nenhuma desvantagem selecionada. Passe o mouse ou clique numa da lista acima.</p>
        </div>
      </section>

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

  const okButton = dialog.element.querySelector("button[data-action='ok']");
  const vIndex = Object.fromEntries(vItems.map((x) => [x.id, x]));
  const dIndex = Object.fromEntries(dItems.map((x) => [x.id, x]));

  /* ----- Recompute: fonte da verdade do orçamento ----- */
  const recompute = () => {
    const escalaKey = $("[data-role='escala']").value;
    const escala = ESCALAS.find((e) => e.key === escalaKey) ?? ESCALAS[1];
    const budget = escala.budget;

    let absAbilities = 0;
    for (const input of $$("input[data-role='ability']")) {
      absAbilities += Number(input.value) || 0;
    }

    let absVantagens = 0;
    let absDesvantagens = 0;
    for (const cb of $$("[data-role='pick']:checked")) {
      const parent = cb.closest(".tdt-wiz-item");
      const cost = Number(parent.dataset.custo) || 0;
      if (parent.dataset.kind === "vantagem") absVantagens += cost;
      else if (parent.dataset.kind === "desvantagem") absDesvantagens += cost;
    }

    const desvantagensCapped = Math.min(absDesvantagens, MAX_DESVANTAGENS_POINTS);
    const spent = absAbilities + absVantagens - desvantagensCapped;
    const remaining = budget - spent;

    /* Atualiza barra de orçamento */
    $("[data-role='total']").textContent = String(budget);
    $("[data-role='remaining']").textContent = String(remaining);
    $("[data-role='parts-abilities']").textContent = String(absAbilities);
    $("[data-role='parts-vantagens']").textContent = String(absVantagens);
    $("[data-role='parts-desvantagens']").textContent = `−${desvantagensCapped}${absDesvantagens > desvantagensCapped ? ` (de −${absDesvantagens})` : ""}`;

    const budgetEl = $("[data-role='budget']");
    budgetEl.classList.toggle("is-over", remaining < 0);
    budgetEl.classList.toggle("is-under", remaining > 0);
    budgetEl.classList.toggle("is-ok", remaining === 0);

    /* Steppers: inc desabilita se valor = 5 ou remaining < 1. dec se valor = 0. */
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

    /* Vantagens: bloqueia as que estourariam o orçamento. */
    for (const item of $$(".tdt-wiz-item[data-kind='vantagem']")) {
      const cb = item.querySelector("input[type='checkbox']");
      if (cb.checked) {
        item.classList.remove("is-unaffordable");
        cb.disabled = false;
        continue;
      }
      const cost = Number(item.dataset.custo) || 0;
      const canAfford = cost <= remaining;
      item.classList.toggle("is-unaffordable", !canAfford);
      cb.disabled = !canAfford;
    }

    /* Desvantagens: bloqueia novas seleções que estourariam o cap de −6 pts.
       As já marcadas ficam liberadas pra desmarcar. */
    const desvRemaining = MAX_DESVANTAGENS_POINTS - absDesvantagens;
    for (const item of $$(".tdt-wiz-item[data-kind='desvantagem']")) {
      const cb = item.querySelector("input[type='checkbox']");
      if (cb.checked) {
        item.classList.remove("is-unaffordable");
        cb.disabled = false;
        continue;
      }
      const cost = Number(item.dataset.custo) || 0;
      const canAdd = cost <= desvRemaining;
      item.classList.toggle("is-unaffordable", !canAdd);
      cb.disabled = !canAdd;
    }

    /* Botão de criação travado se estourou ou nome vazio */
    const nomeVazio = !$("[name='nome']").value.trim();
    const valid = remaining >= 0 && !nomeVazio;
    if (okButton) {
      okButton.disabled = !valid;
      okButton.title = nomeVazio ? "Informe o nome do personagem" : (remaining < 0 ? "Orçamento estourado" : "");
    }
  };

  /* ----- Steppers: delegate click ----- */
  root.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".tdt-step-btn");
    if (!btn) return;
    if (btn.disabled) return;
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
      const query = ev.currentTarget.value.trim().toLowerCase();
      const list = $(`[data-role='list-${target}']`);
      if (!list) return;
      for (const card of list.querySelectorAll(".tdt-wiz-item")) {
        const txt = card.textContent.toLowerCase();
        card.style.display = query === "" || txt.includes(query) ? "" : "none";
      }
    });
  }

  /* ----- Detail panel ----- */
  const renderDetail = (item, kind) => {
    const s = item?.system ?? {};
    const efeitoRaw = (s.efeito && String(s.efeito).trim()) || (s.description && String(s.description).trim()) || "";
    const efeito = efeitoRaw
      || `<p><em>Este item do compêndio não tem efeito/descrição preenchida. Se você esperava ver a regra aqui, execute no console (F12): <code>game.tresdetalpha.rebuildCompendia()</code> para reimportar com os dados atualizados.</em></p>`;

    const chips = [];
    if (s.categoria) chips.push(`<span class="tdt-chip">${s.categoria}</span>`);
    chips.push(`<span class="tdt-chip tdt-chip--cost">${kind === "desvantagem" ? "−" : ""}${s.custo ?? 0} pt</span>`);
    if (s.custoPMs) chips.push(`<span class="tdt-chip">${s.custoPMs}</span>`);
    if (s.duracao) chips.push(`<span class="tdt-chip">${s.duracao}</span>`);

    const preq = s.prerequisitos
      ? `<div class="tdt-wiz-detail-prereq"><strong>Pré-requisitos:</strong> ${s.prerequisitos}</div>`
      : "";

    return `
      <div class="tdt-wiz-detail-head">
        <h4>${item?.name ?? "—"}</h4>
        <div class="tdt-wiz-detail-chips">${chips.join("")}</div>
      </div>
      ${preq}
      <div class="tdt-wiz-detail-body">${efeito}</div>
    `;
  };

  // Mapa de plurais (português: "vantagem" → "vantagens", não "vantagems").
  const PANEL_ROLE = {
    vantagem: "detail-vantagens",
    desvantagem: "detail-desvantagens"
  };

  const showDetail = (el) => {
    if (!el) return;
    const id = String(el.dataset?.id ?? "");
    const kind = el.dataset?.kind;
    if (!id || !kind) return;

    const panelRole = PANEL_ROLE[kind];
    const panel = panelRole ? root.querySelector(`[data-role="${panelRole}"]`) : null;
    if (!panel) {
      console.warn("3D&T wizard | painel não encontrado pra kind", kind);
      return;
    }

    const items = kind === "vantagem" ? vItems : dItems;
    const item = items.find((x) => String(x.id) === id);

    if (!item) {
      const labelName = el.querySelector(".tdt-wiz-item-name")?.textContent?.trim() || id;
      panel.innerHTML = `
        <div class="tdt-wiz-detail-head"><h4>${labelName}</h4></div>
        <p style="color:#e24b4a; margin:0 0 8px;"><strong>Item não encontrado no índice.</strong></p>
        <p style="color:#a68f5e; font-size:11px;">ID <code>${id}</code> · ${kind} · ${items.length} no compêndio</p>
        <p style="color:#a68f5e; font-size:11px;">Execute <code>game.tresdetalpha.rebuildCompendia()</code> no console (F12).</p>
      `;
      return;
    }

    panel.innerHTML = renderDetail(item, kind);
    panel.scrollTop = 0;
  };

  const highlightViewing = (el) => {
    const list = el.closest(".tdt-wiz-list");
    if (!list) return;
    for (const other of list.querySelectorAll(".tdt-wiz-item.is-viewing")) {
      other.classList.remove("is-viewing");
    }
    el.classList.add("is-viewing");
  };

  // Listeners diretos por item — mais confiável que event delegation em DialogV2.
  const allItems = $$(".tdt-wiz-item");
  console.debug(`3D&T wizard | ${allItems.length} items no DOM, ${vItems.length} vantagens + ${dItems.length} desvantagens no índice`);
  for (const item of allItems) {
    item.addEventListener("click", () => {
      showDetail(item);
      highlightViewing(item);
    });
    item.addEventListener("mouseenter", () => {
      showDetail(item);
      highlightViewing(item);
    });
    item.addEventListener("focusin", () => {
      showDetail(item);
      highlightViewing(item);
    });
  }

  /* ----- Recompute on any change ----- */
  root.addEventListener("change", recompute);
  root.addEventListener("input", (ev) => {
    if (ev.target.name === "nome") recompute();
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
    vida: { value: Math.max(r * 5, 1), bonus: 0, min: 0, max: Math.max(r * 5, 1) },
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
  for (const item of [...data.vantagens, ...data.desvantagens]) {
    const raw = item.toObject();
    delete raw._id;
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
