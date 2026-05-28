/**
 * Master CRM — Chatwoot Overlay (Digital Master)  v3
 *
 * Estratégia dupla pra garantir porta de entrada pro Kanban:
 *  A) tenta injetar item "Master CRM" no menu lateral (clona estilo do irmão Campanhas)
 *  B) FAB circular flutuante (bottom-right) como fallback SEMPRE presente
 *
 * Carregado via GlobalConfig.DASHBOARD_SCRIPTS — feature nativa do Chatwoot.
 * Não modifica o código do Chatwoot. Sobrevive a upgrades.
 *
 * v3: usa âncoras de href estáveis (a[href*="/campaigns"]) em vez de classes Tailwind
 *     (que mudam entre versões). Adiciona FAB como fallback à prova de bala.
 */
(function () {
  'use strict';

  const VERSION = 'v3-2026-05-27';
  const CRM_URL = 'https://atende.salatielbatista.com.br/crm/';
  const ITEM_ID = 'dm-master-crm-nav';
  const FAB_ID = 'dm-master-crm-fab';
  const OVERLAY_ID = 'dm-master-crm-overlay';
  const BRAND = '#4c9e98';

  const log = (...args) => console.log('[DM-Overlay ' + VERSION + ']', ...args);

  log('script carregado. readyState =', document.readyState);

  const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;flex-shrink:0;"><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="11" rx="1"/><rect x="17" y="4" width="4" height="7" rx="1"/></svg>`;

  const FAB_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:26px;height:26px;"><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="11" rx="1"/><rect x="17" y="4" width="4" height="7" rx="1"/></svg>`;

  function injectStyles() {
    if (document.getElementById('dm-overlay-styles')) return;
    const css = `
      #${ITEM_ID} { cursor: pointer; text-decoration: none; }
      #${ITEM_ID} .dm-menu-icon {
        display: inline-flex; align-items: center; justify-content: center;
        color: inherit;
      }

      #${FAB_ID} {
        position: fixed;
        bottom: 24px; right: 24px;
        width: 56px; height: 56px;
        border-radius: 50%;
        background: ${BRAND}; color: #fff;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.12);
        z-index: 9998;
        transition: transform 0.15s, box-shadow 0.15s;
        border: 0;
        padding: 0;
      }
      #${FAB_ID}:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.22), 0 3px 6px rgba(0,0,0,0.14);
      }
      #${FAB_ID}::after {
        content: 'Master CRM';
        position: absolute;
        right: 68px;
        top: 50%;
        transform: translateY(-50%);
        background: rgb(15 23 42);
        color: #fff;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s;
      }
      #${FAB_ID}:hover::after { opacity: 1; }

      #${OVERLAY_ID} {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
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
        display: flex; align-items: center; gap: 12px;
        flex-shrink: 0;
      }
      #${OVERLAY_ID} .dm-overlay-title {
        font-size: 14px; font-weight: 600; color: ${BRAND};
      }
      #${OVERLAY_ID} .dm-overlay-close {
        margin-left: auto;
        background: transparent; border: 0;
        color: #64748b; font-size: 20px;
        cursor: pointer;
        padding: 4px 10px; border-radius: 4px;
      }
      #${OVERLAY_ID} .dm-overlay-close:hover { background: #f1f5f9; color: #0f172a; }
      #${OVERLAY_ID} iframe { flex: 1; width: 100%; border: 0; }
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
          <span class="dm-overlay-title">Master CRM</span>
          <button class="dm-overlay-close" title="Fechar (Esc)">&#10005;</button>
        </div>
        <iframe src="${CRM_URL}" title="Master CRM"></iframe>
      `;
      document.body.appendChild(overlay);
      overlay.querySelector('.dm-overlay-close').addEventListener('click', closeCRM);
    }
    overlay.classList.add('dm-open');
    log('overlay aberto');
  }

  function closeCRM() {
    document.getElementById(OVERLAY_ID)?.classList.remove('dm-open');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById(OVERLAY_ID)?.classList.contains('dm-open')) {
      closeCRM();
    }
  });

  /* ============ ESTRATÉGIA A: item no menu lateral ============ */
  // Procura âncoras de href que existem em qualquer versão do Chatwoot.
  // Diferente de classes Tailwind, URLs internas são estáveis.
  function findMenuSibling() {
    const candidates = [
      'a[href*="/campaigns"]',
      'a[href*="/reports"]',
      'a[href*="/contacts"]',
      'a[href*="/captain"]',
      'a[href*="/notifications"]',
    ];
    for (const sel of candidates) {
      // pega TODOS os matches e prefere o que tem mais "vizinhos" no parent
      // (filtra anchors que estão fora do menu, tipo em modals)
      const links = document.querySelectorAll(sel);
      let best = null;
      let bestSiblingCount = 0;
      for (const link of links) {
        const parent = link.parentElement;
        if (!parent) continue;
        const siblings = parent.querySelectorAll('a[href*="/dashboard"], a[href*="/app/accounts"]').length;
        if (siblings > bestSiblingCount) {
          bestSiblingCount = siblings;
          best = link;
        }
      }
      if (best && bestSiblingCount >= 2) {
        return { link: best, sel, siblings: bestSiblingCount };
      }
    }
    return null;
  }

  function buildMenuItem(siblingLink) {
    // Clona o irmão pra herdar TODAS as classes e estrutura visual do Chatwoot
    const clone = siblingLink.cloneNode(true);
    clone.id = ITEM_ID;
    clone.href = 'javascript:void(0)';
    clone.removeAttribute('aria-current');
    clone.classList.remove('active', 'router-link-active', 'router-link-exact-active');

    // troca o ícone (primeiro SVG encontrado)
    const svg = clone.querySelector('svg');
    if (svg) {
      const wrap = document.createElement('span');
      wrap.className = 'dm-menu-icon';
      wrap.innerHTML = ICON_SVG;
      svg.parentElement.replaceChild(wrap.firstChild, svg);
    } else {
      // se não tinha SVG, injeta no início
      const wrap = document.createElement('span');
      wrap.className = 'dm-menu-icon';
      wrap.innerHTML = ICON_SVG;
      clone.insertBefore(wrap.firstChild, clone.firstChild);
    }

    // troca o texto: pega o primeiro descendente sem filhos elemento e troca seu conteúdo
    let replaced = false;
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
      if (replaced) break;
      if (node.children.length === 0 && node.textContent.trim().length > 0 && node.tagName !== 'SVG') {
        node.textContent = 'Master CRM';
        replaced = true;
      }
    }
    if (!replaced) {
      // fallback: text node direto
      Array.from(clone.childNodes).forEach(n => {
        if (n.nodeType === Node.TEXT_NODE && n.textContent.trim() && !replaced) {
          n.textContent = 'Master CRM';
          replaced = true;
        }
      });
    }
    if (!replaced) {
      // último recurso: cria um span com o texto
      const txt = document.createElement('span');
      txt.textContent = 'Master CRM';
      clone.appendChild(txt);
    }

    clone.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openCRM();
    }, true);

    return clone;
  }

  function tryInsertMenu() {
    if (document.getElementById(ITEM_ID)) return true;

    const found = findMenuSibling();
    if (!found) return false;

    const item = buildMenuItem(found.link);
    found.link.parentElement.insertBefore(item, found.link.nextSibling);
    log('item injetado no menu (irmão de ' + found.sel + ', ' + found.siblings + ' vizinhos)');
    return true;
  }

  /* ============ ESTRATÉGIA B: FAB fallback ============ */
  function ensureFab() {
    if (document.getElementById(FAB_ID)) return;
    const fab = document.createElement('button');
    fab.id = FAB_ID;
    fab.type = 'button';
    fab.title = 'Master CRM (Kanban geral)';
    fab.innerHTML = FAB_ICON_SVG;
    fab.addEventListener('click', openCRM);
    document.body.appendChild(fab);
    log('FAB injetado (fallback sempre presente)');
  }

  /* ============ Bootstrap ============ */
  let observerLastLog = 0;
  function start() {
    injectStyles();
    ensureFab();              // FAB sempre presente — porta de entrada garantida
    const menuOk = tryInsertMenu();
    log('inicialização: menu=' + (menuOk ? 'OK' : 'pendente') + ', FAB=OK');

    const obs = new MutationObserver(() => {
      if (!document.getElementById(FAB_ID)) ensureFab();
      tryInsertMenu();
      // log throttled a cada 5s só pra não inundar
      const now = Date.now();
      if (now - observerLastLog > 5000) {
        observerLastLog = now;
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    log('observer ativo');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
