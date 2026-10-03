# AI Resume Tailor

A React app that tailors a resume to a job description with Gemini and returns an editable resume, keyword gap analysis, and ATS estimate.

## Run locally

1. Create a Gemini API key in Google AI Studio.
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to your key. `.env.local` is ignored by Git.
3. Run `npm run dev` and open the Vite URL printed in the terminal.

The app sends resume text and the job description to the local API server, which makes the Gemini request. The API key is only read by the server and is not included in browser code. Usage may incur charges under your Google account.

Set `GEMINI_MODEL` in `.env.local` to use a different Gemini model. Restart the dev server after changing environment variables.

## Build

Run `npm run build` to create the frontend production bundle. A deployed application also needs a server-side `/api/optimize` endpoint with `GEMINI_API_KEY` configured; do not put the key in frontend environment variables.
