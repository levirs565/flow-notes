# Flow Notes

## Server

Installing dependencies:

```
npm install
```

Configure `server/.env`

```
PORT=8080
DATABASE_URL="..."
SESSION_SECRET="...secret..."
```

Migrate database:

```sh
npx prisma migrate
```

Generate Prisma:

```sh
npx prisma generate
```

Building

```sh
npm run build
```

Starting

```sh
npm run start
```

## Client


Installing dependencies:

```
npm install
```

By default, Vite proxy `/api` to `http://localhost:8080`. You can configure this in `client/vite.config.js`

Developing:

```sh
npm run dev
```

Building:

```sh
npm run build
```
