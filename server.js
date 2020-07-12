const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const http = require("http");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");
const socketIO = require("socket.io");
const { Users } = require("./helpers/UsersClass");

const container = require("./container");

container.resolve(function (users, _, admin, home, group) {
  mongoose.set("useFindAndModify", false);
  mongoose.set("useCreateIndex", true);
  mongoose.Promise = global.Promise;
  mongoose.connect("mongodb://localhost/footballkik", {
    useNewUrlParser: true,
  });

  const app = SetupExpress();

  function SetupExpress() {
    const app = express();
    const server = http.createServer(app);
    const io = socketIO(server);
    server.listen(3000, () => {
      console.log("listening... ");
    });

    ConfigureExpress(app);

    require("./socket/groupchat")(io, Users);
    require("./socket/friend")(io);
    require("./socket/globalroom")(io);

    const router = require("express-promise-router")();
    users.SetRouting(router);
    admin.SetRouting(router);
    home.SetRouting(router);
    group.SetRouting(router);

    app.use(router);
  }

  function ConfigureExpress(app) {
    require("./passport/passport-local");
    require("./passport/passport-facebook");
    require("./passport/passport-google");
    app.use(express.static("public"));
    app.use(cookieParser());
    app.set("view engine", "ejs");
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // app.use(validator());
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

    app.locals._ = _;
  }
});
