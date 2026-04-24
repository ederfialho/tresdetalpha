# Changelog

## 0.2.0 — Foundry V14 / modernização completa

Breaking: esta versão só roda em Foundry VTT **V14**. Mundos em V11–V13 precisam
ficar em 0.1.7.1 ou migrar o core antes de atualizar o sistema.

### Principais mudanças

- **Foundry V14 obrigatório** (`compatibility.minimum = 14`, `maximum = 14`).
- **DataModels (TypeDataModel)** para todos os tipos de Actor e Item em
  `module/data/_models.mjs`. O `template.json` virou apenas uma declaração
  de `types`; todo schema vive no DataModel.
- **Cálculos derivados** (`abilities.total`, `forcaDeAtaque`, `forcaDefesa`,
  `vida.max`, `magia.max`) migrados do Actor pra `prepareDerivedData` do
  DataModel.
- **Sheets V2**: `TresDeTAlphaActorSheet` e `TresDeTAlphaItemSheet` agora
  estendem `ActorSheetV2` / `ItemSheetV2` com `HandlebarsApplicationMixin`.
- **`DocumentSheetConfig.registerSheet`** substitui `Actors.registerSheet` /
  `Items.registerSheet`. Registro é feito com `types` específicos.
- **Active Effects**: atualizado pra API V14 (`effect.name` em vez de
  `effect.label`, `effect.img` em vez de `effect.icon`).
- **Limpeza de globais deprecadas**: `mergeObject` e `duplicate` sem
  namespace foram removidos; tudo passa por `foundry.utils.*`.
- **`template: .html` → `<section>`** nos templates de sheet pra evitar
  `<form>` aninhado dentro do form gerado pela ApplicationV2.
- **Manifest**: `documentTypes` declarado no `system.json`, packs fantasmas
  (`vantagens`, `desvantagens`) removidos até existirem compêndios reais.
- **`.gitattributes`** normaliza line-endings (LF) pra reduzir ruído nos
  diffs em ambientes Windows.

### O que se manteve

- `game.tresdetalpha`, `CONFIG.TRESDETALPHA`, as chaves de i18n `TRESDETALPHA.*`,
  a classe CSS `tresdetalpha` e o nome do arquivo `module/tresdetalpha.mjs`
  — são convenções internas e não precisam casar com o `id` do manifest.
- Todo o layout visual das fichas (os templates existentes são reaproveitados).

## 0.1.7.1

Última versão compatível com Foundry V11–V13. Ver histórico do git para detalhes.
