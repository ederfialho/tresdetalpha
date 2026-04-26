/**
 * Templates de área (AoE) pra magias do 3D&T Alpha.
 *
 * Implementa placement interativo próprio — o V14 core não expõe mais
 * `drawPreview()` no MeasuredTemplate, então fazemos o mouse tracking
 * direto via eventos do canvas.stage (PIXI).
 *
 * Formas: circle | cone | ray | rect
 */

const SYSTEM_ID = "tresdetalpha";

/**
 * Cria preview interativo de um template baseado no schema `system.template`
 * de uma magia. Usuário movimenta o mouse pra posicionar, clica pra confirmar
 * ou ESC/botão-direito pra cancelar.
 *
 * @param {Item} magia
 * @param {Actor} actor
 * @returns {Promise<MeasuredTemplateDocument|null>}
 */
export async function placeMagiaTemplate(magia, actor) {
  const t = magia?.system?.template;
  if (!t || !t.type) return null;

  if (!canvas?.ready) {
    ui.notifications.warn("Cena não está pronta — abra uma cena antes de conjurar com área.");
    return null;
  }

  // Posição inicial: no token do lançador, se houver.
  const token = actor?.getActiveTokens?.()[0] ?? canvas.tokens?.controlled[0];
  const startX = token?.center?.x ?? canvas.dimensions.width / 2;
  const startY = token?.center?.y ?? canvas.dimensions.height / 2;

  const distance = Math.max(Number(t.distance) || 1, 1);
  const width = Math.max(Number(t.width) || 1.5, 1);
  const angle = Number(t.angle) || 90;

  const data = {
    t: t.type,
    user: game.user.id,
    distance,
    direction: 0,
    x: startX,
    y: startY,
    fillColor: game.user.color?.css ?? game.user.color ?? "#ff3636",
    flags: {
      [SYSTEM_ID]: {
        magiaUuid: magia.uuid,
        actorUuid: actor?.uuid ?? null
      }
    }
  };
  if (t.type === "cone") data.angle = angle;
  if (t.type === "ray")  data.width = width;

  // Cria o preview (Placeable sem persistir no Scene ainda).
  let preview;
  const DocClass = CONFIG.MeasuredTemplate.documentClass;
  const ObjClass = CONFIG.MeasuredTemplate.objectClass;
  try {
    const tempDoc = new DocClass(data, { parent: canvas.scene });
    preview = new ObjClass(tempDoc);
    canvas.templates.preview.addChild(preview);
    await preview.draw();
  } catch (err) {
    console.error("3D&T | Falha ao criar preview do template:", err);
    ui.notifications.error("Não foi possível criar o preview do template.");
    return null;
  }

  // Ativa a camada de templates pra o preview ficar visível acima de tudo.
  const previousLayer = canvas.activeLayer;
  try { canvas.templates.activate(); } catch (_e) { /* ignora */ }

  ui.notifications.info("Mova o mouse e clique pra posicionar. ESC ou botão-direito cancela.");

  return new Promise((resolve) => {
    let resolved = false;
    let lastMove = 0;

    const getPos = (event) => {
      // V14: event.data.getLocalPosition(canvas.stage) ou event.global
      const local = event?.data?.getLocalPosition?.(canvas.stage);
      if (local) return local;
      if (event?.global) return canvas.stage.toLocal(event.global);
      return null;
    };

    const onMove = (event) => {
      if (resolved) return;
      const now = Date.now();
      if (now - lastMove < 20) return;
      lastMove = now;
      const pos = getPos(event);
      if (!pos) return;
      try {
        preview.document.updateSource({ x: pos.x, y: pos.y });
        preview.refresh();
      } catch (_e) { /* ignora refresh errors */ }
    };

    const onClick = async (event) => {
      if (resolved) return;
      // Botão esquerdo = confirmar; direito = cancelar
      const isRight = event?.data?.button === 2 || event?.button === 2;
      resolved = true;
      cleanup();
      if (isRight) return resolve(null);

      const pos = getPos(event);
      const x = pos?.x ?? preview.document.x;
      const y = pos?.y ?? preview.document.y;
      try {
        const [placed] = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
          ...data,
          x, y,
          direction: preview.document.direction ?? 0
        }]);
        resolve(placed ?? null);
      } catch (err) {
        console.error("3D&T | Falha ao persistir template:", err);
        resolve(null);
      }
    };

    const onKey = (event) => {
      if (resolved) return;
      if (event.key === "Escape") {
        resolved = true;
        cleanup();
        resolve(null);
      }
    };

    const onWheel = (event) => {
      // Scroll do mouse gira o template (útil pra cones/rays)
      if (resolved) return;
      if (!["cone", "ray"].includes(t.type)) return;
      event.preventDefault?.();
      event.stopPropagation?.();
      const delta = Math.sign(event.deltaY) * 15;
      try {
        const cur = preview.document.direction ?? 0;
        preview.document.updateSource({ direction: ((cur + delta) % 360 + 360) % 360 });
        preview.refresh();
      } catch (_e) {}
    };

    const cleanup = () => {
      try { canvas.stage?.off?.("pointermove", onMove); } catch (_e) {}
      try { canvas.stage?.off?.("mousemove", onMove); } catch (_e) {}
      try { canvas.stage?.off?.("pointerdown", onClick); } catch (_e) {}
      try { canvas.stage?.off?.("mousedown", onClick); } catch (_e) {}
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("wheel", onWheel, { capture: true });
      try {
        if (preview && !preview.destroyed) {
          canvas.templates.preview.removeChild(preview);
          preview.destroy({ children: true });
        }
      } catch (_e) {}
      try { previousLayer?.activate?.(); } catch (_e) {}
    };

    // Registra listeners em ambos os padrões (PIXI v6/v7 usa pointer*, alguns casos mouse*)
    canvas.stage.on?.("pointermove", onMove);
    canvas.stage.on?.("pointerdown", onClick);
    canvas.stage.on?.("mousemove", onMove);
    canvas.stage.on?.("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    document.addEventListener("wheel", onWheel, { capture: true, passive: false });
  });
}

/**
 * Detecta tokens cujo centro está dentro da área de um MeasuredTemplate.
 * Usa o shape do PIXI quando disponível, com fallback pro cálculo manual
 * (mais confiável logo após criar o template, antes do PIXI renderizar).
 * @param {MeasuredTemplateDocument} template
 * @returns {Token[]}
 */
export function getTokensInTemplate(template) {
  if (!template || !canvas?.ready) return [];

  const tx = template.x;
  const ty = template.y;
  const nativeShape = template.object?.shape;
  const hasNative = !!(nativeShape && typeof nativeShape.contains === "function");

  const hits = [];
  for (const token of canvas.tokens?.placeables ?? []) {
    if (!token.actor) continue;
    const c = token.center;
    const localX = c.x - tx;
    const localY = c.y - ty;

    let inside = null;
    if (hasNative) {
      try { inside = nativeShape.contains(localX, localY); }
      catch (_e) { inside = null; }
    }
    if (inside === null) {
      inside = computeTemplateContains(template, localX, localY);
    }

    if (inside) hits.push(token);
  }
  return hits;
}

/**
 * Cálculo manual de "ponto dentro de template" pra quando o shape nativo
 * do PIXI ainda não está pronto ou é inacessível. Implementa as 4 formas
 * suportadas pelo Foundry.
 *
 * @param {MeasuredTemplateDocument|object} template
 * @param {number} localX  x relativo ao centro/origem do template
 * @param {number} localY  y relativo ao centro/origem do template
 * @returns {boolean}
 */
function computeTemplateContains(template, localX, localY) {
  const t = template.t ?? template.type;
  const distance = Number(template.distance) || 0;
  const angle = Number(template.angle) || 90;
  const width = Number(template.width) || 1.5;
  const direction = Number(template.direction) || 0;

  // Converte unidades de jogo (metros no 3D&T) pra pixels.
  const grid = canvas.scene?.grid ?? canvas.grid;
  const gridSize = Number(grid?.size ?? 100);
  const gridDist = Number(grid?.distance ?? 1);
  const pxPerUnit = gridDist > 0 ? gridSize / gridDist : 1;

  if (t === "circle") {
    const r = distance * pxPerUnit;
    return (localX * localX + localY * localY) <= (r * r);
  }

  if (t === "cone") {
    const r = distance * pxPerUnit;
    const dist = Math.sqrt(localX * localX + localY * localY);
    if (dist > r) return false;
    const dirRad = direction * Math.PI / 180;
    const halfAngle = (angle * Math.PI / 180) / 2;
    const pointAngle = Math.atan2(localY, localX);
    let diff = pointAngle - dirRad;
    while (diff > Math.PI)  diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return Math.abs(diff) <= halfAngle;
  }

  if (t === "ray") {
    const len = distance * pxPerUnit;
    const halfW = (width * pxPerUnit) / 2;
    const dirRad = direction * Math.PI / 180;
    const dx = Math.cos(dirRad);
    const dy = Math.sin(dirRad);
    const projLen = localX * dx + localY * dy;
    const projW = -localX * dy + localY * dx;
    return projLen >= 0 && projLen <= len && Math.abs(projW) <= halfW;
  }

  if (t === "rect") {
    // Foundry rect: distance é a diagonal. Lado = distance / √2. Assumimos centrado.
    const side = (distance * pxPerUnit) / Math.SQRT2;
    return Math.abs(localX) <= side / 2 && Math.abs(localY) <= side / 2;
  }

  return false;
}

/**
 * Apaga um template. Útil pra chat-action "limpar".
 */
export async function clearTemplate(templateUuid) {
  try {
    const doc = await fromUuid(templateUuid);
    if (doc?.delete) await doc.delete();
  } catch (err) {
    console.warn("3D&T | não foi possível apagar template:", err);
  }
}
