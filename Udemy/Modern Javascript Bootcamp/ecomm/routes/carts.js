const express = require("express");
const carts = require("../repositories/carts");
const cartsRepo = require("../repositories/carts");
const productsRepo = require("../repositories/products");
const cartShowTemplate = require("../views/carts/show");

const router = express.Router();

// router.get("/", async (req, res) => {
//   const products = await productsRepo.getAll();
//   res.send(productsIndexTemplate({ products }));
// });

// POST add item to cart
router.post("/cart/products", async (req, res) => {
  let cart;
  // Check existing cart for user
  if (!req.session.cartId) {
    cart = await cartsRepo.create({ items: [] });
    req.session.cartId = cart.id;
  } else {
    cart = await cartsRepo.getOne(req.session.cartId);
  }

  // Add new or increment existing product to cart product item array
  const existingItem = cart.items.find(
    (item) => item.id === req.body.productId
  );
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.items.push({ id: req.body.productId, quantity: 1 });
  }
  await cartsRepo.update(cart.id, {
    items: cart.items,
  });

  res.redirect("/cart");
});

// GET show all cart items
router.get("/cart", async (req, res) => {
  if (!req.session.cartId) {
    return res.redirect("/");
  }

  const cart = await cartsRepo.getOne(req.session.cartId);
  for (let item of cart.items) {
    const product = await productsRepo.getOne(item.id);
    item.product = product;
  }
  res.send(cartShowTemplate({ items: cart.items }));
});

// POST delete cart item
router.post("/cart/products/delete", async (req, res) => {
  const { itemId } = req.body;
  const cart = await carts.getOne(req.session.cartId);
  const items = cart.items.filter((item) => item.id !== itemId); // only leave items that don't match the deleted id

  await cartsRepo.update(req.session.cartId, { items });

  res.redirect("/cart");
});

module.exports = router;
