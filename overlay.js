/**
 * Master CRM — Chatwoot Overlay (Digital Master)
 *
 * Adiciona um item "Master CRM" no menu lateral esquerdo do Chatwoot e
 * abre o Kanban (https://atende.salatielbatista.com.br/crm/) em iframe
 * fullscreen sobreposto à área de trabalho do Chatwoot.
 *
 * Carregado via GlobalConfig.DASHBOARD_SCRIPTS — feature nativa do Chatwoot.
 * Não modifica o código do Chatwoot. Sobrevive a upgrades.
 */
(function () {
  'use strict';

  const CRM_URL = 'https://atende.salatielbatista.com.br/crm/';
  const ITEM_ID = 'dm-master-crm-nav';
  const OVERLAY_ID = 'dm-master-crm-overlay';
  const BRAND = '#4c9e98';

  // Ícone SVG inline (alvo + funil — combina com a vibe Kanban)
  const ICON_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round" style="width:18px;height:18px;">
      <rect x="3" y="4" width="5" height="16" rx="1"/>
      <rect x="10" y="4" width="5" height="11" rx="1"/>
      <rect x="17" y="4" width="4" height="7" rx="1"/>
    </svg>`;

  // ---- estilos do item e do overlay ----
  function injectStyles() {
    if (document.getElementById('dm-overlay-styles')) return;
    const css = `
      #${ITEM_ID} {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        margin: 0.5rem 0;
        border-radius: 0.5rem;
        color: rgb(51 65 85);
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }
      #${ITEM_ID}:hover {
        background: rgb(248 250 252);
        color: ${BRAND};
      }
      #${ITEM_ID}.dm-active {
        background: ${BRAND}1a;
        color: ${BRAND};
      }
      .dark #${ITEM_ID} { color: rgb(241 245 249); }
      .dark #${ITEM_ID}:hover { background: rgb(51 65 85); color: ${BRAND}; }

      #${ITEM_ID} .dm-tooltip {
        position: absolute;
        left: 3rem;
        background: rgb(15 23 42);
        color: #fff;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s;
        z-index: 1000;
      }
      #${ITEM_ID}:hover .dm-tooltip { opacity: 1; }

      #${OVERLAY_ID} {
        position: fixed;
        top: 0; left: 4rem; right: 0; bottom: 0;
        background: #f4f6f8;
        z-index: 9999;
        display: none;
        flex-direction: column;
      }
      #${OVERLAY_ID}.dm-open { display: flex; }
      #${OVERLAY_ID} .dm-overlay-header {
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      #${OVERLAY_ID} .dm-overlay-title {
        font-size: 14px;
        font-weight: 600;
        color: ${BRAND};
      }
      #${OVERLAY_ID} .dm-overlay-close {
        margin-left: auto;
        background: transparent;
        border: 0;
        color: #64748b;
        font-size: 20px;
        cursor: pointer;
        padding: 4px 10px;
        border-radius: 4px;
      }
      #${OVERLAY_ID} .dm-overlay-close:hover { background: #f1f5f9; color: #0f172a; }
      #${OVERLAY_ID} iframe {
        flex: 1;
        width: 100%;
        border: 0;
      }
    `;
    const style = document.createElement('style');
    style.id = 'dm-overlay-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ---- abre/fecha o overlay com o iframe do CRM ----
  function openCRM() {
    let overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;
      overlay.innerHTML = `
        <div class="dm-overlay-header">
          <span class="dm-overlay-title">🎯 Master CRM</span>
          <button class="dm-overlay-close" title="Fechar (Esc)">✕</button>
        </div>
        <iframe src="${CRM_URL}" title="Master CRM"></iframe>
      `;
      document.body.appendChild(overlay);
      overlay.querySelector('.dm-overlay-close').addEventListener('click', closeCRM);
    }
    overlay.classList.add('dm-open');
    document.getElementById(ITEM_ID)?.classList.add('dm-active');
  }

  function closeCRM() {
    document.getElementById(OVERLAY_ID)?.classList.remove('dm-open');
    document.getElementById(ITEM_ID)?.classList.remove('dm-active');
  }

  // Esc fecha
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById(OVERLAY_ID)?.classList.contains('dm-open')) {
      closeCRM();
    }
  });

  // ---- inserção do item no menu lateral ----
  function buildMenuItem() {
    const a = document.createElement('a');
    a.id = ITEM_ID;
    a.href = 'javascript:void(0)';
    a.innerHTML = `${ICON_SVG}<span class="dm-tooltip">Master CRM</span>`;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openCRM();
    });
    return a;
  }

  function tryInsert() {
    if (document.getElementById(ITEM_ID)) return true;

    // O menu lateral do Chatwoot tem este padrão (v4.x):
    // <div class="flex flex-col justify-between w-16 h-full bg-white border-r ...">
    //   <div class="flex flex-col items-center">  ← onde queremos injetar
    //     <Logo />
    //     <PrimaryNavItem /> ...
    //   </div>
    //   <div class="flex flex-col items-center justify-end pb-6">...</div>
    // </div>
    const sidebars = document.querySelectorAll('div.w-16.h-full');
    for (const sb of sidebars) {
      // primeiro filho = container superior dos nav items
      const upper = sb.querySelector('.flex.flex-col.items-center');
      if (upper && upper.children.length > 0) {
        upper.appendChild(buildMenuItem());
        return true;
      }
    }
    return false;
  }

  // O Chatwoot é SPA — o menu pode renderizar depois do nosso script rodar,
  // ou pode desmontar/remontar em troca de rota. Observador cuida disso.
  function startObserver() {
    injectStyles();

    if (tryInsert()) return;

    const obs = new MutationObserver(() => {
      if (tryInsert()) {
        // não desconectamos — Chatwoot pode trocar de tela e remover nosso item
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
