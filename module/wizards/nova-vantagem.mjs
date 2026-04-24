/**
 * Wizard "Nova vantagem/desvantagem" — abre um DialogV2 guiado
 * pra mestres criarem rapidamente novas vantagens e desvantagens
 * sem precisar montar o Item manualmente.
 *
 * Chamadas:
 *   game.tresdetalpha.novaVantagem()                      — cria vantagem
 *   game.tresdetalpha.novaVantagem({ type: "desvantagem" })
 *   game.tresdetalpha.novaVantagem({ actor, type })       — cria já num actor
 *   game.tresdetalpha.novaVantagem({ pack: "world.tresdetalpha-vantagens" })
 */

const TEMPLATES = {
  vantagem: [
    {
      key: "combate-ativa", label: "Combate (ativa)",
      hint: "Ataque ou manobra ofensiva com custo em PMs",
      seed: { custo: 1, categoria: "Combate", custoPMs: "1 PM", duracao: "Uma ação" }
    },
    {
      key: "combate-passiva", label: "Combate (passiva)",
      hint: "Bônus permanente de combate",
      seed: { custo: 1, categoria: "Combate", custoPMs: "", duracao: "Permanente" }
    },
    {
      key: "magia", label: "Magia / poder arcano",
      hint: "Habilidade mágica com custo de PMs",
      seed: { custo: 2, categoria: "Magia", custoPMs: "2 PMs", duracao: "Até fim do combate" }
    },
    {
      key: "defesa", label: "Defesa / reação",
      hint: "Reflexão, Deflexão, esquivas, etc.",
      seed: { custo: 1, categoria: "Defesa", custoPMs: "2 PMs", duracao: "Uma esquiva" }
    },
    {
      key: "movimento", label: "Movimento",
      hint: "Aceleração, voo, teleporte, mobilidade",
      seed: { custo: 1, categoria: "Movimento", custoPMs: "1 PM", duracao: "Uma ação" }
    },
    {
      key: "social", label: "Social / recurso",
      hint: "Boa Fama, Aliado, Patrono, Riqueza",
      seed: { custo: 1, categoria: "Social", custoPMs: "", duracao: "Permanente" }
    },
    {
      key: "recuperacao", label: "Recuperação",
      hint: "Energia Extra, Regeneração, curas passivas",
      seed: { custo: 1, categoria: "Recuperação", custoPMs: "2 PMs", duracao: "Um turno de concentração" }
    },
    {
      key: "em-branco", label: "Em branco",
      hint: "Partir do zero, sem sugestões",
      seed: { custo: 1, categoria: "", custoPMs: "", duracao: "" }
    }
  ],
  desvantagem: [
    {
      key: "fisica", label: "Física",
      hint: "Limitação corporal ou ambiental",
      seed: { custo: 1, categoria: "Física", custoPMs: "", duracao: "Permanente" }
    },
    {
      key: "mental", label: "Mental",
      hint: "Código de Honra, Fúria, Devoção, Maldição",
      seed: { custo: 1, categoria: "Mental", custoPMs: "", duracao: "Permanente" }
    },
    {
      key: "social", label: "Social",
      hint: "Má Fama, Inculto, Monstruoso",
      seed: { custo: 1, categoria: "Social", custoPMs: "", duracao: "Permanente" }
    },
    {
      key: "em-branco", label: "Em branco",
      hint: "Partir do zero, sem sugestões",
      seed: { custo: 1, categoria: "", custoPMs: "", duracao: "" }
    }
  ],
  vantagemUnica: [
    {
      key: "em-branco", label: "Em branco",
      hint: "Vantagem única racial ou exclusiva",
      seed: { custo: 2, categoria: "Racial", custoPMs: "", duracao: "Permanente" }
    }
  ]
};

const TYPE_LABELS = {
  vantagem: "Nova vantagem",
  desvantagem: "Nova desvantagem",
  vantagemUnica: "Nova vantagem única"
};

/**
 * Abre o wizard.
 * @param {object} [opts]
 * @param {"vantagem"|"desvantagem"|"vantagemUnica"} [opts.type="vantagem"]
 * @param {Actor} [opts.actor] Se passado, cria como item embutido nesse actor.
 * @param {string} [opts.pack] Se passado, cria dentro do compêndio com esse id (ex: "world.tresdetalpha-vantagens").
 */
export async function novaVantagem({ type = "vantagem", actor = null, pack = null } = {}) {
  const templates = TEMPLATES[type] ?? TEMPLATES.vantagem;

  const content = `
    <div class="tdt-wizard">
      <div>
        <div style="font-size:11px; color:#d4a94d; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">
          Modelo inicial
        </div>
        <div class="tdt-wizard-templates">
          ${templates.map((t, i) => `
            <label class="tdt-wizard-template ${i === 0 ? "active" : ""}" data-template="${t.key}">
              <input type="radio" name="template" value="${t.key}" ${i === 0 ? "checked" : ""} style="display:none;" />
              <strong>${t.label}</strong>
              <small>${t.hint}</small>
            </label>
          `).join("")}
        </div>
      </div>

      <label>
        Nome
        <input type="text" name="nome" placeholder="Ex: Explosão Energética" required />
      </label>

      <div class="tdt-wizard-row">
        <label>
          Custo em pontos
          <input type="number" name="custo" value="1" min="0" max="10" step="1" />
        </label>
        <label>
          Categoria
          <input type="text" name="categoria" value="" placeholder="Combate, Magia..." />
        </label>
      </div>

      <div class="tdt-wizard-row">
        <label>
          Custo em PMs
          <input type="text" name="custoPMs" value="" placeholder="Ex: 1 PM, 2 PMs/turno" />
        </label>
        <label>
          Duração
          <input type="text" name="duracao" value="" placeholder="Ex: Permanente, 1 turno" />
        </label>
      </div>

      <label>
        Pré-requisitos
        <input type="text" name="prerequisitos" value="" placeholder="Ex: Magia Branca, Habilidade 2+" />
      </label>

      <label>
        Efeito mecânico
        <textarea name="efeito" rows="4" placeholder="O que a vantagem faz em regras..." style="resize: vertical;"></textarea>
      </label>

      <label>
        Descrição (sabor / narrativa)
        <textarea name="description" rows="3" placeholder="Contexto narrativo, visual, história..." style="resize: vertical;"></textarea>
      </label>
    </div>
  `;

  const DialogV2 = foundry.applications.api.DialogV2;
  const data = await DialogV2.prompt({
    window: { title: TYPE_LABELS[type] ?? TYPE_LABELS.vantagem, icon: "fas fa-star" },
    position: { width: 560 },
    content,
    ok: {
      label: "Criar",
      icon: "fas fa-plus",
      callback: (_event, button, dialog) => {
        const form = dialog.element.querySelector(".tdt-wizard");
        if (!form) return null;
        const get = (k) => form.querySelector(`[name="${k}"]`)?.value ?? "";
        return {
          template: form.querySelector('input[name="template"]:checked')?.value ?? templates[0].key,
          nome: get("nome").trim(),
          custo: Number(get("custo")) || 0,
          categoria: get("categoria").trim(),
          custoPMs: get("custoPMs").trim(),
          duracao: get("duracao").trim(),
          prerequisitos: get("prerequisitos").trim(),
          efeito: get("efeito").trim(),
          description: get("description").trim()
        };
      }
    },
    rejectClose: false,
    render: (_event, dialog) => {
      // Wire up template cards to pre-fill fields and visual state.
      const root = dialog.element;
      const cards = root.querySelectorAll(".tdt-wizard-template");
      const applyTemplate = (key) => {
        const tpl = templates.find((t) => t.key === key);
        if (!tpl) return;
        const seed = tpl.seed;
        const set = (k, v) => {
          const el = root.querySelector(`[name="${k}"]`);
          if (!el) return;
          if (!el.value) el.value = v; // só preenche campos vazios
        };
        if (seed.custo != null) set("custo", seed.custo);
        set("categoria", seed.categoria);
        set("custoPMs", seed.custoPMs);
        set("duracao", seed.duracao);
      };
      cards.forEach((card) => {
        card.addEventListener("click", () => {
          cards.forEach((c) => c.classList.remove("active"));
          card.classList.add("active");
          const input = card.querySelector('input[type="radio"]');
          if (input) input.checked = true;
          applyTemplate(card.dataset.template);
        });
      });
      applyTemplate(templates[0].key);
    }
  });

  if (!data || !data.nome) return null;

  const itemData = {
    name: data.nome,
    type,
    system: {
      nome: data.nome,
      custo: data.custo,
      categoria: data.categoria,
      custoPMs: data.custoPMs,
      duracao: data.duracao,
      prerequisitos: data.prerequisitos,
      efeito: data.efeito,
      description: data.description
    }
  };

  try {
    if (actor) {
      const [doc] = await actor.createEmbeddedDocuments("Item", [itemData]);
      doc?.sheet?.render(true);
      return doc;
    }
    if (pack) {
      const [doc] = await Item.createDocuments([itemData], { pack });
      doc?.sheet?.render(true);
      return doc;
    }
    const doc = await Item.create(itemData);
    doc?.sheet?.render(true);
    return doc;
  } catch (err) {
    console.error("3D&T Alpha | novaVantagem:", err);
    ui.notifications.error("Falha ao criar o item. Veja o console pra detalhes.");
    return null;
  }
}
