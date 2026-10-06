const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
const API_KEY = process.env.OPENAI_API_KEY || '';
const API_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const mockBrief = (prompt, platform, style) => ({
  title: 'AI Creative Reel',
  hook: `Start with a high-contrast visual reveal based on: ${prompt.slice(0, 80)}...`,
  script: {
    style: style || 'cinematic',
    prompt,
    scenes: [
      'Open on the most visually striking moment in the prompt.',
      'Add a short movement sequence to build attention quickly.',
      'Close with a strong CTA tailored to the selected platform.'
    ],
    hook: `Use a compelling opening frame that directly reflects "${prompt.slice(0, 60)}"`,
    cta: `Follow for more ${platform || 'social'} content ideas.`
  },
  cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  duration: 8,
  hashtags: ['#creator', '#viralcontent', '#socialmedia'],
  views: 1200,
  platform: platform || 'instagram'
});

export async function generateVideoBrief({ prompt, platform, style }) {
  const finalPrompt = prompt?.trim();
  if (!finalPrompt) {
    throw new Error('Prompt is required');
  }

  if (AI_PROVIDER !== 'openai' || !API_KEY || API_KEY.length < 10) {
    console.log('Using mock generation (no valid OpenAI key configured)');
    return mockBrief(finalPrompt, platform, style);
  }

  try {
    console.log(`Generating video brief with OpenAI model: ${MODEL}`);
    
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.8,
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content: 'You are a social video creative strategist. Return ONLY valid JSON (no markdown, no code blocks). Build a short-form video brief with title, hook, script (object with style, scenes array, hook, cta), scenes array, cta, duration (number), hashtags (array), platform (string), cover (url string). Keep responses compact and actionable.'
          },
          {
            role: 'user',
            content: `Create a short-form video creative brief for: "${finalPrompt}". Target platform: ${platform || 'instagram'}. Style: ${style || 'cinematic'}. Return ONLY JSON with: {title, hook, script: {style, scenes, hook, cta}, scenes, cta, duration, hashtags, platform, cover}.`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`OpenAI API error (${response.status}):`, err);
      return mockBrief(finalPrompt, platform, style);
    }

    const json = await response.json();
    const payload = json.choices?.[0]?.message?.content;
    
    if (!payload) {
      console.error('No content in OpenAI response');
      return mockBrief(finalPrompt, platform, style);
    }

    const parsed = JSON.parse(payload);

    return {
      title: parsed.title || 'AI Video Brief',
      hook: parsed.hook || 'Start with the strongest visual detail.',
      script: parsed.script || {
        style: style || 'cinematic',
        prompt: finalPrompt,
        scenes: parsed.scenes || ['Scene 1', 'Scene 2', 'Scene 3'],
        hook: parsed.hook || 'Hook copy',
        cta: parsed.cta || 'Follow for more ideas.'
      },
      scenes: parsed.scenes || ['Scene 1', 'Scene 2', 'Scene 3'],
      cta: parsed.cta || 'Follow for more ideas.',
      duration: parsed.duration || 8,
      hashtags: parsed.hashtags || ['#viral', '#contentcreator'],
      platform: parsed.platform || platform || 'instagram',
      cover: parsed.cover || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
      views: parsed.views || Math.floor(Math.random() * 5000) + 800
    };
  } catch (error) {
    console.error('AI generation error:', error.message);
    return mockBrief(finalPrompt, platform, style);
  }
}
