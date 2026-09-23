# CARIO frontend

Next.js frontend for the CARIO career development ecosystem. The interface is in Vietnamese and includes a landing page and an interactive student workspace.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Open `http://localhost:3000/workspace` to enter the product workspace.

## Scope

- The guided discovery conversation records the user's stage, interests, strengths, values, and self-reported skills. It keeps the result on return and opens the matching career on the comparison screen.
- Career Quest filters, details, save actions, and reflections are interactive. Reflections can be added to the evidence-based Career Identity profile.
- The CV screen reads text from an uploaded PDF locally in the browser or accepts pasted text. It checks the text with simple rules and compares mentioned skills with a chosen role and profile evidence.
- Career Coach offers keyword-based guidance from the question and saved profile information. It does not call an AI service.
- The connections screen shows CARENOVA team members. Mentor and opportunity lists remain empty until their details are confirmed. Community posts, reactions, and replies work in the browser after a user creates a post.
- Workspace state is saved in `localStorage` on the current browser. CV text, uploaded files, and Coach messages are not persisted.
- Quest scenarios are practice exercises. No account, database, AI service, live mentor booking, or registration is connected.

Run `npm run build` to check the production build and TypeScript types.
