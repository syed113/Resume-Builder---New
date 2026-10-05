<!-- Centered header -->
<div align="center">

# 🎯 AI Resume Tailor

**Tailor your resume to any job description in seconds using Google Gemini AI.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-blue?style=for-the-badge)](https://resumeanalyzer-fawn.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/syed113/Resume-Builder---New)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

</div>

---

## 📖 Overview

**AI Resume Tailor** is a web application that takes your existing resume and a target job description, then uses Google's Gemini AI to:

- **Rewrite your experience** to semantically align with the role
- **Identify keyword gaps** between your resume and the job posting
- **Estimate ATS compatibility** so you know how well you'll pass automated screening

The goal is simple: help job seekers create more targeted, ATS-friendly applications without spending hours manually editing.

> **Why I built this:** After watching friends and colleagues struggle with ATS rejections despite being qualified, I wanted to see if AI could bridge the gap between human experience and machine-readable applications.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **AI-Powered Tailoring** | Rewrites bullet points and summaries to match the target role's language |
| **Keyword Gap Analysis** | Shows which keywords from the job description are missing from your resume |
| **ATS Score Estimate** | Gives a compatibility percentage based on formatting and keyword density |
| **Editable Output** | The generated resume is fully editable before you export |
| **Privacy-First** | Your resume and job description are processed server-side; API key never exposed to browser |

---

## 🏗️ Architecture
User Browser (React + Vite)
│
▼
POST /api/optimize (Vercel Serverless Function)
│
▼
Google Gemini API (server-side, API key protected)

- **Frontend:** React + Vite — fast, modern SPA with hot module replacement
- **Backend:** Vercel Serverless Function (`/api/optimize`) — handles Gemini API calls securely
- **AI:** Google Gemini — semantic analysis and resume rewriting
- **Deployment:** Vercel — frontend + serverless function deployed together

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- A [Google AI Studio](https://aistudio.google.com/) account to generate a Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/syed113/Resume-Builder---New.git
cd Resume-Builder---New
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and add your Gemini API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```text
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-3-flash-preview   # optional, defaults to gemini-3-flash-preview
```

⚠️ Important: `.env.local` is git-ignored. Never commit your API key.

### 4. Run the development server

```bash
npm run dev
```

Open the Vite URL printed in your terminal (usually http://localhost:5173).

### 5. Build for production

```bash
npm run build
```

A deployed application also needs a server-side `/api/optimize` endpoint with `GEMINI_API_KEY` configured; do not put the key in frontend environment variables.

### Deploying to Vercel

1. Push your repo to GitHub
2. Import the project in Vercel
3. In Settings → Environment Variables, add:
   - `GEMINI_API_KEY` — your Google AI Studio key
   - `GEMINI_MODEL` (optional) — e.g., `gemini-3-flash-preview`
4. Redeploy

> Note: Do not use a `VITE_` prefix for the API key — Vite-prefixed variables are exposed to the browser.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18 |
| Build Tool | Vite |
| AI / LLM | Google Gemini API |
| Serverless Backend | Vercel Functions |
| Deployment | Vercel |
| Language | JavaScript (ES Modules) |

## 📁 Project Structure

```text
├── api/
│   └── optimize.js          # Vercel serverless function (Gemini integration)
├── public/                  # Static assets
├── src/                     # React source code
│   ├── components/          # UI components
│   ├── pages/               # Page views
│   └── main.jsx             # App entry point
├── .env.example             # Environment variable template
├── package.json
└── README.md
```

## 🗺️ Roadmap

- Support for multiple resume formats (PDF, DOCX upload)
- Side-by-side diff view of original vs. tailored resume
- Export tailored resume as PDF
- Cover letter generation
- User accounts to save and revisit past tailors

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements or find a bug:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgements

- Google Gemini API for the AI backbone
- Vercel for seamless deployment
- Vite for the blazing-fast build tooling

<div align="center">
Built with ❤️ to help job seekers land their next role.

⭐ If this project helped you, consider giving it a star!

</div>

