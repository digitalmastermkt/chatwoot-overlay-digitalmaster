#!/bin/bash
# Aplica o overlay no Chatwoot configurando a GlobalConfig.DASHBOARD_SCRIPTS
# para apontar pro overlay.js servido pelo Caddy.
#
# Uso: bash apply.sh
# Requer: container chatwoot-rails-1 rodando

set -e

OVERLAY_URL="${OVERLAY_URL:-/dm-overlay/overlay.js}"
SCRIPT_TAG='<script src="'"$OVERLAY_URL"'?v=3" defer></script>'

echo "Configurando DASHBOARD_SCRIPTS no Chatwoot..."
echo "  conteúdo: $SCRIPT_TAG"

docker exec chatwoot-rails-1 bundle exec rails runner "
  cfg = InstallationConfig.find_or_initialize_by(name: 'DASHBOARD_SCRIPTS')
  cfg.value = '$SCRIPT_TAG'
  cfg.save!
  GlobalConfig.clear_cache
  puts 'DASHBOARD_SCRIPTS = ' + cfg.value.to_s
"

echo ""
echo "Pronto. Recarregue o Chatwoot no navegador (Ctrl+Shift+R) pra ver o item Master CRM no menu lateral."
