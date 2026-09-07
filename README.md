# Backend Field Notes

A local React and TypeScript interview library with book-style chapters on Java collections, equality contracts, implementation tradeoffs, and backend interview topics.

## Published site

The site is published at [argishtiyegh.github.io/interview-prep](https://argishtiyegh.github.io/interview-prep/) through GitHub Pages. Every push to `main` automatically builds and deploys the latest version with the workflow in `.github/workflows/deploy-pages.yml`.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by the development server. Build the production version with `npm run build`.

## Add a reviewed answer

1. Create a React content module in `components/answers`. Reuse `Section`, `Callout`, `CodeBlock`, and `Figure` from `components/answer-primitives.tsx`.
2. Add one typed entry to `questions` in `lib/questions.ts`, selecting one of the existing categories and importing the content component.
3. Use a stable, lowercase slug and add `app/questions/<slug>/page.tsx`, following the existing HashMap route. The registry makes the answer appear in category navigation.
4. Label simplified diagrams and version-specific Java implementation details clearly.

This project intentionally has no backend, authentication, embedded chatbot, or in-browser editor. Answers are drafted with ChatGPT, reviewed in conversation, and then committed as static content.
