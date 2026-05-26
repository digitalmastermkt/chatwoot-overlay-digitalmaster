# Chatwoot Overlay — Digital Master

Customizações visuais do Chatwoot do Digital Master sem modificar o código-fonte do Chatwoot.

Hoje contém: **item "Master CRM" no menu lateral esquerdo** que abre o Kanban em fullscreen sobre a área de trabalho do Chatwoot.

## Como funciona

O Chatwoot tem uma feature nativa chamada `DASHBOARD_SCRIPTS` (variável `GlobalConfig`) que injeta scripts JavaScript arbitrários no HTML do dashboard. Esse repo hospeda esse script — o Chatwoot só precisa saber a URL pra carregá-lo.

```
┌──────────────────────────────────────────────┐
│  Chatwoot (imagem oficial chatwoot/chatwoot) │
│  + GlobalConfig.DASHBOARD_SCRIPTS contém:    │
│    <script src="/overlay/overlay.js"></script>│
│                  ↓                           │
│  Script monta item no menu lateral via DOM   │
│  + iframe fullscreen apontando pro CRM       │
└──────────────────────────────────────────────┘
```

## Vantagens dessa abordagem

- ✅ **Zero modificação no Chatwoot** — usa feature oficial (`DASHBOARD_SCRIPTS`)
- ✅ **Sobrevive a upgrades** — atualizar `chatwoot:v4.1.0 → v4.2.0` não quebra o overlay
- ✅ **Reversível em 1 segundo** — basta limpar `DASHBOARD_SCRIPTS` no super-admin
- ✅ **Sem fork, sem build, sem cron complicado**

## Limitação honesta

Se o Chatwoot mudar drasticamente a estrutura HTML do menu lateral em algum upgrade futuro (raro — esse código deles tem ~2 anos sem mudar), os seletores CSS no `overlay.js` podem deixar de bater e o item somar até alguém atualizar o script. O Chatwoot **continua funcionando normal** — só o item do CRM some.

Mitigação: a função `tryInsert()` é tolerante a falha (não trava nada) e usa seletores estruturais (`w-16 h-full`), não nomes de classe únicos.

## Arquivos

- `overlay.js` — script principal injetado pelo Chatwoot
- `apply.sh` — script para aplicar no VPS (configura `DASHBOARD_SCRIPTS` via rails console)
- `caddy-snippet.conf` — trecho de config Caddy que serve esse arquivo

## Como aplicar no VPS

```bash
# 1. Clonar o repo
git clone https://github.com/digitalmastermkt/chatwoot-overlay-digitalmaster.git \
  /opt/chatwoot-overlay-digitalmaster

# 2. Servir o overlay.js via Caddy
# (já feito no Caddyfile do atende.salatielbatista.com.br - ver caddy-snippet.conf)

# 3. Configurar DASHBOARD_SCRIPTS no Chatwoot
bash /opt/chatwoot-overlay-digitalmaster/apply.sh
```

## Como atualizar quando o Chatwoot lançar versão nova

Não precisa fazer nada normalmente. O fluxo é:

1. Você atualiza a tag no compose do Chatwoot: `chatwoot:v4.1.0` → `chatwoot:v4.2.0`
2. `docker compose up -d`
3. Chatwoot sobe normal, `DASHBOARD_SCRIPTS` continua configurado
4. Overlay continua funcionando

Se em algum upgrade o item sumir do menu (porque mudou a estrutura HTML deles), avise o Salatiel/Claude — atualizar o `overlay.js` é 15 minutos de trabalho.

## Desativar o overlay

Limpe a config no super-admin:
- Acesse `https://atende.salatielbatista.com.br/super_admin/sign_in`
- Settings → `DASHBOARD_SCRIPTS` → apague o conteúdo → Save
