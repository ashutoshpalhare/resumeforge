# ResumeForge

ResumeForge is a browser-based resume builder and job-description tailoring workspace. It helps users structure resume content, compare it with a job description, review keyword coverage, and make conservative wording improvements without inventing experience.

> **Important:** ResumeForge uses local, deterministic heuristics. It is not connected to commercial Applicant Tracking Systems (ATS), does not predict an employer's actual screening result, and does not use an LLM to rewrite content.

## What it does

### 1. Build and organize resumes

- Edit personal details, professional summary, experience, education, skills, projects, certifications, achievements, and custom sections.
- Reorder or hide supported resume sections.
- Choose between **Classic**, **Modern**, and **Compact** resume layouts.
- Start with a sample resume or create a blank one.
- Create multiple resume versions and duplicate a resume to tailor it for another role.

### 2. Compare a resume with a job description

Paste a job description into the workspace to run a local analysis. ResumeForge:

- Extracts likely required and preferred terms from common job-description sections.
- Checks resume text against a curated technology and workplace vocabulary.
- Recognizes a limited set of aliases and related terms.
- Classifies detected terms as **found**, **partial**, or **missing**.
- Groups keywords by importance and category.
- Produces a heuristic score breakdown and suggestions for improving clarity and coverage.
- Highlights responsibilities and qualifications found in the job description.

The analysis is intended as a review aid. It cannot reproduce the private rules, ranking models, or configuration of a specific employer's ATS.

### 3. Review deterministic rewrite suggestions

The optimization helpers make limited wording changes, such as replacing weak openings with clearer action verbs and removing filler words.

- Suggestions are generated from the text already present in the resume.
- The rewrite logic does not create new employers, skills, dates, metrics, or achievements.
- Changes can be reviewed individually or applied together.
- A saved baseline supports before/after comparison.

Always verify each suggested rewrite. Add a keyword only when it truthfully describes your experience.

### 4. Preview and export

- Preview the resume in an ATS-oriented, single-column document layout.
- Print the resume or choose **Save as PDF** in the browser print dialog.
- Copy the resume as plain text.
- Download a `.txt` version.
- Export and import resume data as JSON.
- Duplicate, reset, or delete resume versions.

The PDF export uses browser printing; ResumeForge does not currently generate a DOCX file.

## How the analysis works

The analysis engine is implemented in `src/lib/resume/ats.ts`:

1. The job description is split into lines and common headings are used to identify introductory, responsibility, requirement, and preferred sections.
2. A curated vocabulary is checked against the resume's plain-text content.
3. Alias rules account for selected variations such as `Node` / `Node.js` and `REST` / `REST APIs`.
4. Keyword matches are classified and summarized.
5. Additional checks look at resume structure and writing signals, such as weak bullet openings, dates, quantified bullets, and summary length.
6. The report combines these signals into a score and a set of suggestions.

This is a transparent, approximate checklist—not an official ATS score. Different ATS products and employers parse and rank resumes differently.

## Privacy and data storage

Resume data is stored in the browser's `localStorage` under the `resumeforge:v1` key.

- There is no application backend or user account system in the inspected implementation.
- Resume content is not uploaded to a ResumeForge server by the local analysis and rewrite utilities.
- Data is tied to the browser and origin being used. Clearing site data, changing browsers, or using another device can make locally stored resumes unavailable.
- Use the JSON export to keep your own backup, especially before clearing browser data.

Avoid entering sensitive information on a shared or untrusted device.

## Tech stack

| Area | Technology |
| --- | --- |
| UI | React 19, TypeScript |
| Routing / app framework | TanStack React Router, TanStack Start |
| Build tooling | Vite |
| Styling | Tailwind CSS 4 |
| UI primitives | Radix UI-based components |
| Icons | Lucide React |
| Testing | Vitest, Testing Library, jsdom |

## Project structure

```text
.
├── src/
│   ├── components/
│   │   ├── resume/
│   │   │   └── ResumeDocument.tsx
│   │   ├── studio/
│   │   │   ├── AtsPanel.tsx
│   │   │   ├── ExportPanel.tsx
│   │   │   ├── OptimizePanel.tsx
│   │   │   └── ...
│   │   └── ui/
│   ├── lib/
│   │   └── resume/
│   │       ├── ats.ts
│   │       ├── format.ts
│   │       ├── rewrite.ts
│   │       ├── sample.ts
│   │       ├── store.tsx
│   │       └── types.ts
│   ├── routes/
│   └── test/
├── package.json
└── vite.config.ts
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) (recommended; the repository includes `bun.lock`)
- Git

### Install and run

```bash
git clone https://github.com/ashutoshpalhare/ResumeForge.git
cd ResumeForge
bun install
bun run dev
```

Vite prints the local development URL in the terminal.

### Available scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Create a production build |
| `bun run build:dev` | Build using development mode |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint |
| `bun run test` | Run the Vitest test suite once |
| `bun run test:watch` | Run Vitest in watch mode |
| `bun run format` | Format project files with Prettier |

## Testing

Run the current automated tests with:

```bash
bun run test
```

The repository includes a routing test setup using Vitest, Testing Library, and jsdom. This should not be interpreted as full end-to-end coverage of every resume-editing or export workflow.

## Responsible use

ResumeForge can help identify wording and keyword gaps, but it cannot verify whether a claim is true. Never add skills, responsibilities, dates, certifications, or performance metrics just to increase a score. Review the final document for accuracy, readability, and role relevance before sending it to an employer.

## Contributing

Bug reports and focused improvements are welcome. Include clear reproduction steps for issues and tests for changes to the analysis or formatting logic. Keep the distinction between deterministic local heuristics and external AI/ATS services explicit in documentation and UI copy.

## License

No license file is currently included. Unless a license is added, the repository is publicly viewable but reuse and redistribution are not automatically granted.
