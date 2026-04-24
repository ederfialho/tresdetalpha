# Plano de Migração — 3D&T Alpha → Foundry VTT V14

**Versão alvo:** Foundry V14 exclusivo (minimum/verified/maximum = 14)
**Estratégia:** modernização completa (DataModels + ApplicationV2 + limpeza de legado)
**Versão do sistema a publicar:** sugestão `0.2.0` (marco de modernização; breaking para mundos em V11–V13)

---

## 0. Contexto / estado atual detectado

- Código pequeno e limpo, cerca de ~760 linhas de JS em 7 arquivos `.mjs`.
- `system.json`: `minimum: 11`, `verified: 13.351`, `maximum: 13`.
- `template.json`: 2 Actors (`personagem`, `npc`), 6 Items (`vantagem`, `desvantagem`, `vantagemUnica`, `pericia`, `magia`, `objetoMagico`). Schema JSON clássico, sem DataModels.
- Sheets herdam de `ActorSheet`/`ItemSheet` (V1), usam jQuery (`html.find`) e `mergeObject`/`duplicate` globais.
- `prepareDerivedData` em `module/documents/actor.mjs` calcula `total` das características, `forcaDeAtaque`, `forcaDefesa`, `vida.max`, `magia.max`.
- `module/helpers/effects.mjs` usa a API V13 de ActiveEffects (`e.changes`, `origin: owner.uuid`, `createEmbeddedDocuments("ActiveEffect", ...)`).
- Packs declarados no manifest (`vantagens`, `desvantagens`) mas **os diretórios `packs/` não existem no repositório**.
- Branch `main`, estado: working tree com muitos "diffs" por CRLF↔LF (cosmético, não conteúdo). Vou tratar isso com um `.gitattributes` na mesma PR ou pré-commit separado.

---

## 1. Resumo das breaking changes do V14 que impactam este sistema

Principais pontos levantados na pesquisa oficial/wiki:

1. **`template.json` em período de deprecação.** Tipos precisam ou ter schema vazio, ou ser definidos via `TypeDataModel`. O arquivo não quebra em V14, mas o caminho recomendado é DataModels.
2. **Compatibilidade antiga retirada.** Deprecações que existiam desde V12 foram removidas. Isso inclui **função global `mergeObject`** e **`duplicate`** sem namespace.
3. **`ActiveEffect#changes` → `ActiveEffect#system.changes`.** Schema de Active Effects migrou para system. `EffectChangeData#mode` (number) virou `type` (string). `ActiveEffect#origin` agora é `DocumentUUIDField`.
4. **Active Effects — novas capacidades.** Duração em unidades além de segundos, `expiry event`, `application phases`, `ActiveEffect.registry`. Não precisamos adotar, mas podemos.
5. **ApplicationV1 ainda funciona em V14**, só é removida na V16. Mas a recomendação é migrar **agora** — e o usuário escolheu modernização completa.
6. **`DataModel#updateSource`**: operadores especiais `-=` e `==` estão deprecados em favor dos novos `DataFieldOperator` values. Não usamos hoje, mas vale saber.
7. **Scene grid** consolidado em `scene.grid.*` — não afeta este sistema (system.json já usa `grid.Distance`/`grid.Units` como strings dotted, formato aceito).
8. **`DocumentSheetConfig.registerSheet`** é o método canônico; `Actors.registerSheet` / `Items.registerSheet` continuam como shorthand equivalente em V14. Vou usar a forma canônica.

---

## 2. Decisões arquiteturais

### 2.1. DataModels — adotar, com `TypeDataModel`

Cada tipo de Actor/Item vira uma classe em `module/data/`:

```
module/data/
  _common.mjs                   // helpers compartilhados (SchemaField padrão)
  actor-personagem.mjs          // TresDeTAlphaPersonagemData
  actor-npc.mjs                 // TresDeTAlphaNpcData
  item-base.mjs                 // base com description
  item-vantagem.mjs
  item-desvantagem.mjs
  item-vantagem-unica.mjs
  item-pericia.mjs
  item-magia.mjs
  item-objeto-magico.mjs
```

Cada um estende `foundry.abstract.TypeDataModel` e implementa `defineSchema()` com `foundry.data.fields.*`.

A lógica hoje dentro de `TresDeTAlphaActor.prepareDerivedData` (cálculos de `total`, `forcaDeAtaque`, `forcaDefesa`, `vida.max`, `magia.max`) muda pra `prepareDerivedData` **do DataModel** — é o novo lar canônico. O documento `TresDeTAlphaActor` fica bem magro (basicamente só overrides de lifecycle que precisarmos).

Registro no init:

```js
CONFIG.Actor.dataModels = {
  personagem: TresDeTAlphaPersonagemData,
  npc: TresDeTAlphaNpcData
};
CONFIG.Item.dataModels = {
  vantagem: TresDeTAlphaVantagemData,
  desvantagem: TresDeTAlphaDesvantagemData,
  vantagemUnica: TresDeTAlphaVantagemUnicaData,
  pericia: TresDeTAlphaPericiaData,
  magia: TresDeTAlphaMagiaData,
  objetoMagico: TresDeTAlphaObjetoMagicoData
};
```

### 2.2. `template.json` — esvaziar, não apagar ainda

Estratégia conservadora: manter `template.json` mas com schemas vazios por tipo (só a shell com `Actor.types` / `Item.types`). Assim o servidor continua validando os types, mas toda a substância vem do DataModel. Apagar completo fica como follow-up depois que estabilizar.

Alternativa mais ousada: deletar `template.json` e declarar tudo só nos DataModels — funciona em V14, mas prefiro o caminho conservador nessa primeira release.

### 2.3. Sheets V2 + `HandlebarsApplicationMixin`

Nova forma:

```js
const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class TresDeTAlphaActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["tresdetalpha", "sheet", "actor"],
    position: { width: 600, height: 735 },
    window: { resizable: true },
    actions: {
      rollAttribute: TresDeTAlphaActorSheet.#onRollAttribute,
      itemCreate: TresDeTAlphaActorSheet.#onItemCreate,
      itemEdit:   TresDeTAlphaActorSheet.#onItemEdit,
      itemDelete: TresDeTAlphaActorSheet.#onItemDelete,
      effectControl: TresDeTAlphaActorSheet.#onEffectControl,
      // ...
    },
    form: { submitOnChange: true }
  };

  static PARTS = {
    header: { template: "systems/tresdetalpha/templates/actor/parts/header.hbs" },
    tabs:   { template: "systems/tresdetalpha/templates/actor/parts/tabs.hbs" },
    atributos: { template: "systems/tresdetalpha/templates/actor/parts/atributos.hbs" },
    pericias:  { template: "systems/tresdetalpha/templates/actor/parts/pericias.hbs" },
    magias:    { template: "systems/tresdetalpha/templates/actor/parts/magias.hbs" },
    vantagens: { template: "systems/tresdetalpha/templates/actor/parts/vantagens.hbs" },
    desvantagens: { template: "systems/tresdetalpha/templates/actor/parts/desvantagens.hbs" },
    effects: { template: "systems/tresdetalpha/templates/actor/parts/actor-effects.html" },
    biography: { template: "systems/tresdetalpha/templates/actor/parts/biography.hbs" }
  };

  async _prepareContext(options) { /* substitui getData */ }
  _onRender(context, options) { /* substitui activateListeners, DOM nativo */ }
}
```

Consequências concretas:

- `getData()` → `_prepareContext()`
- `activateListeners(html)` → `_onRender(context, options)` + action bindings em `DEFAULT_OPTIONS.actions`
- `html.find('.item-edit').click(...)` → `<a data-action="itemEdit" data-item-id="{{id}}">` no template + handler no mapa `actions`
- `_updateObject` → (em V2 com `form.submitOnChange`, o framework chama `_processSubmitData`/`_prepareSubmitData` se precisar customizar)
- `_onDrop*` → existem equivalents V2 (`_onDrop`, `_onDragStart`) com mesma assinatura em `ActorSheetV2`, mas a forma de attach é diferente (a mixin cuida)
- `defaultOptions` mergeObject → vira `static DEFAULT_OPTIONS` plain object + mecanismo de merge da V2

### 2.4. Templates Handlebars

A maior mudança é que a V2 renderiza por **partes** (PARTS). Portanto:

- Os arquivos `templates/actor/actor-personagem-sheet.html` e `actor-npc-sheet.html` viram templates "agregadores" ou são **decompostos** em partials por tab/seção.
- Os partials já existentes em `templates/actor/parts/` já estão quase no formato certo; só precisam ser preenchidos pro novo pipeline.
- A extensão passa a ser `.hbs` (opcional, mas convenção V2; vou manter `.html` onde já estiver pra reduzir ruído e criar `.hbs` só para novos).
- Bindings: trocar `onclick` implícito por `data-action="..."` e ler datasets via `event.target.dataset` no handler.
- `{{system.X}}` já está correto no código atual, sem mudanças de sintaxe.

### 2.5. ActiveEffects

Migrar `module/helpers/effects.mjs`:

- Quando ler/gravar changes, usar `effect.system.changes` e não `effect.changes`.
- Modo de change: se tivermos algum effect hardcoded, trocar número por string (`"override"`, `"add"`, `"multiply"`, etc.).
- Leitura de effects nas sheets segue: `this.document.effects` funciona.
- O `prepareActiveEffectCategories` atual praticamente só olha `e.disabled` e `e.isTemporary` — continua OK.

Como o sistema não define effects padrão nem usa features avançadas, impacto é pequeno. Principal risco: mundos existentes com Active Effects criados em V13 precisam da migração automática do core (Foundry faz) — nossa responsabilidade é **não quebrar leitura** em data preparation.

### 2.6. Entry point (`module/tresdetalpha.mjs`)

```js
const { DocumentSheetConfig } = foundry.applications.apps;

Hooks.once("init", async () => {
  game.tresdetalpha = { TresDeTAlphaActor, TresDeTAlphaItem, rollItemMacro };

  CONFIG.TRESDETALPHA = TRESDETALPHA;
  CONFIG.Actor.documentClass = TresDeTAlphaActor;
  CONFIG.Item.documentClass  = TresDeTAlphaItem;
  CONFIG.Actor.dataModels    = { personagem: ..., npc: ... };
  CONFIG.Item.dataModels     = { vantagem: ..., ... };

  DocumentSheetConfig.unregisterSheet(Actor, "core", foundry.applications.sheets.ActorSheetV2);
  DocumentSheetConfig.registerSheet(Actor, "tresdetalpha", TresDeTAlphaActorSheet, {
    types: ["personagem", "npc"],
    makeDefault: true,
    label: "TRESDETALPHA.SheetLabels.Actor"
  });

  DocumentSheetConfig.unregisterSheet(Item, "core", foundry.applications.sheets.ItemSheetV2);
  DocumentSheetConfig.registerSheet(Item, "tresdetalpha", TresDeTAlphaItemSheet, {
    types: ["vantagem", "desvantagem", "vantagemUnica", "pericia", "magia", "objetoMagico"],
    makeDefault: true,
    label: "TRESDETALPHA.SheetLabels.Item"
  });

  await foundry.applications.handlebars.loadTemplates([ ... ]);   // caminho V14
  registerHandlebarsHelpers();
});
```

Notas:
- `loadTemplates` global ainda existe em V14, mas o namespace `foundry.applications.handlebars.loadTemplates` é a forma V14.
- `Handlebars.registerHelper` continua idêntico.
- `Hotbar drop` hook idem.

### 2.7. `system.json`

Diff proposto:

```diff
   "version": "0.2.0",
   "compatibility": {
-    "minimum": "11",
-    "verified": "13.351",
-    "maximum": "13"
+    "minimum": "14",
+    "verified": "14.xxx",
+    "maximum": "14"
   },
   "esmodules": ["module/tresdetalpha.mjs"],
   "styles": ["styles/tresdetalpha.css"],
```

Packs: como `packs/vantagens` e `packs/desvantagens` **não existem no repo**, duas opções:
- **(A) Remover** as entradas do manifest até que os compêndios sejam efetivamente criados. Recomendado — hoje o manifest referencia algo inexistente e alguns instaladores reclamam.
- **(B) Criar** `packs/vantagens` e `packs/desvantagens` como LevelDB vazios (usando `fvtt package pack` ou um script). Só faz sentido se você tiver um YAML/JSON de origem pra popular.

Vou recomendar **(A)** e deixar a criação dos compêndios como follow-up.

### 2.8. Limpezas pontuais

- Remover `Actors.unregisterSheet("core", ActorSheet)` e similares — substituídos pelo bloco V2 acima.
- `mergeObject(...)` → remover (V2 usa `static DEFAULT_OPTIONS`).
- `duplicate(header.dataset)` → `foundry.utils.deepClone(header.dataset)` (ou `structuredClone`).
- Linhas 64-65 de `actor.mjs` comentadas com bug (`=` em vez de `===` dentro de `.find`) — apagar.
- `template: "templates/actor/actor-${type}-sheet.html"` no `defaultOptions` desaparece; PARTS resolve isso.
- `preloadHandlebarsTemplates()` → é possível manter como está; com V2 só muda o namespace do `loadTemplates`.
- `Handlebars.registerHelper("select", ...)` não precisa — `select` é built-in da V14.

---

## 3. Plano faseado (pull requests sugeridas)

Quebrei em 4 etapas pra facilitar review e permitir rollback parcial. Vão numa branch `foundry-v14`.

### PR 1 — Manifesto + DataModels (fundação)

Arquivos:
- `system.json` — bumpar version, compat V14-only, tirar packs fantasmas, ajustar manifest/download URLs se quiser.
- `template.json` — reduzir cada type a `{}` (ficar como "declarativo de types" apenas).
- **Novos:** `module/data/*.mjs` (8 DataModels). Cada um com `defineSchema` e, onde apropriado, `prepareDerivedData`.
- `module/documents/actor.mjs` — remover `_prepareCharacterData`/`_prepareNpcData`/`prepareDerivedData`, ou deixar apenas super. Lógica migra pros DataModels.
- `module/documents/item.mjs` — manter `getRollData` e `roll`; tirar deepClones desnecessários pois DataModel já serializa.
- `module/tresdetalpha.mjs` — registrar `CONFIG.Actor.dataModels` e `CONFIG.Item.dataModels` no init.
- `.gitattributes` — `* text=auto eol=lf` pra parar o ruído CRLF.

**Critério de sucesso PR1:** com as sheets V1 atuais, rodar em V14 e os dados derivados continuarem calculando certo. Sheets V1 continuam funcionando em V14 (deprecadas, só removem em V16).

### PR 2 — Sheets V2

Arquivos:
- `module/sheets/actor-sheet.mjs` — reescrita completa `HandlebarsApplicationMixin(ActorSheetV2)`.
- `module/sheets/item-sheet.mjs` — idem com `ItemSheetV2`.
- `module/helpers/effects.mjs` — atualizar `changes` → `system.changes` onde aplicável, atualizar action-based bindings.
- `module/helpers/templates.mjs` — trocar `loadTemplates` por `foundry.applications.handlebars.loadTemplates`, listar novos partials.
- `module/tresdetalpha.mjs` — trocar registro de sheet pra `DocumentSheetConfig.registerSheet(...)` com `types`.
- **Templates** (`templates/actor/*`, `templates/item/*`) — ajustar para PARTS, trocar bindings pra `data-action`.

**Critério de sucesso PR2:** abrir uma ficha de Personagem/NPC e ver todas as abas; botões criar/editar/apagar de item funcionando; rolls funcionando; effects sendo listados.

### PR 3 — Limpeza de legado + i18n pass

- Remover código morto (linhas comentadas em `actor.mjs`).
- Substituir qualquer `duplicate(...)` remanescente por `foundry.utils.deepClone(...)`.
- Revisar `lang/pt-BR.json` e adicionar novas chaves eventualmente necessárias (`TRESDETALPHA.SheetLabels.*`, labels das DataModels, etc.).
- Atualizar `README.md` avisando "V14+".
- Atualizar assinatura de autoria se aplicável.

### PR 4 — (opcional) Compêndios de Vantagens/Desvantagens

Só se quiser aproveitar a onda. Requer fonte de dados dos compêndios.

---

## 4. Riscos e pontos que precisam de decisão sua

1. **Abandonar usuários em V13?** Você já escolheu V14-only, beleza. Recomendo manter um tag `v0.1.x` no git como "último release V13" pra quem precisar ficar.
2. **Templates — migrar de `.html` pra `.hbs`?** Cosmético, não muda comportamento. Vou manter `.html` nos existentes e usar `.hbs` nos novos partials — ou converter tudo? (Minha preferência: converter tudo pra `.hbs` na PR2 pra consistência.)
3. **`template.json` esvaziado vs apagado?** Recomendo esvaziado na PR1 (conservador) e ver se vale apagar numa v0.2.1.
4. **ActiveEffects em mundos existentes.** Se alguém tem mundos em V13 com effects, a migração automática do core V14 cuida. Mas se você tem mundo de teste, convém copiar antes de atualizar.
5. **Packs fantasmas** — vou remover do manifest (recomendação A). Ok?
6. **Line endings (CRLF/LF).** Todos os arquivos estão marcados como modificados porque o working copy está em CRLF e o blob do git está em LF. Vou adicionar `.gitattributes` e fazer um commit de normalização **antes** da PR1 pra não poluir diffs.
7. **Tests.** Foundry não tem framework de teste oficial embutido nesse nível; testes serão manuais. Posso escrever um **checklist de smoke test** (ver seção 6) pra você seguir ao abrir em V14.

---

## 5. Roteiro de execução proposto

Assumindo sua aprovação das decisões acima, vou:

1. Criar branch `foundry-v14` a partir de `main`.
2. Commit "chore: normalize line endings" + `.gitattributes`.
3. Abrir PR1 (manifesto + DataModels), commits granulares:
   - `feat(manifest): target Foundry V14`
   - `feat(data): add TypeDataModel for personagem/npc`
   - `feat(data): add TypeDataModels for all item types`
   - `refactor(actor): move derived calcs into DataModel`
   - `chore: empty template.json schemas, keep types`
4. Validar em instância V14 local (você roda o teste).
5. Abrir PR2 (Sheets V2) em cima de PR1, commits por sheet + templates.
6. Validar.
7. PR3 (cleanup + README + CHANGELOG).
8. Bump `0.2.0` + tag + release.

---

## 6. Checklist de smoke test (V14)

Ao terminar PR2, abrir mundo novo em V14 e testar:

- [ ] Instalar sistema via manifest local (`system.json`)
- [ ] Criar mundo com sistema `tresdetalpha`
- [ ] Criar Actor tipo `personagem`: campos `pontos`, `vida`, `magia`, `experiencia`, `abilities` aparecem e editam
- [ ] `abilities.forca.total = value + bonus` calcula em tempo real
- [ ] `vida.max` e `magia.max` recalculam quando `resistencia` muda
- [ ] `forcaDeAtaque.forca = forca.value + habilidade.value` calcula
- [ ] `forcaDefesa.value = armadura.value + habilidade.value` calcula
- [ ] Criar Actor tipo `npc`: idem acima
- [ ] Criar cada um dos 6 tipos de Item a partir da ficha (botão +), editar, apagar
- [ ] Arrastar Item da sidebar pra ficha — aparece na aba correta
- [ ] Roll numa característica (click no label) → ChatMessage aparece
- [ ] Roll de Item com fórmula (se houver) → ChatMessage com resultado
- [ ] Criar Active Effect (temporary e passive) na ficha, toggle, edit, delete
- [ ] Arrastar Item pra Hotbar → cria macro, executar macro roda
- [ ] Fechar e reabrir ficha: estado da aba ativa persiste
- [ ] `submitOnChange` funciona: editar campo e tab out salva
- [ ] Console sem erros e sem warnings de deprecação do sistema (warnings do core são OK)

---

## 7. Follow-ups fora do escopo desta migração

- Criar compêndios `vantagens` e `desvantagens` com conteúdo.
- Testes automatizados via Quench ou similar.
- Escola de magia via `StringField({choices})` (validação).
- Adotar `applicationPhases` nos DataModels se algum efeito começar a depender de ordem.
- Localização em inglês (`lang/en.json`).

---

*Documento gerado como plano pré-execução. Nenhum arquivo fonte foi modificado ainda.*
