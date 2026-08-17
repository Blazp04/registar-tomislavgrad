# Frontend registra

React/Vite sučelje za javni, studentski i administratorski dio registra.

```bash
npm ci
npm run dev
npm run lint
npm run build
```

Backend URL se postavlja kroz `VITE_BACKEND_URL`. U Docker/Nginx distribuciji vrijednost se čita iz `/env-config.js`, pa se ista slika može koristiti u više okolina.
