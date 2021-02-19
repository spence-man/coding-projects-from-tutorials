const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const authRouter = require("./routes/admin/auth");
const adminProductsRouter = require("./routes/admin/products");
const productsRouter = require("./routes/products");
const cartsRouter = require("./routes/carts");

const app = express();

// Middlewares
app.use(express.static("public")); // To serve static files such as images, CSS files, and JavaScript files
app.use(bodyParser.urlencoded({ extended: true })); // Wires up middleware and detects Post submission and parses data
app.use(
  cookieSession({
    keys: ["asdfs"], // used to encrypt information stored in cookie
  })
);
app.use(authRouter);
app.use(productsRouter);
app.use(adminProductsRouter);
app.use(cartsRouter);

app.listen(3000, () => {
  console.log("listening");
});
