# Backend Field Notes

A local React and TypeScript interview library. The first reviewed article explains how Java `HashMap` works with interactive insertion and resizing diagrams.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by the development server. Build the production version with `npm run build`.

## Add a reviewed answer

1. Create a React content module in `components/answers`. Reuse `Section`, `Callout`, `CodeBlock`, and `Figure` from `components/answer-primitives.tsx`.
2. Add one typed entry to `questions` in `lib/questions.ts`, selecting one of the existing categories and importing the content component.
3. Use a stable, lowercase slug. The page is automatically available at `/questions/<slug>` and appears in the category navigation.
4. Label simplified diagrams and version-specific Java implementation details. Give animated visuals keyboard-accessible Play/Pause, Next, and Reset controls.

This project intentionally has no backend, authentication, embedded chatbot, or in-browser editor. Answers are drafted with ChatGPT, reviewed in conversation, and then committed as static content.
