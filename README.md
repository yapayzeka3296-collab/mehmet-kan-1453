# MySkyParcel

MySkyParcel digital parcel platform.

## Development

Node.js 22.x and npm are recommended.

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

## Production — Netlen / Node.js / Passenger

```sh
npm install
npm run build
npm start
```

The production server is started from `.output/server/index.mjs` through `app.js` for Node.js/Passenger hosting environments.

The production target is standard Node.js hosting; Vercel is not required.
