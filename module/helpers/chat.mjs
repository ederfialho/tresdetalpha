/**
 * Chat cards e ações de rolagem para o 3D&T Alpha.
 *
 * Fornece:
 *  - `postItemChatCard(item)` — renderiza um card rico no chat para qualquer tipo de item.
 *  - `rollAbilityTest(actor, label, target)` — rolagem 1d6 vs característica (p.24 do core).
 *  - `rollFormula(actor, formula, label)` — rolagem de fórmula livre (FA, FD, etc.).
 *  - `registerChatActions()` — hook que amarra os botões dos cards a handlers.
 *
 * Chamar `registerChatActions()` uma vez em `init` já liga tudo.
 */

const SYSTEM_ID = "3det-foundry-rework";

/* -------------------------------------------- */
/*  Rolagens                                    */
/* -------------------------------------------- */

/**
 * Teste de característica: rola 1d6, sucesso se resultado ≤ alvo (6 é SEMPRE falha, p.24).
 * Usado quando o jogador clica no label de uma característica na ficha.
 */
export async function rollAbilityTest(actor, label, target) {
  const roll = await new Roll("1d6").evaluate();
  const result = roll.total;
  const natural6 = result === 6;
  const success = !natural6 && result <= target;

  const status = success
    ? `<span class="tdt-chat-outcome tdt-chat-outcome--ok"><i class="fas fa-check"></i> Sucesso</span>`
    : `<span class="tdt-chat-outcome tdt-chat-outcome--fail"><i class="fas fa-times"></i> Falha${natural6 ? " (6 automático)" : ""}</span>`;

  const flavor = `
    <div class="tdt-chat-roll">
      <div class="tdt-chat-roll-head">
        <strong>Teste de ${escapeHTML(label)}</strong>
        <small>alvo ≤ ${target}</small>
      </div>
      <div class="tdt-chat-roll-body">
        <span class="tdt-chat-dice">${result}</span>
        ${status}
      </div>
    </div>
  `;

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor,
    rollMode: game.settings.get("core", "rollMode")
  });
  return roll;
}

/**
 * Rolagem de fórmula livre (FD, etc.), com contexto de chat.
 */
export async function rollFormula(actor, formula, label) {
  const rollData = actor?.getRollData?.() ?? {};
  const roll = await new Roll(formula, rollData).evaluate();
  const flavor = `
    <div class="tdt-chat-roll">
      <div class="tdt-chat-roll-head">
        <strong>${escapeHTML(label)}</strong>
        <small>${escapeHTML(formula)}</small>
      </div>
    </div>
  `;
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor,
    rollMode: game.settings.get("core", "rollMode")
  });
  return roll;
}

/**
 * Rolagem de ataque (FA). Modo padrão = 1 ataque. Se `askMulti` = true, abre
 * um diálogo pra configurar quantidade e uso de Ataque/Tiro Múltiplo.
 *
 * Regras do core (pp.39, 70):
 *  - Sem vantagem: todos os N ataques na rodada sofrem H−2.
 *  - Com Ataque Múltiplo (F) ou Tiro Múltiplo (PdF): sem penalidade, mas 1 PM por ataque.
 *  - Máximo de ataques por rodada = Habilidade.
 *
 * @param {Actor} actor
 * @param {string} formula  Fórmula da FA
 * @param {string} label    Rótulo
 * @param {object} [options]
 * @param {boolean} [options.askMulti=false]  Se true, abre dialog pra múltiplo ataque
 */
export async function rollAttack(actor, formula, label, options = {}) {
  const { askMulti = false, tokens = null, extraRollData = {} } = options;

  if (!askMulti) {
    return executeAttack(actor, formula, label, { count: 1, useVantagem: false, tokens, extraRollData });
  }

  const config = await promptMultiAttack(actor, formula, label);
  if (!config) return;
  return executeAttack(actor, formula, label, { ...config, tokens, extraRollData });
}

async function promptMultiAttack(actor, formula, label) {
  const isRanged = formula.includes("poderDeFogo");
  const requiredName = isRanged ? "Tiro Múltiplo" : "Ataque Múltiplo";
  const needleLower = requiredName.toLowerCase();
  const hasVantagem = (actor.items ?? []).some((i) => {
    if (i.type !== "vantagem" && i.type !== "vantagemUnica") return false;
    const nameLower = String(i.name ?? "").toLowerCase();
    // word-boundary match: name equals OR starts/ends with boundary
    const regex = new RegExp(`\\b${needleLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    return regex.test(nameLower);
  });
  const habilidade = Number(actor.system?.abilities?.habilidade?.total ?? 1);
  const maxAttacks = Math.max(1, habilidade);
  const currentPm = Number(actor.system?.magia?.value ?? 0);
  const maxPm = Number(actor.system?.magia?.max ?? 0);

  const content = `
    <div class="tdt-cast-dialog">
      <div class="tdt-cast-meta">
        <div><strong>${escapeHTML(label)}</strong></div>
        <div>Habilidade: <strong>${habilidade}</strong> — máx. <strong>${maxAttacks}</strong> ataques/rodada</div>
        <div>PMs atuais: <strong>${currentPm} / ${maxPm}</strong></div>
        <div>${escapeHTML(requiredName)}: ${hasVantagem ? "<strong style='color:#2d7a2d'>✓ você tem</strong>" : "<em style='color:#a23b3c'>você não tem</em>"}</div>
      </div>
      <label class="tdt-cast-label">
        <span>Número de ataques</span>
        <input type="number" name="count" value="1" min="1" max="${maxAttacks}" autofocus />
      </label>
      <label class="tdt-cast-label">
        <input type="checkbox" name="useVantagem" ${hasVantagem ? "checked" : ""} />
        <span>Usar ${escapeHTML(requiredName)} — gasta 1 PM por ataque e remove a penalidade H−2</span>
      </label>
      <div class="tdt-cast-hint">
        Sem ${escapeHTML(requiredName)}: todos os ataques (incluindo o primeiro) sofrem penalidade de H−2 quando há mais de um.
      </div>
    </div>
  `;

  const DialogV2 = foundry.applications.api.DialogV2;
  try {
    return await DialogV2.prompt({
      window: { title: `Múltiplos ataques — ${label}`, icon: "fas fa-crosshairs" },
      position: { width: 460 },
      content,
      ok: {
        label: "Atacar",
        icon: "fas fa-dice-d6",
        callback: (_ev, _btn, dialog) => {
          const get = (n) => dialog.element.querySelector(`[name="${n}"]`);
          const count = Math.max(1, Math.min(maxAttacks, Number(get("count")?.value) || 1));
          const useVantagem = !!get("useVantagem")?.checked;
          return { count, useVantagem };
        }
      },
      rejectClose: false
    });
  } catch (_e) {
    return null;
  }
}

/** Executa a(s) rolagem(ns) e posta o card. */
async function executeAttack(actor, formula, label, { count, useVantagem, tokens: passedTokens = null, extraRollData = {} }) {
  const rollData = { ...(actor?.getRollData?.() ?? {}), ...extraRollData };
  const multi = count > 1;

  // Sem vantagem e múltiplo: todos sofrem H−2.
  // Com vantagem: normal, mas deduz count PMs.
  const penalty = (multi && !useVantagem) ? 2 : 0;
  const effectiveFormula = penalty > 0 ? `${formula} - ${penalty}` : formula;

  // Pré-check de PMs (deduz depois, só se todos os rolls tiverem sucesso).
  let currentPmForDeduct = 0;
  if (multi && useVantagem) {
    currentPmForDeduct = Number(actor.system?.magia?.value ?? 0);
    if (currentPmForDeduct < count) {
      ui.notifications.warn(`PMs insuficientes: ${currentPmForDeduct} atuais, ${count} necessários para ${count} ataques.`);
      return;
    }
  }

  // Rola N ataques.
  const attackRolls = [];
  for (let i = 0; i < count; i++) {
    const roll = await new Roll(effectiveFormula, rollData).evaluate();
    const firstDie = roll.dice?.[0]?.results?.[0]?.result;
    attackRolls.push({ total: roll.total, critical: firstDie === 6, roll });
  }

  // Deduz PMs agora que todos os rolls foram avaliados.
  if (multi && useVantagem) {
    await actor.update({ "system.magia.value": currentPmForDeduct - count });
  }

  // Se vieram tokens pré-definidos (de um template de área), usa eles;
  // senão, fallback pros alvos marcados pelo usuário.
  const targets = Array.isArray(passedTokens) && passedTokens.length
    ? passedTokens
    : Array.from(game.user?.targets ?? []);
  const speaker = ChatMessage.getSpeaker({ actor });

  // Sem alvos: só mostra os FAs rolados.
  if (targets.length === 0) {
    const rollsHtml = attackRolls.map((r, i) => `
      <div class="tdt-multi-row">
        <span class="tdt-multi-label">Ataque ${i + 1}</span>
        <span class="tdt-multi-fa${r.critical ? " is-critical" : ""}">FA ${r.total}</span>
        ${r.critical ? `<span class="tdt-multi-crit">crítico</span>` : ""}
      </div>
    `).join("");
    const total = attackRolls.reduce((s, r) => s + r.total, 0);
    const content = `
      <div class="tdt-chat-card tdt-chat-card--attack">
        <header class="tdt-chat-head">
          <div class="tdt-chat-title">
            <h3>${escapeHTML(label)}${multi ? ` × ${count}` : ""}</h3>
            <span class="tdt-chat-type">${multi ? (useVantagem ? `${count} PMs gastos` : `penalidade H−2`) : "Ataque"}</span>
          </div>
        </header>
        <div class="tdt-multi-list">${rollsHtml}</div>
        <div class="tdt-attack-no-target">Nenhum alvo marcado. Marque com <kbd>T</kbd> ou aplique manualmente.</div>
        <footer class="tdt-chat-actions">
          <button class="tdt-chat-btn" data-tdt-action="apply-damage-selected" data-damage="${total}">
            <i class="fas fa-heart-crack"></i> Aplicar ${total} a selecionados
          </button>
        </footer>
      </div>
    `;
    await ChatMessage.create({ speaker, content });
    return;
  }

  // Com alvos: pra cada alvo, rola UMA FD e compara com cada ataque.
  const targetResults = [];
  for (const tok of targets) {
    const victim = tok.actor;
    if (!victim) continue;
    const fdFormula = "1d6 + @abilities.armadura.total + @abilities.habilidade.total";
    const fdRoll = await new Roll(fdFormula, victim.getRollData?.() ?? {}).evaluate();
    const fdTotal = fdRoll.total;
    const hits = attackRolls.map((atk) => ({
      fa: atk.total,
      critical: atk.critical,
      damage: Math.max(0, atk.total - fdTotal)
    }));
    const totalDamage = hits.reduce((s, h) => s + h.damage, 0);
    targetResults.push({ victim, uuid: victim.uuid, fdTotal, hits, totalDamage });
  }

  // Conta alvos que sofreram dano (pra decidir se mostra "Aplicar a todos").
  const damagedResults = targetResults.filter((r) => r.totalDamage > 0);
  const grandTotal = damagedResults.reduce((s, r) => s + r.totalDamage, 0);
  const showApplyAll = damagedResults.length > 1;

  const targetsHtml = targetResults.map((r) => {
    // Linha por ataque. Se count=1, o dano já está no botão de total abaixo — não mostra
    // botão de aplicar por linha pra evitar botão duplicado.
    const rows = r.hits.map((h, i) => {
      const result = h.damage > 0
        ? (multi
            ? `<span class="tdt-multi-dmg">${h.damage}</span>
               <button class="tdt-chat-btn tdt-chat-btn--apply" data-tdt-action="apply-damage" data-actor-uuid="${r.uuid}" data-damage="${h.damage}">Aplicar</button>`
            : `<span class="tdt-multi-dmg">${h.damage} de dano</span><span></span>`)
        : `<span class="tdt-multi-def">defendeu</span><span></span>`;
      return `
        <div class="tdt-multi-row">
          <span class="tdt-multi-label">Atq ${i + 1}</span>
          <span class="tdt-multi-fa${h.critical ? " is-critical" : ""}">FA ${h.fa}</span>
          ${result}
        </div>
      `;
    }).join("");

    return `
      <div class="tdt-attack-target">
        <div class="tdt-attack-target-head">
          <strong>${escapeHTML(r.victim.name)}</strong>
          <span class="tdt-attack-target-fd">FD ${r.fdTotal}</span>
        </div>
        <div class="tdt-multi-list">${rows}</div>
        ${r.totalDamage > 0 ? `
          <div class="tdt-multi-total">
            <span>${multi ? "Total" : "Dano"}: <strong>${r.totalDamage}</strong></span>
            <button class="tdt-chat-btn tdt-chat-btn--apply" data-tdt-action="apply-damage" data-actor-uuid="${r.uuid}" data-damage="${r.totalDamage}">
              <i class="fas fa-heart-crack"></i> Aplicar ${r.totalDamage}
            </button>
          </div>` : ""}
      </div>
    `;
  }).join("");

  // Botão de aplicar a todos (quando há múltiplos alvos que sofreram dano).
  const applyAllPayload = damagedResults.map((r) => `${r.uuid}:${r.totalDamage}`).join(",");
  const applyAllHtml = showApplyAll ? `
    <footer class="tdt-chat-actions">
      <button class="tdt-chat-btn tdt-chat-btn--apply tdt-chat-btn--apply-all" data-tdt-action="apply-damage-all" data-targets="${applyAllPayload}">
        <i class="fas fa-heart-crack"></i> Aplicar em todos (${damagedResults.length} alvos, total ${grandTotal})
      </button>
    </footer>
  ` : "";

  const content = `
    <div class="tdt-chat-card tdt-chat-card--attack">
      <header class="tdt-chat-head">
        <div class="tdt-chat-title">
          <h3>${escapeHTML(label)}${multi ? ` × ${count}` : ""}</h3>
          <span class="tdt-chat-type">${multi ? (useVantagem ? `${count} PMs gastos — sem penalidade` : `${count} ataques com H−2`) : "Ataque simples"}</span>
        </div>
      </header>
      <div class="tdt-attack-targets">${targetsHtml}</div>
      ${applyAllHtml}
    </div>
  `;

  await ChatMessage.create({ speaker, content });
}

/**
 * Aplica dano direto ao Actor especificado.
 */
async function applyDamage(actorUuid, damage) {
  if (!game.user.isGM) {
    ui.notifications.warn("Apenas o Mestre pode aplicar dano. Peça ao GM para clicar.");
    return;
  }
  const actor = await fromUuid(actorUuid);
  if (!actor) { ui.notifications.warn("Alvo não encontrado (pode ter sido apagado)."); return; }
  const current = Number(actor.system?.vida?.value ?? 0);
  const newValue = Math.max(0, current - damage);
  await actor.update({ "system.vida.value": newValue });
  ui.notifications.info(`${actor.name}: ${damage} de dano aplicado (${current} → ${newValue} PVs).`);
}

/**
 * Aplica dano aos tokens selecionados (não marcados com T). Rola FD de cada um
 * e subtrai antes de aplicar — mantém o padrão 3D&T de que dano sempre passa por FD.
 * Posta uma mensagem consolidada no chat com o resultado.
 */
async function applyDamageToSelected(faTotal) {
  if (!game.user.isGM) {
    ui.notifications.warn("Apenas o Mestre pode aplicar dano. Peça ao GM para clicar.");
    return;
  }
  const tokens = canvas?.tokens?.controlled ?? [];
  if (!tokens.length) {
    ui.notifications.warn("Selecione um ou mais tokens primeiro.");
    return;
  }

  const rows = [];
  for (const tok of tokens) {
    const actor = tok.actor;
    if (!actor) continue;
    const fdFormula = "1d6 + @abilities.armadura.total + @abilities.habilidade.total";
    const fdRoll = await new Roll(fdFormula, actor.getRollData?.() ?? {}).evaluate();
    const fd = fdRoll.total;
    const damage = Math.max(0, faTotal - fd);
    const current = Number(actor.system?.vida?.value ?? 0);
    const newValue = Math.max(0, current - damage);
    if (damage > 0) await actor.update({ "system.vida.value": newValue });
    rows.push({ actor, fd, damage, current, newValue });
  }

  const rowsHtml = rows.map((r) => `
    <div class="tdt-attack-target">
      <div class="tdt-attack-target-head">
        <strong>${r.actor.name}</strong>
        <span class="tdt-attack-target-fd">FD ${r.fd}</span>
      </div>
      <div class="tdt-attack-target-result">
        ${r.damage > 0
          ? `<span class="tdt-attack-damage-val">${r.damage} dano</span>
             <small>(${r.current} → ${r.newValue} PVs)</small>`
          : `<span class="tdt-attack-defended"><i class="fas fa-shield"></i> Defendeu</span>`}
      </div>
    </div>
  `).join("");

  const content = `
    <div class="tdt-chat-card tdt-chat-card--attack">
      <header class="tdt-chat-head">
        <div class="tdt-chat-title">
          <h3>Dano aplicado (FA ${faTotal})</h3>
          <span class="tdt-chat-type">FD rolada para cada alvo</span>
        </div>
      </header>
      <div class="tdt-attack-targets">${rowsHtml}</div>
    </div>
  `;
  await ChatMessage.create({ content });
}

/**
 * Faz parse de uma fórmula de dano embutida na descrição (ex: "FA=H+6d", "FA=10d").
 * Converte tokens do 3D&T (F, H, A, R, PdF) em variáveis @abilities, e Nd em Nd6.
 * @returns {string|null}
 */
export function parseDamageHint(text) {
  if (!text) return null;
  const m = String(text).match(/FA\s*=\s*([^.,<(\n]+?)(?=[.,<(]|\s*$)/i);
  if (!m) return null;
  let f = m[1].trim();

  // Primeiro, detecta escalonamento por PMs na forma "Nd por/para cada M PMs".
  // Ex: "1d por 2 PMs" → número de dados escala com gasto. Converte pra `floor(@pmCost/M)d`.
  f = f.replace(
    /(\d+)d\s+(?:por|pra|para)\s+(?:cada\s+)?(\d+)\s+PMs?/gi,
    "(floor(@pmCost/$2))d"
  );
  // Variante sem o número de dados explícito: "+PMs" (escala 1 por PM)
  // já é tratada pelo replace de PMs abaixo.

  // Substitui "PMs" standalone pelo custo escolhido.
  f = f.replace(/\bPMs?\b/gi, "@pmCost");

  // Palavras-chave completas (PT)
  f = f.replace(/\bArmadura\b/gi, "@abilities.armadura.total");
  f = f.replace(/\bHabilidade\b/gi, "@abilities.habilidade.total");
  f = f.replace(/\bForça\b/gi, "@abilities.forca.total");
  f = f.replace(/\bResistência\b/gi, "@abilities.resistencia.total");
  f = f.replace(/\bPoder de Fogo\b/gi, "@abilities.poderDeFogo.total");

  // Abreviações: PdF antes de F pra não quebrar o match
  f = f.replace(/\bPdF\b/g, "@abilities.poderDeFogo.total");
  f = f.replace(/\bH\b/g, "@abilities.habilidade.total");
  f = f.replace(/\bF\b/g, "@abilities.forca.total");
  f = f.replace(/\bA\b/g, "@abilities.armadura.total");
  f = f.replace(/\bR\b/g, "@abilities.resistencia.total");

  // Nd (sem tamanho explícito ou parentização) → Nd6
  // Cobre tanto "5d" quanto "(floor(@pmCost/2))d" (não vai ter dígito após o d nesses casos).
  f = f.replace(/(\d+)d(?!\d)/g, "$1d6");
  f = f.replace(/\)d(?!\d)/g, ")d6");

  // Limpa palavras PT residuais no fim (gastos, extras, no final) que ficam soltas
  // depois das substituições e quebrariam o Roll do Foundry.
  f = f.replace(/\s+(gastos?|extras?|m[aá]x(?:imo)?|acima|at[ée]|no|do|da|de|a\s+cada|aliado)\b.*$/gi, "");
  // Dangling PT connectors no meio ("para cada N" que sobrou).
  f = f.replace(/\s+(?:para|pra|por)\s+cada\s+\d+\s*$/gi, "");

  return f.trim();
}

/* -------------------------------------------- */
/*  Chat card pro item                          */
/* -------------------------------------------- */

/** Posta um card rico no chat. */
export async function postItemChatCard(item) {
  if (!item) return null;
  const actor = item.actor;
  const s = item.system ?? {};

  const chips = [];
  if (s.categoria)                       chips.push(chip(s.categoria));
  if (s.escola)                          chips.push(chip(s.escola, "school"));
  if (s.custo != null && s.custo !== "") chips.push(chip(formatCusto(s.custo, item.type), "cost"));
  if (s.custoPMs)                        chips.push(chip(s.custoPMs, "pm"));
  if (s.alcance)                         chips.push(chip(`Alcance: ${s.alcance}`));
  if (s.duracao)                         chips.push(chip(`Duração: ${s.duracao}`));
  if (s.tipo)                            chips.push(chip(`Tipo: ${s.tipo}`));
  if (s.exigencias)                      chips.push(chip(`Exige: ${s.exigencias}`, "req"));
  if (s.prerequisitos)                   chips.push(chip(`Pré-req: ${s.prerequisitos}`, "req"));

  const description = (s.efeito && String(s.efeito).trim())
    || (s.description && String(s.description).trim())
    || "<em>Sem descrição.</em>";

  const actions = [];
  const hasActor = !!actor;

  actions.push(button("open-sheet", "fa-external-link-alt", "Abrir ficha"));
  if (item.type === "magia" && hasActor) {
    actions.push(button("cast-magia", "fa-sparkles", "Conjurar"));
  }

  const content = `
    <div class="tdt-chat-card" data-item-uuid="${item.uuid}" data-actor-uuid="${actor?.uuid ?? ""}">
      <header class="tdt-chat-head">
        <img class="tdt-chat-img" src="${escapeHTML(item.img)}" />
        <div class="tdt-chat-title">
          <h3>${escapeHTML(item.name)}</h3>
          <span class="tdt-chat-type">${localizeType(item.type)}</span>
        </div>
      </header>
      ${chips.length ? `<div class="tdt-chat-chips">${chips.join("")}</div>` : ""}
      <div class="tdt-chat-desc">${description}</div>
      <footer class="tdt-chat-actions">${actions.join("")}</footer>
    </div>
  `;

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    flags: { [SYSTEM_ID]: { itemUuid: item.uuid, actorUuid: actor?.uuid } }
  });
}

function chip(text, kind = "") {
  const cls = kind ? `tdt-chat-chip tdt-chat-chip--${kind}` : "tdt-chat-chip";
  return `<span class="${cls}">${escapeHTML(text)}</span>`;
}

function button(action, icon, label) {
  return `<button type="button" class="tdt-chat-btn" data-tdt-action="${action}"><i class="fas ${icon}"></i> ${label}</button>`;
}

function formatCusto(custo, type) {
  if (typeof custo === "number") return `${custo} pt`;
  return String(custo);
}

function localizeType(type) {
  return game.i18n.localize(`TYPES.Item.${type}`) || type;
}

/* -------------------------------------------- */
/*  Conjuração de magia                         */
/* -------------------------------------------- */

/**
 * Abre um diálogo pra confirmar o custo em PMs, deduz do actor, posta o resultado.
 */
export async function castMagia(magia) {
  if (!magia) return;
  const actor = magia.actor;
  if (!actor) {
    ui.notifications.warn("A magia precisa estar numa ficha de personagem pra ser conjurada.");
    return;
  }

  const s = magia.system ?? {};
  const custoStr = String(s.custo ?? "");
  const pmMatch = custoStr.match(/(\d+)/);
  const defaultCost = pmMatch ? Number(pmMatch[1]) : 1;
  const currentPm = Number(actor.system?.magia?.value ?? 0);
  const maxPm = Number(actor.system?.magia?.max ?? 0);

  // Tenta extrair fórmula de dano da descrição (procura "FA=..." na primeira ocorrência).
  const defaultDamage = parseDamageHint(s.description) || parseDamageHint(s.efeito) || "";

  // Info do template de área, se a magia tiver.
  const tpl = s.template ?? {};
  const hasTemplate = !!tpl.type;
  const templateLabel = hasTemplate ? formatTemplateLabel(tpl) : "";

  const DialogV2 = foundry.applications.api.DialogV2;
  const content = `
    <div class="tdt-cast-dialog">
      <div class="tdt-cast-meta">
        <div><strong>${escapeHTML(magia.name)}</strong></div>
        ${s.escola ? `<div>Escola: <em>${escapeHTML(s.escola)}</em></div>` : ""}
        <div>Custo original: <em>${escapeHTML(custoStr) || "não definido"}</em></div>
        <div>PMs atuais: <strong>${currentPm} / ${maxPm}</strong></div>
        ${hasTemplate ? `<div>Área: <strong style="color:#7a5a1e;">${escapeHTML(templateLabel)}</strong></div>` : ""}
      </div>
      <label class="tdt-cast-label">
        <span>PMs a gastar</span>
        <input type="number" name="pmCost" value="${defaultCost}" min="0" max="${currentPm}" autofocus />
      </label>
      <label class="tdt-cast-label">
        <span>Fórmula de dano <small>(opcional — deixe vazio se não houver)</small></span>
        <input type="text" name="damageFormula" value="${escapeAttr2(defaultDamage)}" placeholder="Ex: 6d6 + @abilities.habilidade.total" />
      </label>
      <label class="tdt-cast-label">
        <input type="checkbox" name="rollDamage" ${defaultDamage ? "checked" : ""} />
        <span>Rolar dano${hasTemplate ? " contra alvos na área" : " contra alvos marcados"}</span>
      </label>
      ${hasTemplate ? `
      <label class="tdt-cast-label">
        <input type="checkbox" name="placeTemplate" checked />
        <span>Posicionar template de área no canvas</span>
      </label>
      ` : ""}
    </div>
  `;

  let data = null;
  try {
    data = await DialogV2.prompt({
      window: { title: `Conjurar ${magia.name}`, icon: "fas fa-sparkles" },
      position: { width: 440 },
      content,
      ok: {
        label: "Conjurar",
        icon: "fas fa-check",
        callback: (_ev, _btn, dialog) => {
          const get = (n) => dialog.element.querySelector(`[name="${n}"]`);
          return {
            pmCost: Number(get("pmCost")?.value) || 0,
            damageFormula: String(get("damageFormula")?.value || "").trim(),
            rollDamage: !!get("rollDamage")?.checked,
            placeTemplate: !!get("placeTemplate")?.checked
          };
        }
      },
      rejectClose: false
    });
  } catch (_e) { return; }
  if (!data) return;

  const cost = Math.max(0, Math.floor(data.pmCost));
  if (cost > currentPm) {
    ui.notifications.warn(`PMs insuficientes: ${currentPm} atuais, ${cost} necessários.`);
    return;
  }

  // Deduz PMs.
  await actor.update({ "system.magia.value": currentPm - cost });

  // Posta card de conjuração.
  const cardContent = `
    <div class="tdt-chat-card tdt-chat-card--cast" data-item-uuid="${magia.uuid}">
      <header class="tdt-chat-head">
        <img class="tdt-chat-img" src="${escapeHTML(magia.img)}" />
        <div class="tdt-chat-title">
          <h3>${escapeHTML(magia.name)}</h3>
          <span class="tdt-chat-type"><i class="fas fa-sparkles"></i> conjurada</span>
        </div>
      </header>
      <div class="tdt-chat-chips">
        <span class="tdt-chat-chip tdt-chat-chip--cost">${cost} PMs gastos</span>
        <span class="tdt-chat-chip tdt-chat-chip--pm">PMs restantes: ${currentPm - cost} / ${maxPm}</span>
        ${s.escola ? `<span class="tdt-chat-chip tdt-chat-chip--school">${escapeHTML(s.escola)}</span>` : ""}
        ${s.alcance ? `<span class="tdt-chat-chip">Alcance: ${escapeHTML(s.alcance)}</span>` : ""}
        ${s.duracao ? `<span class="tdt-chat-chip">Duração: ${escapeHTML(s.duracao)}</span>` : ""}
      </div>
      <div class="tdt-chat-desc">${s.description || s.efeito || ""}</div>
    </div>
  `;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: cardContent,
    flags: { [SYSTEM_ID]: { magiaCast: true, magiaUuid: magia.uuid } }
  });

  // Posiciona o template de área, se a magia tem e o usuário marcou.
  let areaTokens = null;
  if (hasTemplate && data.placeTemplate) {
    const { placeMagiaTemplate, getTokensInTemplate } = await import("./measured-templates.mjs");
    const placed = await placeMagiaTemplate(magia, actor);
    if (placed) {
      areaTokens = getTokensInTemplate(placed);
      const msg = areaTokens.length
        ? `Área posicionada. ${areaTokens.length} token(s) dentro.`
        : "Área posicionada. Nenhum token detectado dentro — vai tentar alvos marcados com T.";
      ui.notifications.info(msg);
    }
  }

  // Se pediu pra rolar dano e tem fórmula, dispara o ataque.
  // Se há template com tokens detectados, usa esses como alvos (ignora targets do usuário).
  // Passa pmCost como extraRollData pra fórmulas que usam "PMs" (Bola de Fogo, etc.) funcionarem.
  if (data.rollDamage && data.damageFormula) {
    try {
      await rollAttack(actor, data.damageFormula, `${magia.name} — Dano`, {
        tokens: areaTokens,
        extraRollData: { pmCost: cost }
      });
    } catch (err) {
      console.error("3D&T | erro ao rolar dano da magia:", err);
      ui.notifications.error(`Fórmula inválida: ${data.damageFormula}`);
    }
  }
}

function formatTemplateLabel(tpl) {
  const shapes = { circle: "circular", cone: "cone", ray: "linha", rect: "quadrada" };
  const shape = shapes[tpl.type] || tpl.type;
  const d = Number(tpl.distance) || 0;
  const angle = tpl.type === "cone" ? `, ${Number(tpl.angle) || 90}°` : "";
  const width = tpl.type === "ray" ? `, largura ${Number(tpl.width) || 1.5}m` : "";
  return `${shape} ${d}m${angle}${width}`;
}

function escapeAttr2(s) {
  return String(s ?? "").replace(/"/g, "&quot;");
}

function escapeHTML(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* -------------------------------------------- */
/*  Hook: amarra botões nos cards               */
/* -------------------------------------------- */

export function registerChatActions() {
  Hooks.on("renderChatMessageHTML", (_message, element) => {
    const root = element instanceof HTMLElement ? element : element?.[0];
    if (!root) return;
    for (const btn of root.querySelectorAll("button[data-tdt-action]")) {
      const action = btn.dataset.tdtAction;
      if (action === "apply-damage" || action === "apply-damage-selected") {
        btn.addEventListener("click", onCardActionClick);
      } else {
        btn.addEventListener("click", onChatActionClick);
      }
    }
  });
}

async function onChatActionClick(event) {
  event.preventDefault();
  event.stopPropagation();
  const btn = event.currentTarget;
  const card = btn.closest(".tdt-chat-card");
  const action = btn.dataset.tdtAction;
  const itemUuid = card?.dataset.itemUuid;
  if (!itemUuid) return;

  let item = null;
  try {
    item = await fromUuid(itemUuid);
  } catch (_e) { /* ignore */ }

  if (!item) {
    ui.notifications.warn("Item não encontrado (pode ter sido apagado).");
    return;
  }

  switch (action) {
    case "open-sheet":
      item.sheet?.render(true);
      break;
    case "cast-magia":
      await castMagia(item);
      break;
  }
}

/**
 * Handler genérico dos botões de ataque/dano nos cards. Ligado separadamente
 * porque os cards de ataque não têm item (são gerados direto pelo rollAttack).
 */
async function onCardActionClick(event) {
  const btn = event.currentTarget;
  const action = btn.dataset.tdtAction;

  switch (action) {
    case "apply-damage": {
      event.preventDefault();
      event.stopPropagation();
      const uuid = btn.dataset.actorUuid;
      const dmg = Number(btn.dataset.damage) || 0;
      if (uuid && dmg > 0) await applyDamage(uuid, dmg);
      break;
    }
    case "apply-damage-selected": {
      event.preventDefault();
      event.stopPropagation();
      const dmg = Number(btn.dataset.damage) || 0;
      if (dmg > 0) await applyDamageToSelected(dmg);
      break;
    }
    case "apply-damage-all": {
      event.preventDefault();
      event.stopPropagation();
      if (!game.user.isGM) {
        ui.notifications.warn("Apenas o Mestre pode aplicar dano. Peça ao GM para clicar.");
        return;
      }
      const payload = String(btn.dataset.targets || "");
      if (!payload) break;
      const pairs = payload.split(",").filter(Boolean);
      for (const pair of pairs) {
        const [uuid, dmg] = pair.split(":");
        if (uuid && Number(dmg) > 0) await applyDamage(uuid, Number(dmg));
      }
      // Desabilita o botão pra não aplicar duas vezes sem querer.
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.innerHTML = '<i class="fas fa-check"></i> Aplicado';
      break;
    }
  }
}
