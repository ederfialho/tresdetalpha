# Criar o PR

O sandbox do Cowork não consegue escrever no `.git/` (lock file travado). Você
roda os comandos abaixo **localmente** no seu computador. Todas as mudanças de
arquivo já estão aqui, só falta commitar e pushar.

## 1. Limpar lock e preparar ambiente

No terminal, dentro da pasta do repo:

```bash
cd /caminho/para/3det-foundry-rework
# Feche qualquer editor que possa estar segurando git (VS Code com source control,
# SourceTree, GitKraken, etc.) antes de remover o lock.
rm -f .git/index.lock
```

## 2. Criar branch, adicionar arquivos, commitar

```bash
# Branch nova a partir da main
git checkout -b foundry-v14-rework

# Stage tudo — modificações + arquivos novos
git add .

# Verifica o que vai entrar (opcional)
git status

# Commit usando a mensagem já pronta no COMMIT_MSG.txt
git commit -F COMMIT_MSG.txt
```

## 3. Push pro seu fork

```bash
git push -u origin foundry-v14-rework
```

## 4. Abrir o PR

Opção A — Via browser (mais fácil):

Abre esta URL:
https://github.com/ederfialho/tresdetalpha/compare/main...Roundstage:3det-foundry-rework:foundry-v14-rework

O GitHub vai mostrar um botão "Create pull request". Título sugerido:

> Rework: migração pra Foundry V14, compêndios, wizard e sistema de combate

Descrição: cole o conteúdo do `COMMIT_MSG.txt` (ou uma versão condensada).

Opção B — Via gh CLI (se tiver instalado):

```bash
gh pr create \
  --repo ederfialho/tresdetalpha \
  --base main \
  --head Roundstage:foundry-v14-rework \
  --title "Rework: migração pra Foundry V14, compêndios, wizard e sistema de combate" \
  --body-file COMMIT_MSG.txt
```

## Avisos importantes sobre o PR

1. **Breaking change no upstream**: o system id mudou de `tresdetalpha` pra
   `3det-foundry-rework`. Mundos existentes do Éder precisariam renomear a
   pasta em `Data/systems/` e editar o `system.json` pra continuar funcionando.
   Vale mencionar isso na descrição do PR.

2. **V14-only**: quem não migrou pra V14 ainda perde acesso. Se o Éder preferir
   manter compat V11–V14, precisa ajustar a `compatibility` no `system.json`
   e reverter as chamadas que dependem exclusivamente da V14.

3. **Escopo grande**: vários sistemas novos (compêndios, wizard, chat rico,
   templates de área, bestiário). O Éder pode querer dividir em PRs menores.
   Se ele pedir, dá pra cherry-pick partes pra branches separadas.

4. **Assets extras**: o `PLANO_MIGRACAO_V14.md` e `CHANGELOG.md` são docs
   adicionais. Se preferir não poluir o repo, dá pra remover antes do commit
   final.
