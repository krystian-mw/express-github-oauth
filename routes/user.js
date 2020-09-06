const router = require("express").Router();
const axios = require("axios").default;
const user = require("../models/user");

router.get("/login/:provider", (req, res) => {
  switch (req.params.provider) {
    case "github":
      return res.redirect(
        302,
        `https://github.com/login/oauth/authorize` +
          `?client_id=${process.env.GITHUB_CLIENT_ID}` +
          `&redirect_uri=${process.env.BASE_URI}/user/callback/github` +
          `&scope=user` +
          `&allow_signup=true`
      );
    default:
      res.redirect(400, "/login");
  }
});

router.use("/callback/:provider", async (req, res) => {
  // According to the OAuth Code Flow protocol,
  // on callback a user will provide us with a code
  // that the provider has generate for us
  // After we receive this code, we have to contact
  // github to request a access_token that we will
  // later use to access the user's data with
  if (!req.query.code) {
    res.statusCode = 400;
    res.end();
  } else {
    switch (req.params.provider) {
      case "github":
        // This is where we make the request to
        // get the access_token
        const { data } = await axios.post(
          "https://github.com/login/oauth/access_token",
          JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: req.query.code,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        // Now that we have received the users access_token,
        // we can go on and use Github's API to request user info
        // The user's emails can be found by:
        // GET https://api.github.com/user/emails
        const emails = (
          await axios.get("https://api.github.com/user/emails", {
            headers: {
              Authorization: `${data.token_type} ${data.access_token}`,
              "X-OAuth-Scopes": "user",
              "X-Accepted-OAuth-Scopes": "user",
            },
          })
        ).data;
        // According to Github's docs at:
        // https://docs.github.com/en/rest/reference/users#list-email-addresses-for-the-authenticated-user
        // this will reply with a array of email,
        // so now all we need to to do is find the
        // user's primary email address
        emails.forEach((email) => {
          if (email.primary) {
            user.findOne({ email: email.email }, async (err, doc) => {
              if (err) throw err;
              // And of course register the user if they don't exists yet
              if (!doc) {
                doc = await new user({
                  email: email.email,
                }).save();
              }
              // And after finding them, or creating, we ammend them to the req.session
              req.session.user = doc;
              // And send them off to the app
              res.redirect("/app");
            });
          }
        });
        break;
      default:
        res.status(400);
        res.redirect("/login");
    }
  }
});

router.use((req, res, next) => {
  // All routes under after this will require authentication
  if (req.session.user) return next();
  res.redirect(302, "/login");
});

router.get("/profile", (req, res) => {
  res.json(req.session.user);
});

module.exports = router;
