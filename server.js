const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const http = require("http");
const cookieParser = require("cookie-parse");
const validator = require("express-validator");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");

const container = require("./container");

container.resolve(function (users) {
  mongoose.Promise = global.Promise;
  mongoose.connect("mongodb://localhost/footballkik", { useMongoClient: true });

  const app = SetupExpress();

  function SetupExpress() {
    const app = express();
    const server = http.createServer(app);
    server.listen(3000, () => {
      console.log("listening... ");
    });

    ConfigureExpress(app);

    const router = require("express-promise-router")();
    users.SetRouting(router);

    app.use(router);
  }

  function ConfigureExpress(app) {
    app.use(express.static("public"));
    app.use(cookieParser());
    app.set("view engine", "ejs");
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(validator());
    app.use(
      session({
        secret: "test-secret",
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
      })
    );
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
  }
});
