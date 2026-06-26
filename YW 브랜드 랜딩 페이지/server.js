// Local development server — static files + /api/chat proxy
// Vercel: use api/chat.js (serverless function)

'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

/* ─── Knowledge base ─── */
function buildKnowledgeBase() {
  const dir = path.join(__dirname, 'uploads');
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const content = fs.readFileSync(path.join(dir, f), 'utf-8');
      return `## [${f}]\n\n${content}`;
    })
    .join('\n\n---\n\n');
}

const knowledgeBase = buildKnowledgeBase();

const SYSTEM_PROMPT = `당신은 yw 브랜드의 공식 안내 챗봇입니다. 이름은 'yw 어시스턴트'입니다.

아래는 yw 브랜드에 관한 공식 문서 전체입니다. 반드시 이 문서 내용만을 근거로 답변하세요.

===
${knowledgeBase}
===

[답변 규칙 — 반드시 준수]
1. 자기소개·대화형 ("이름이 뭐야", "넌 누구야", "안녕" 등):
   챗봇 이름(yw 어시스턴트)과 역할(yw 브랜드 안내)을 자연스럽게 소개하세요.
2. yw 브랜드·제품·정책 관련 질문:
   위 문서 내용만 사용해 답변하세요. 문서에 없는 내용은 창작하지 마세요.
   문서에 없는 정보는 "현재 안내 가능한 정보가 없습니다. 더 자세한 문의는 hello@yw.kr 로 연락해 주세요." 라고 답하세요.
3. 서비스와 무관한 질문 (날씨, 정치, 음식 등):
   "yw 브랜드 관련 질문만 답변드릴 수 있어요." 라고 안내하세요.
4. 어떤 경우에도 문서에 없는 사실을 만들어내지 마세요.

[톤]
- 짧고 절제되게. yw 브랜드의 조용하고 감각적인 어조를 유지하세요.
- 과도한 형용사·감탄사·이모지를 쓰지 마세요.
- 한국어로 답변하세요.`;

/* ─── MIME types ─── */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.md':   'text/markdown; charset=utf-8',
};

/* ─── /api/chat handler ─── */
async function handleChat(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }));
    return;
  }

  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const { messages } = JSON.parse(body);
      if (!Array.isArray(messages)) throw new Error('messages must be an array');

      const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5.4-mini',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          max_completion_tokens: 512,
          temperature: 0.4,
        }),
      });

      if (!upstream.ok) {
        const errData = await upstream.json().catch(() => ({}));
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: errData.error?.message || 'OpenAI 오류가 발생했습니다.' }));
        return;
      }

      const data  = await upstream.json();
      const reply = data.choices?.[0]?.message?.content ?? '';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ reply }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}

/* ─── Static file handler ─── */
function serveStatic(urlPath, res) {
  // Prevent path traversal
  const safe = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const file = path.join(__dirname, safe === '/' ? 'index.html' : safe);

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

/* ─── Server ─── */
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    handleChat(req, res);
    return;
  }

  serveStatic(url.pathname, res);
});

server.listen(PORT, () => {
  console.log(`\n  yw local server → http://localhost:${PORT}\n`);
});
