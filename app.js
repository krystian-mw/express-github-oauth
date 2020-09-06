require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const bundler = require("parcel-bundler");
/**
 * index.html   - public    - route declaration here
 * login.html   - public    - route declaration here
 * app.html     - private   - route declaration in /routes/user
 * profile.html - private   - route declaration in /routes/user
 */
const parcel = new bundler("src/*.html");

const app = express();

app.use(express.static("public"));
app.use(express.static("dist"));

// During development, we'll use the parcel-bundler to bundle scripts on change,
// similar to webpack's dev server, but on production it'll just bundle it
process.env.NODE_ENV === "development"
  ? app.use(parcel.middleware())
  : parcel.bundle();

// We will expose our src folder for browser DevTools
process.env.NODE_ENV === "development" ? app.use(express.static("src")) : null;

app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.get("/", (req, res) => {
  //  This is our homepage
  res.sendFile("index.html", { root: "dist" });
});

app.get("/login", (req, res) => {
  // This is the login page
  // but if the user is logged in,
  // we'll redirect them to app
  if (req.session.user) {
    res.redirect(302, "/app");
  } else res.sendFile("login.html", { root: "dist" });
});

// Our auth route restrictor
const auth = (req, res, next) =>
  req.session.user ? next() : res.redirect(418, "/");

// Restricted GET /app route
app.get("/app", auth, (req, res) => res.sendFile("app.html", { root: "dist" }));
// Restricted GET /profile route
app.get("/profile", auth, (req, res) =>
  res.sendFile("profile.html", { root: "dist" })
);

// This is our API
app.use("/user", require("./routes/user"));

// 404
app.use((req, res) => {
  res.status(404);
  res.send("<h1>404 - Not found</h1>");
});

app.listen(process.env.PORT || 3000, () =>
  console.log(
    "🚀",
    "\x1b[32m",
    "Server runing on",
    "\x1b[0m",
    process.env.BASE_URI
  )
);
