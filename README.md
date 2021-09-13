This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

As this is a decentralised app, there is no servers involved, just relays and webRTC, powered by [GUNDB]('https://gun.eco')

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Running your own local server
https://gun.eco/docs/Installation#server

1. Create a seperate folder (e.g. `gun-db`)
2. Change directory and install gun via the command line (`cd gun-db && yarn add gun`)
3. Create `index.js` file and follow one of the examples here https://github.com/amark/gun/tree/master/examples
   - `http.js`
   - `express.js` or
   - `hapi.js`
  depending on what you need
4. Run the server: `node index.js` and add it to your client code

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [GUN](https://gun.eco) - easy way to build a dApp

## Feedback

Any feedback are welcome!