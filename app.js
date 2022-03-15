const { v4: uuidv4 } = require("uuid");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var models = require("./models/users");
const app = express();
//

//
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  req.context = {
    models,
    me: models.users[1],
  };
  next();
});

app.get("/", (req, res) => {
  res.send(models.messages);
});

app.get("/session", (req, res) => {
  return res.send(req.context.models.users[req.context.me.id]);
});

app.get("/users", (req, res) => {
  return res.send(Object.values(req.context.models.users));
});

app.get("/users/:userId", (req, res) => {
  return res.send(req.context.models.users[req.params.userId]);
});

app.get("/messages", (req, res) => {
  return res.send(Object.values(req.context.models.messages));
});

app.get("/messages/:messageId", (req, res) => {
  return res.send(req.context.models.messages[req.params.messageId]);
});

app.post("/messages", (req, res) => {
  const id = uuidv4();
  console.log(req.body);
  const message = {
    id,
    text: req.body.text,
    userId: req.context.me.id,
  };

  req.context.models.messages[id] = message;

  return res.send(message);
});

app.delete("/messages/:messageId", (req, res) => {
  const { [req.params.messageId]: message, ...otherMessages } =
    req.context.models.messages;

  req.context.models.messages = otherMessages;

  return res.send(message);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
