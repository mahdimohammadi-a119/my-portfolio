# Portfolio CMS

Edit every text, link, image and project of the portfolio from `/admin`. The design is unchanged.

## Setup

```bash
npm install
cp .env.example .env     # then set ADMIN_PASSWORD to a long, random value
```

## Development

Run two terminals:

```bash
npm run server   # CMS API on http://localhost:3001
npm run dev      # site on http://localhost:5173, admin at http://localhost:5173/admin
```

## Production

```bash
npm run build
NODE_ENV=production npm start   # site + admin + API on the same port (PORT, default 3001)
```

Serve it behind HTTPS. The admin session cookie is marked `Secure` in production.

## Where data lives

- `data/content.json`: all text and settings. The previous version is kept as `data/content.json.bak`.
- `uploads/`: images uploaded from the admin (JPG, PNG, WEBP, GIF, max 5 MB each).

Back up both folders. Deleting `data/content.json` restores the original content.

## Notes

- Sessions are kept in memory, so restarting the server signs everyone out.
- Login is limited to 5 failed attempts per IP every 15 minutes.
- Contact form messages are not stored or emailed yet. The form only blocks the page reload.
