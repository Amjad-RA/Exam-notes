# Exam Notes

Visual, exam-focused revision notes for FYUGP programmes (University of Calicut syllabus), published as a static GitHub Pages site.

## What's inside

| Semester | Subject | Page |
|---|---|---|
| 1 | ECO1CJ101 · Principles of Economics | [`semester-1/principles-of-economics.html`](semester-1/principles-of-economics.html) |
| 1 | COM1MN108 · Advertisement and Sales Promotion | [`semester-1/advertisement-and-sales-promotion.html`](semester-1/advertisement-and-sales-promotion.html) |
| 1 | ENG1FA101(1B) · English Language Skills for Humanities and Other BA Programmes | [`semester-1/english-language-skills-for-humanities.html`](semester-1/english-language-skills-for-humanities.html) |
| 1 | MAL1FA102(1) · Literary Practices in Malayalam | [`semester-1/literary-practices-in-malayalam.html`](semester-1/literary-practices-in-malayalam.html) |

Each subject page follows the same four-part structure:

1. **10-minute cheat sheet**: one card per module with the core definitions, lists, acronyms and memory hooks.
2. **Chapter-by-chapter breakdown**: a golden definition per module, the key frameworks, and diagrams and tables you can reproduce in an answer script.
3. **Solved PYQs and likely questions**: every past question answered in examiner format, grouped by mark value. You can filter by module or show only repeated questions, and practice mode hides the answers.
4. **Exam strategy**: time plan, answer templates, diagrams to practise, and keywords.

The site has a light/dark theme toggle and a print / save-as-PDF button. Every answer opens automatically when printing.

## Publish on GitHub Pages

1. Go to **Settings → Pages** in this repository.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
3. Choose the branch with these files and the **/ (root)** folder, then **Save**.
4. The site appears at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

The site has no build step: plain HTML, CSS and JavaScript. The `.nojekyll` file tells Pages to serve the files exactly as they are.

## Adding a subject

1. Copy an existing subject page into the right `semester-N/` folder and replace its content.
2. In `index.html`, copy one `<section class="subject-section">…</section>` block into that semester's tab panel and update the title, code, modules and links.

## Adding a semester tab

In `index.html`, add a `<button class="tab" role="tab" …>` inside the tab list and a matching `<section class="tab-panel" role="tabpanel" …>`. Give them matching `aria-controls` / `id` values and a `data-hash` such as `semester-3`.

## Layout

```
index.html                     Home page with semester tabs and subject sections
semester-1/                    One HTML page per subject
assets/css/style.css           Shared design system (light and dark themes, components, print)
assets/js/site.js              Tabs, theme toggle, contents highlighting, question filters, chart tooltips
```

Definitions follow standard academic sources (AMA, Kotler, Colley). If your prescribed textbook words a definition differently, use the textbook's wording in the exam.
