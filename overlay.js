/**
 * Master CRM — Chatwoot Overlay (Digital Master)  v2
 *
 * Adiciona um item "Master CRM" no menu lateral esquerdo do Chatwoot e
 * abre o Kanban (https://atende.salatielbatista.com.br/crm/) em iframe
 * fullscreen sobreposto à área de trabalho do Chatwoot.
 *
 * Carregado via GlobalConfig.DASHBOARD_SCRIPTS — feature nativa do Chatwoot.
 * Não modifica o código do Chatwoot. Sobrevive a upgrades.
 *
 * v2: logs verbosos no console + fallback de seletores + injeção tolerante a v4.x.
 */
(function () {
  'use strict';

  const VERSION = 'v2-2026-05-26';
  const CRM_URL = 'https://atende.salatielbatista.com.br/crm/';
  const ITEM_ID = 'dm-master-crm-nav';
  const OVERLAY_ID = 'dm-master-crm-overlay';
  const BRAND = '#4c9e98';

  const log = (...args) => console.log('[DM-Overlay ' + VERSION + ']', ...args);
  const warn = (...args) => console.warn('[DM-Overlay ' + VERSION + ']', ...args);

  log('script carregado. readyState =', document.readyState);

  const ICON_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round" style="width:20px;height:20px;">
      <rect x="3" y="4" width="5" height="16" rx="1"/>
      <rect x="10" y="4" width="5" height="11" rx="1"/>
      <rect x="17" y="4" width="4" height="7" rx="1"/>
    </svg>`;

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
        margin: 0.5rem auto;
        border-radius: 0.5rem;
        color: rgb(51 65 85);
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        text-decoration: none;
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
        top: 50%;
        transform: translateY(-50%);
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
    log('estilos injetados');
  }

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
    log('overlay aberto');
  }

  function closeCRM() {
    document.getElementById(OVERLAY_ID)?.classList.remove('dm-open');
    document.getElementById(ITEM_ID)?.classList.remove('dm-active');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById(OVERLAY_ID)?.classList.contains('dm-open')) {
      closeCRM();
    }
  });

  function buildMenuItem() {
    const a = document.createElement('a');
    a.id = ITEM_ID;
    a.href = 'javascript:void(0)';
    a.setAttribute('data-dm-overlay', VERSION);
    a.innerHTML = `${ICON_SVG}<span class="dm-tooltip">Master CRM</span>`;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openCRM();
    });
    return a;
  }

  // Tenta múltiplos seletores. Retorna o container onde injetar (ou null).
  // Devolve { container, strategy } para log.
  function findMenuContainer() {
    // Estratégia 1 — padrão documentado: div.w-16 + .h-full → primeiro filho .flex.flex-col.items-center
    const wide = document.querySelectorAll('div.w-16.h-full, div.h-full.w-16');
    for (const sb of wide) {
      const upper = sb.querySelector('.flex.flex-col.items-center');
      if (upper && upper.children.length > 0) {
        return { container: upper, strategy: 'div.w-16.h-full > .flex.flex-col.items-center' };
      }
    }

    // Estratégia 2 — qualquer div.w-16 (sem h-full) com filho .items-center
    const w16 = document.querySelectorAll('div.w-16');
    for (const sb of w16) {
      const upper = sb.querySelector('.flex.flex-col.items-center, .items-center');
      if (upper && upper.children.length > 0) {
        return { container: upper, strategy: 'div.w-16 > .items-center' };
      }
    }

    // Estratégia 3 — pelo <aside> que envolve sidebar
    const aside = document.querySelector('aside.app-sidebar, aside.sidebar, aside');
    if (aside) {
      const upper = aside.querySelector('.flex.flex-col.items-center, .menu-items, ul');
      if (upper && upper.children.length > 0) {
        return { container: upper, strategy: 'aside > items container' };
      }
    }

    // Estratégia 4 — procura PrimaryNavItem por aria/role (links de navegação fixos)
    const navLinks = document.querySelectorAll('a[href*="/dashboard"], a[href*="/conversations"]');
    if (navLinks.length > 0) {
      const parent = navLinks[0].parentElement;
      if (parent && parent.children.length > 0) {
        return { container: parent, strategy: 'parent of nav link' };
      }
    }

    return null;
  }

  let lastLoggedFail = 0;

  function tryInsert() {
    if (document.getElementById(ITEM_ID)) return true;

    const found = findMenuContainer();
    if (!found) {
      const now = Date.now();
      if (now - lastLoggedFail > 5000) {
        warn('tryInsert: nenhum container do menu encontrado ainda. URL =', location.href);
        // dump dos w-16 visíveis pra ajudar a calibrar
        const w16 = document.querySelectorAll('div.w-16');
        warn('  candidatos div.w-16 =', w16.length);
        lastLoggedFail = now;
      }
      return false;
    }

    found.container.appendChild(buildMenuItem());
    log('item injetado via estratégia:', found.strategy);
    return true;
  }

  function startObserver() {
    injectStyles();

    if (tryInsert()) {
      log('inserção feita no primeiro tick (sem observer)');
    } else {
      log('iniciando MutationObserver — menu ainda não montou');
    }

    const obs = new MutationObserver(() => {
      tryInsert();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    log('observer ativo');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
