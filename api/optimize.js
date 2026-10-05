const responseSchema = {
  type: 'object',
  properties: {
    contactInfo: { type: 'string', description: 'Candidate name and contact info (email, phone, links) separated by |' },
    summary: { type: 'string', description: 'A tailored 3-4 sentence professional summary for the job.' },
    skills: { type: 'array', items: { type: 'string' } },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          title: { type: 'string' },
          dates: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } }
        },
        required: ['company', 'title', 'dates', 'bullets']
      }
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          institution: { type: 'string' },
          degree: { type: 'string' },
          dates: { type: 'string' }
        },
        required: ['institution', 'degree', 'dates']
      }
    },
    matchedKeywords: { type: 'array', items: { type: 'string' } },
    missingKeywords: { type: 'array', items: { type: 'string' } },
    atsScore: { type: 'integer' },
    suggestedImprovements: { type: 'string' }
  },
  required: ['contactInfo', 'summary', 'skills', 'experience', 'education', 'matchedKeywords', 'missingKeywords', 'atsScore', 'suggestedImprovements']
};

function cleanGeminiResponse(text) {
  return String(text)
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export async function handleOptimize(req, res) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const { resumeText, jobDescription } = req.body ?? {};

  if (!apiKey) {
    return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to the deployment environment variables.' });
  }
  if (typeof resumeText !== 'string' || !resumeText.trim() || typeof jobDescription !== 'string' || !jobDescription.trim()) {
    return res.status(400).json({ error: 'Provide both a resume and a target job description.' });
  }

  const prompt = `You are an expert ATS resume optimizer. Tailor the source resume to the target job description. Extract only facts present in the resume; never invent employers, degrees, dates, or skills. Return valid JSON matching the schema exactly.

Resume:
${resumeText}

Target Job Description:
${jobDescription}

Provide a tailored resume with:
1. Contact info formatted as "Name | Email | Phone | LinkedIn"
2. A 3-4 sentence professional summary targeting this role
3. Top 8-10 relevant skills
4. Professional experience with 3-4 achievement-focused bullets per role (quantified when possible)
5. Education with institution, degree, and dates
6. Keywords from the job description that match the resume
7. Keywords from the job description that are missing
8. An ATS compatibility score (0-100) based on keyword density and formatting
9. Specific, actionable suggestions for improvement`;

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
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

  if (!geminiResponse) {
    return res.status(502).json({ error: 'Gemini request failed before a response was received.' });
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
    const resume = JSON.parse(cleanGeminiResponse(responseText));
    return res.json(resume);
  } catch (error) {
    console.error('Gemini JSON parse error:', error, responseText);
    return res.status(502).json({ error: 'Gemini returned an invalid response format. Please try again.' });
  }
}

export default async function optimize(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  return handleOptimize(req, res);
}
