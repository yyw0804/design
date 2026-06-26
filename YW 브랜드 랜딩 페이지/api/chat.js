// Vercel serverless function — POST /api/chat
// Same knowledge-base logic as server.js; runs in Vercel Edge runtime context.

'use strict';

const fs   = require('fs');
const path = require('path');

function buildKnowledgeBase() {
  const dir = path.join(process.cwd(), 'uploads');
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const content = fs.readFileSync(path.join(dir, f), 'utf-8');
      return `## [${f}]\n\n${content}`;
    })
    .join('\n\n---\n\n');
}

// Built once per cold-start
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

module.exports = async function handler(req, res) {
  // CORS (Vercel handles most cases; explicit for preflight safety)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });

  const { messages } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages must be an array' });
  }

  try {
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
      return res.status(502).json({ error: errData.error?.message || 'OpenAI 오류가 발생했습니다.' });
    }

    const data  = await upstream.json();
    const reply = data.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
