import dotenv from 'dotenv';
import express from 'express';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const port = Number(process.env.API_PORT || 3001);
const model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

app.use(express.json({ limit: '2mb' }));

const responseSchema = {
  type: 'OBJECT',
  properties: {
    contactInfo: { type: 'STRING', description: 'Candidate name and contact info (email, phone, links) separated by |' },
    summary: { type: 'STRING', description: 'A tailored 3-4 sentence professional summary for the job.' },
    skills: { type: 'ARRAY', items: { type: 'STRING' } },
    experience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          company: { type: 'STRING' },
          title: { type: 'STRING' },
          dates: { type: 'STRING' },
          bullets: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ['company', 'title', 'dates', 'bullets']
      }
    },
    education: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          institution: { type: 'STRING' },
          degree: { type: 'STRING' },
          dates: { type: 'STRING' }
        },
        required: ['institution', 'degree', 'dates']
      }
    },
    matchedKeywords: { type: 'ARRAY', items: { type: 'STRING' } },
    missingKeywords: { type: 'ARRAY', items: { type: 'STRING' } },
    atsScore: { type: 'INTEGER' },
    suggestedImprovements: { type: 'STRING' }
  },
  required: ['contactInfo', 'summary', 'skills', 'experience', 'education', 'matchedKeywords', 'missingKeywords', 'atsScore', 'suggestedImprovements']
};

app.post('/api/optimize', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const { resumeText, jobDescription } = req.body ?? {};

  if (!apiKey) {
    return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to .env.local, then restart the dev server.' });
  }
  if (typeof resumeText !== 'string' || !resumeText.trim() || typeof jobDescription !== 'string' || !jobDescription.trim()) {
    return res.status(400).json({ error: 'Provide both a resume and a target job description.' });
  }

  const prompt = `You are an expert ATS resume optimizer. Tailor the source resume to the target job description. Extract only facts present in the resume; never invent employers, degrees, dates, achievements, or skills. Naturally align the summary and experience bullets to relevant job keywords without misrepresenting experience. Return matched and missing keywords, an estimated ATS score from 0 to 100, and actionable improvement advice.\n\nSOURCE RESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jobDescription}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  let geminiResponse;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      geminiResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', responseSchema }
        })
      });
      if ((geminiResponse.status !== 429 && geminiResponse.status < 500) || attempt === 2) break;
    } catch {
      if (attempt === 2) {
        return res.status(502).json({ error: 'Could not connect to Gemini. Check the server connection and try again.' });
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * (2 ** attempt)));
  }

  const result = await geminiResponse.json().catch(() => ({}));
  if (!geminiResponse.ok) {
    const status = geminiResponse.status === 429 ? 429 : 502;
    return res.status(status).json({ error: result.error?.message || `Gemini request failed with status ${geminiResponse.status}.` });
  }

  const candidate = result.candidates?.[0];
  if (candidate?.finishReason === 'SAFETY') {
    return res.status(422).json({ error: 'Gemini blocked the request. Remove highly sensitive personal information and try again.' });
  }

  const responseText = candidate?.content?.parts?.[0]?.text;
  if (!responseText) {
    return res.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
  }

  try {
    const resume = JSON.parse(responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim());
    return res.json(resume);
  } catch {
    return res.status(502).json({ error: 'Gemini returned an invalid response format. Please try again.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Resume API listening on http://localhost:${port}`);
});
