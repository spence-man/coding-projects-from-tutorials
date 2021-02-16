const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const authRouter = require("./routes/admin/auth");

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true })); // Wires up middleware and detects Post submission and parses data
app.use(
  cookieSession({
    keys: ["asdfs"], // used to encrypt information stored in cookie
  })
);
app.use(authRouter);

app.listen(3000, () => {
  console.log("listening");
});
