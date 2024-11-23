<img src="client/public/preview.png" alt="Incivent" width="80%"/>

# [Incivent](https://dont-commit-crimes.vercel.app/)

A web application and backend server that allows users to report incidents in their community. Built for the Fall 2024 Hackathon at Oregon State University.

## Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

> [!NOTE]
> You'll need to start a local MongoDB instance. Create a `.env.local` file in the root directory with the following content:
> ```
> MONGO_URI=mongodb://root:password@127.0.0.1:27017
> # run `openssl rand -hex 32` to generate a secret
> JWT_SECRET=
> ```
> Replace `password` with your MongoDB password and `JWT_SECRET` with a secret key.

## Development

```bash
# start the database instance
docker-compose up -d
# stop the database instance
docker-compose down --remove-orphans --volumes
```

Once you have installed the dependencies, you can start the development server by running:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

This will start the development server on [http://localhost:3000](http://localhost:3000).
