import { useState } from 'react';
import {
  Upload, FileText, FileSearch, Briefcase,
  ChevronRight, CheckCircle2, AlertTriangle,
  Printer, Edit3, Save, RefreshCw,
  Download, ArrowLeft, Key
} from 'lucide-react';

export default function App() {
  const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Results
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [resumeData, setResumeData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => setResumeText(event.target.result);
      reader.readAsText(file);
    } else {
      setIsError(true);
      setErrorMessage('For this web version, please upload a .txt file or paste your resume text directly.');
    }
  };

  const handleOptimize = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setIsError(true);
      setErrorMessage('Please provide both your current resume and the target job description.');
      return;
    }

    setIsError(false);
    setStep(2);

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription })
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const responseText = (await response.text()).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const detail = responseText ? ` ${responseText.slice(0, 160)}` : '';
        throw new Error(`The API returned a non-JSON response (HTTP ${response.status}). Check that /api/optimize is deployed.${detail}`);
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Request failed with status ${response.status}`);
      }

      setResumeData(result);
      setStep(3);
    } catch (err) {
      console.error('Optimization Process Error:', err);
      setIsError(true);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      setStep(1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    if (!resumeData) return;
    let md = `# ${resumeData.contactInfo}\n\n`;
    md += `## Professional Summary\n${resumeData.summary}\n\n`;
    md += `## Core Competencies\n${resumeData.skills.join(' | ')}\n\n`;
    md += '## Professional Experience\n';
    resumeData.experience.forEach((exp) => {
      md += `### ${exp.title} - ${exp.company}\n*${exp.dates}*\n`;
      exp.bullets.forEach((b) => { md += `- ${b}\n`; });
      md += '\n';
    });
    md += '## Education\n';
    resumeData.education.forEach((edu) => {
      md += `- **${edu.degree}** - ${edu.institution} (${edu.dates})\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Tailored_Resume.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderInputStep = () => (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          AI Resume <span className="text-blue-600">Tailor</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Beat the ATS. Paste your current resume and the target job description, and our AI will semantically align your experience.
        </p>
      </div>

      {isError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              1. Your Current Resume
            </label>
            <label className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1 transition-colors">
              <Upload className="w-3 h-3" />
              Upload .TXT
              <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your existing resume here..."
            className="w-full h-[400px] p-4 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600" />
            2. Target Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job requirements and responsibilities here..."
            className="w-full h-[400px] p-4 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleOptimize}
          className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-slate-900 border border-transparent rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)]"
        >
          Analyze & Optimize
          <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <Key className="w-3.5 h-3.5" />
        Gemini API key is stored securely on the server as <code>GEMINI_API_KEY</code>.
      </p>
    </div>
  );

  const renderLoadingStep = () => (
    <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <RefreshCw className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Tailoring your resume...</h2>
        <p className="text-slate-500">Extracting semantic keywords and aligning your experience.</p>
      </div>
    </div>
  );

  const renderResultStep = () => {
    if (!resumeData) return null;

    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 print:block print:h-auto print:gap-0">
        <div className="w-full lg:w-1/3 flex flex-col gap-4 print:hidden overflow-y-auto pr-2 pb-8">
          <button
            onClick={() => setStep(1)}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Editor
          </button>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900">ATS Gap Analysis</h3>
            </div>
            <div className="p-4 space-y-6">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estimated ATS Match</h4>
                  <p className="text-xs text-slate-500">Based on keyword optimization</p>
                </div>
                <div className={`text-3xl font-extrabold ${resumeData.atsScore >= 80 ? 'text-green-600' : resumeData.atsScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {resumeData.atsScore}%
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Matched Keywords</h4>
                {resumeData.matchedKeywords && resumeData.matchedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {resumeData.matchedKeywords.map((kw, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No exact keyword matches found.</p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Missing Keywords</h4>
                {resumeData.missingKeywords && resumeData.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {resumeData.missingKeywords.map((kw, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-2 rounded-md">
                    <CheckCircle2 className="w-4 h-4" /> Strong keyword alignment!
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Strategic Suggestions</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                  {resumeData.suggestedImprovements}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 mt-auto">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Export Options</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handlePrint} className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                <Printer className="w-4 h-4" /> Print PDF
              </button>
              <button onClick={handleExportMarkdown} className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" /> Markdown
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3 bg-white rounded-xl border border-slate-200 shadow-xl overflow-y-auto print:border-none print:shadow-none print:w-full print:overflow-visible">
          <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10 print:hidden">
            <h2 className="font-semibold text-slate-900">Document Preview</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isEditing ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : <><Edit3 className="w-4 h-4" /> Edit Resume</>}
            </button>
          </div>

          <div className="p-8 sm:p-12 max-w-[850px] mx-auto print:p-0">
            {isEditing ? renderEditableResume() : renderStaticResume()}
          </div>
        </div>
      </div>
    );
  };

  const renderEditableResume = () => {
    const updateData = (field, value) => {
      setResumeData((prev) => ({ ...prev, [field]: value }));
    };

    const updateExperience = (index, field, value) => {
      const newExp = [...resumeData.experience];
      newExp[index][field] = value;
      updateData('experience', newExp);
    };

    const updateBullet = (expIndex, bulletIndex, value) => {
      const newExp = [...resumeData.experience];
      newExp[expIndex].bullets[bulletIndex] = value;
      updateData('experience', newExp);
    };

    return (
      <div className="space-y-8">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Contact Information</label>
          <input
            className="w-full text-center text-xl font-bold border-b-2 border-slate-200 focus:border-blue-500 outline-none pb-1"
            value={resumeData.contactInfo}
            onChange={(e) => updateData('contactInfo', e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Professional Summary</label>
          <textarea
            className="w-full text-sm leading-relaxed border-2 border-slate-200 rounded-md p-2 focus:border-blue-500 outline-none resize-y min-h-[100px]"
            value={resumeData.summary}
            onChange={(e) => updateData('summary', e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Core Competencies (Comma Separated)</label>
          <textarea
            className="w-full text-sm leading-relaxed border-2 border-slate-200 rounded-md p-2 focus:border-blue-500 outline-none"
            value={resumeData.skills.join(', ')}
            onChange={(e) => updateData('skills', e.target.value.split(',').map((s) => s.trim()))}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Professional Experience</label>
          <div className="space-y-6">
            {resumeData.experience.map((exp, i) => (
              <div key={i} className="p-4 border-2 border-slate-100 rounded-lg space-y-3 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4">
                  <input className="font-bold border-b border-slate-300 bg-transparent outline-none" value={exp.title} onChange={(e) => updateExperience(i, 'title', e.target.value)} placeholder="Job Title" />
                  <input className="font-bold border-b border-slate-300 bg-transparent outline-none text-right" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} placeholder="Company" />
                  <input className="text-sm italic border-b border-slate-300 bg-transparent outline-none" value={exp.dates} onChange={(e) => updateExperience(i, 'dates', e.target.value)} placeholder="Dates" />
                </div>
                <div className="space-y-2 mt-2">
                  {exp.bullets.map((bullet, j) => (
                    <div key={j} className="flex gap-2 items-start">
                      <span className="mt-1 text-slate-400">•</span>
                      <textarea
                        className="w-full text-sm border border-slate-200 rounded p-1 outline-none resize-none min-h-[40px]"
                        value={bullet}
                        onChange={(e) => updateBullet(i, j, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStaticResume = () => {
    return (
      <div className="text-slate-900 font-sans space-y-6">
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <h1 className="text-3xl font-bold tracking-tight mb-2 whitespace-pre-wrap">{resumeData.contactInfo.split('|')[0] || resumeData.contactInfo}</h1>
          {resumeData.contactInfo.includes('|') && (
            <p className="text-sm text-slate-600">{resumeData.contactInfo.split('|').slice(1).join(' | ')}</p>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-800 border-b border-slate-300 pb-1">Professional Summary</h2>
          <p className="text-sm leading-relaxed text-slate-700">{resumeData.summary}</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-800 border-b border-slate-300 pb-1">Core Competencies</h2>
          <p className="text-sm leading-relaxed text-slate-700 font-medium">
            {resumeData.skills.join('  •  ')}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-800 border-b border-slate-300 pb-1">Professional Experience</h2>

          {resumeData.experience.map((exp, i) => (
            <div key={i} className="space-y-1.5 break-inside-avoid">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-slate-900">{exp.title}</h3>
                <span className="text-sm font-semibold text-slate-700">{exp.company}</span>
              </div>
              <p className="text-sm italic text-slate-500 mb-2">{exp.dates}</p>
              <ul className="list-disc list-outside ml-4 space-y-1">
                {exp.bullets.map((bullet, j) => (
                  <li key={j} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-3 break-inside-avoid">
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-800 border-b border-slate-300 pb-1">Education</h2>
          {resumeData.education.map((edu, i) => (
            <div key={i} className="flex justify-between items-baseline">
              <div>
                <span className="font-bold text-slate-900">{edu.degree}</span>
                <span className="text-slate-700 mx-2">—</span>
                <span className="text-slate-700">{edu.institution}</span>
              </div>
              <span className="text-sm italic text-slate-500">{edu.dates}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans print:bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep(1)}>
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">AI Resume Builder</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0 print:max-w-none">
        {step === 1 && renderInputStep()}
        {step === 2 && renderLoadingStep()}
        {step === 3 && renderResultStep()}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { margin: 0.75in; }
        }
      ` }} />
    </div>
  );
}
