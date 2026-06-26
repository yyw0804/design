(function () {
  'use strict';

  // yw brand tokens
  const C = {
    dark:   '#1A1A1A',
    light:  '#F7F5F2',
    stone:  '#D6CFC6',
    ash:    '#8C8680',
    clay:   '#B5967A',
    fog:    '#E8E4DF',
    body:   '#3a3733',
  };

  /* ─── Styles ─── */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #yw-fab {
      position: fixed; bottom: 32px; right: 32px; z-index: 10000;
      width: 54px; height: 54px; border-radius: 50%;
      background: ${C.dark}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(26,26,26,0.20);
      transition: transform 0.22s cubic-bezier(.16,1,.3,1), box-shadow 0.22s;
    }
    #yw-fab:hover { transform: scale(1.08); box-shadow: 0 6px 30px rgba(26,26,26,0.28); }
    #yw-fab.yw-open { transform: scale(0.93); }
    #yw-fab svg { pointer-events: none; }

    #yw-win {
      position: fixed; bottom: 100px; right: 32px; z-index: 10000;
      width: 360px; max-width: calc(100vw - 40px);
      height: 520px; max-height: calc(100vh - 140px);
      background: ${C.light}; border: 1px solid rgba(26,26,26,0.08);
      border-radius: 16px; box-shadow: 0 8px 48px rgba(26,26,26,0.13);
      display: flex; flex-direction: column; overflow: hidden;
      font-family: 'Noto Sans KR','DM Sans',sans-serif;
      transform: translateY(18px) scale(0.97); opacity: 0;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(.16,1,.3,1),
                  opacity 0.3s cubic-bezier(.16,1,.3,1);
    }
    #yw-win.yw-open {
      transform: translateY(0) scale(1); opacity: 1; pointer-events: all;
    }

    #yw-hd {
      padding: 16px 18px 14px;
      border-bottom: 1px solid rgba(26,26,26,0.07);
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0; background: ${C.light};
    }
    #yw-hd-name {
      font-family: 'DM Sans',sans-serif; font-size: 12px; font-weight: 500;
      letter-spacing: 0.22em; text-transform: uppercase; color: ${C.dark};
    }
    #yw-hd-sub {
      font-size: 11px; color: ${C.ash}; margin-top: 2px;
      font-family: 'DM Sans',sans-serif; letter-spacing: 0.06em;
    }
    #yw-close {
      background: none; border: none; cursor: pointer;
      color: ${C.ash}; font-size: 16px; padding: 4px 6px; line-height: 1;
      transition: color 0.14s; border-radius: 4px;
    }
    #yw-close:hover { color: ${C.dark}; }

    #yw-msgs {
      flex: 1; overflow-y: auto; padding: 18px 14px 8px;
      display: flex; flex-direction: column; gap: 10px;
      scroll-behavior: smooth;
    }
    #yw-msgs::-webkit-scrollbar { width: 3px; }
    #yw-msgs::-webkit-scrollbar-track { background: transparent; }
    #yw-msgs::-webkit-scrollbar-thumb { background: ${C.stone}; border-radius: 2px; }

    .yw-m {
      max-width: 84%; font-size: 13.5px; line-height: 1.7;
      font-weight: 300; letter-spacing: 0.01em;
      padding: 9px 13px; border-radius: 12px;
      word-break: break-word; white-space: pre-wrap;
    }
    .yw-m.bot {
      background: ${C.fog}; color: ${C.dark};
      align-self: flex-start; border-bottom-left-radius: 3px;
    }
    .yw-m.user {
      background: ${C.dark}; color: ${C.light};
      align-self: flex-end; border-bottom-right-radius: 3px;
    }
    .yw-m.err {
      font-size: 12px; color: #b33; text-align: center;
      background: #fdf0f0; border-radius: 8px; align-self: center;
      max-width: 92%; padding: 7px 12px;
    }

    .yw-typing {
      display: flex; align-items: center; gap: 5px;
      padding: 11px 14px; background: ${C.fog};
      border-radius: 12px; border-bottom-left-radius: 3px;
      align-self: flex-start;
    }
    .yw-dot {
      width: 5px; height: 5px; border-radius: 50%; background: ${C.ash};
      animation: yw-bounce 1.2s ease-in-out infinite;
    }
    .yw-dot:nth-child(2) { animation-delay: 0.18s; }
    .yw-dot:nth-child(3) { animation-delay: 0.36s; }
    @keyframes yw-bounce {
      0%,80%,100% { transform: translateY(0); opacity: 0.45; }
      40%          { transform: translateY(-5px); opacity: 1; }
    }

    #yw-form {
      padding: 10px 14px 14px;
      border-top: 1px solid rgba(26,26,26,0.07);
      display: flex; gap: 8px; align-items: flex-end;
      background: ${C.light}; flex-shrink: 0;
    }
    #yw-input {
      flex: 1; border: 1px solid ${C.stone}; border-radius: 8px;
      padding: 8px 11px; font-size: 13.5px; font-weight: 300;
      font-family: 'Noto Sans KR','DM Sans',sans-serif;
      color: ${C.dark}; background: #fff; resize: none; outline: none;
      line-height: 1.55; max-height: 96px; overflow-y: auto;
      transition: border-color 0.15s;
    }
    #yw-input:focus { border-color: ${C.clay}; }
    #yw-input::placeholder { color: ${C.ash}; }
    #yw-send {
      width: 34px; height: 34px; border-radius: 8px;
      background: ${C.dark}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.14s, transform 0.1s;
    }
    #yw-send:hover { background: #333; }
    #yw-send:active { transform: scale(0.92); }
    #yw-send:disabled { background: ${C.stone}; cursor: default; }
    #yw-send svg { pointer-events: none; }
  `;
  document.head.appendChild(styleEl);

  /* ─── DOM ─── */
  const fab = document.createElement('button');
  fab.id = 'yw-fab';
  fab.setAttribute('aria-label', '채팅 열기');
  fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="${C.light}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>`;

  const win = document.createElement('div');
  win.id = 'yw-win';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'yw 브랜드 채팅');
  win.innerHTML = `
    <div id="yw-hd">
      <div>
        <div id="yw-hd-name">yw</div>
        <div id="yw-hd-sub">브랜드 안내</div>
      </div>
      <button id="yw-close" aria-label="닫기">✕</button>
    </div>
    <div id="yw-msgs" role="log" aria-live="polite"></div>
    <div id="yw-form">
      <textarea id="yw-input" placeholder="궁금한 점을 물어보세요." rows="1"
        aria-label="메시지 입력"></textarea>
      <button id="yw-send" aria-label="전송">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
          viewBox="0 0 24 24" fill="${C.light}">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(win);

  const msgsEl  = win.querySelector('#yw-msgs');
  const inputEl = win.querySelector('#yw-input');
  const sendBtn = win.querySelector('#yw-send');
  const closeBtn = win.querySelector('#yw-close');

  /* ─── State ─── */
  let isOpen    = false;
  let isLoading = false;
  const history = []; // {role, content} — capped at 10

  /* ─── Open / Close ─── */
  function openChat() {
    isOpen = true;
    win.classList.add('yw-open');
    fab.classList.add('yw-open');
    fab.setAttribute('aria-label', '채팅 닫기');
    inputEl.focus();
  }
  function closeChat() {
    isOpen = false;
    win.classList.remove('yw-open');
    fab.classList.remove('yw-open');
    fab.setAttribute('aria-label', '채팅 열기');
  }
  fab.addEventListener('click', () => (isOpen ? closeChat() : openChat()));
  closeBtn.addEventListener('click', closeChat);

  /* ─── Message helpers ─── */
  function addMsg(role, text) {
    const el = document.createElement('div');
    el.className = `yw-m ${role}`;
    el.textContent = text;
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return el;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'yw-typing';
    el.innerHTML = '<div class="yw-dot"></div><div class="yw-dot"></div><div class="yw-dot"></div>';
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return el;
  }

  /* ─── Send ─── */
  async function send() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    addMsg('user', text);
    history.push({ role: 'user', content: text });
    if (history.length > 10) history.splice(0, history.length - 10);

    inputEl.value = '';
    inputEl.style.height = 'auto';
    isLoading = true;
    sendBtn.disabled = true;

    const typingEl = showTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice() }),
      });

      typingEl.remove();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addMsg('err', err.error || '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      } else {
        const data = await res.json();
        const reply = data.reply || '';
        addMsg('bot', reply);
        history.push({ role: 'assistant', content: reply });
        if (history.length > 10) history.splice(0, history.length - 10);
      }
    } catch {
      typingEl.remove();
      addMsg('err', '연결에 실패했습니다. 인터넷 연결을 확인해 주세요.');
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  sendBtn.addEventListener('click', send);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 96) + 'px';
  });

  /* ─── Welcome message ─── */
  setTimeout(() => {
    addMsg('bot', 'yw에 오신 것을 환영합니다.\n브랜드, 제품, 컬렉션에 대해 궁금한 점을 자유롭게 물어보세요.');
  }, 1000);
})();
