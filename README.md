# MySkyParcel

MySkyParcel, Türkiye'nin şehirleri ve gökyüzü haritası üzerinden dijital parsel koleksiyonu, sertifika ve kullanıcı işlemleri sunan web platformudur.

## Production

- Framework: TanStack Start + React + Tailwind CSS
- Server: Nitro `node-server`
- Runtime: Node.js 22.x
- Hosting: cPanel / CloudLinux / LiteSpeed / Passenger
- Startup file: `app.js`
- Production build: `.output/`
- Deployment: GitHub → cPanel
- Public assets: `.output/public`

## Development

```sh
npm install
npm run dev
```

Production build:

```sh
npm run build
npm run start:production
```

## cPanel

The cPanel Node.js application uses `app.js` as the Passenger startup file. The generated Nitro server is loaded from `.output/server/index.mjs`, while Nitro reads the port supplied by Passenger.

The deployment configuration is defined in `.cpanel.yml`. It publishes `.output/public` to the domain document root and creates the Passenger-enabled document-root configuration before restarting the application.
