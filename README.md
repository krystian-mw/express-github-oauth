# Express JS and Github Oauth Example

This is just a really quick guide how to integrate Github's OAuth with Express and Express Session.

### Usage

1. `git clone https://github.com/krystian-mw/express-github-oauth`
2. `cd express-github-oauth`
3. `yarn`
4. Fill in `.env` as presented by `.env.sample`
5. `yarn start` for demo
6. `yarn dev` for dev

#### Good luck!

P.S. Sorry for the really rough frontend. This is not up to my standards in any way, it's just for demo purposes.

----------

## WINDOWS USERS
After step 4. from usage, run `yarn add cross-env` and change `scripts` in `package.json` to:
```json
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon app.js -w app.js -w routes -w models",
    "start": "cross-env NODE_ENV=production node app"
  },
```
