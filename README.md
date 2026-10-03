# AI Resume Tailor

A React app that tailors a resume to a job description with Gemini and returns an editable resume, keyword gap analysis, and ATS estimate.

## Run locally

1. Create a Gemini API key in Google AI Studio.
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to your key. `.env.local` is ignored by Git.
3. Run `npm run dev` and open the Vite URL printed in the terminal.

The app sends resume text and the job description to a server-side API endpoint, which makes the Gemini request. The API key is only read by the server and is not included in browser code. Usage may incur charges under your Google account.

Set `GEMINI_MODEL` in `.env.local` to use a different Gemini model. Restart the dev server after changing environment variables.

## Build

Run `npm run build` to create the frontend production bundle. Vercel deploys the server-side `/api/optimize` function from `api/optimize.js` alongside the frontend.

For Vercel:

1. In the Vercel project, open **Settings → Environment Variables**.
2. Add `GEMINI_API_KEY` with your Google AI Studio API key. Select the environments you deploy (for example, Production and Preview).
3. Optionally add `GEMINI_MODEL` if you want to use a model other than `gemini-3-flash-preview`.
4. Redeploy so the function receives the environment variables.

Do not use a `VITE_` prefix or put the key in frontend code; Vite-prefixed variables are exposed to the browser. If `/api/optimize` returns a non-JSON page, check the Vercel deployment logs and confirm the API function was included in the deployment. If it returns a JSON configuration error, confirm `GEMINI_API_KEY` is set for that deployment environment and redeploy.
