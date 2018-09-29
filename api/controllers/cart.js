const { Cart } = require('../../models/cart');
const { Product } = require('../../models/product');
const { each, isEmpty } = require('lodash');
const { findManyProducts } = require('./product');
const { buildProduct } = require('../../dao/product');
const { buildFullCart } = require('../../dao/cartDao');

const cartController = {
  get (req, res) {
    const getFullCart = req.params.getFullCart;
    // Searches if the user has a cart and returns it. If not, then creates one.
    Cart.findOneAndUpdate({}, { expire: new Date()}, { upsert: true, new: true, setDefaultsOnInsert: true },
    (error, cart) => {
      if (error) {
        res.status(500).json({ message: `Failed to create a cart! => ${error}` });
      }
      if (getFullCart === 'true') {
        buildFullCart(cart, (errorMessage, fullCart) => {
          if (errorMessage) {
            console.log(`Failed to load a full cart! => ${errorMessage}`);
            res.status(500).json({ message: `Failed to load a full cart! => ${errorMessage}` });
          } else {
            res.json(fullCart);
          }
        });
      } else res.json(cart);
    });
  },
  createUpdateItem (req, res) {
    const idCart = req.params.id;
    const productId = req.body.productId;
    const productAmount = req.body.amount;
    let responseSent = false;
    let productItem = {product_id: productId, amount: productAmount};
    Cart.findOneAndUpdate(
      { _id: idCart, 'items.product_id': productId },
      { $set: { 'items.$.amount' : productAmount } },
      { new: true },
      (error, cartDocument) => {
        if (error) {
          console.log(`Failed to update the item in the cart! => ${error}`);
          res.status(500).json({ message: `Failed to update the item in the cart! => ${error}` });
        }
        if (isEmpty(cartDocument)) {
          Cart.findOneAndUpdate(
            { _id: idCart },
            { $push: {items: productItem} },
            { new: true },
            (error, cartDocument) => {
              if (error) {
                responseSent = true;
                console.log(`Failed to push a new item in the cart! => ${error}`);
                res.status(500).json({ message: `Failed to push a new item in the cart! => ${error}` });
              } else if (isEmpty(cartDocument)) {
                responseSent = true;
                console.log(`Failed to push a new item in the cart! => ${error}`);
                res.status(500).json({ message: `Failed to push a new item in the cart! => ${error}` });
              } else {
                responseSent = true;
                res.json(cartDocument);
              }
            });
        } else if (!responseSent) {
            res.json(cartDocument);
          }
      });
  },
  removeItem (req, res) {
    const cartId = req.body.cartId;
    const productId = req.body.productId;
    const getFullCart = req.body.getFullCart;
    Cart.findOneAndUpdate(
      { _id: cartId },
      { $pull: {items: { product_id: productId } } },
      { new: true },
      (error, cart) => {
        if (error) {
          res.status(500).json({ message: `Failed to delete the item from the cart! => ${error}` });
        }
        if ((cart.items.length == 0) || (getFullCart === 'false')) {
          res.json(cart);
        } else {
          buildFullCart(cart, (errorMessage, fullCart) => {
            if (errorMessage) {
              console.log(`Failed to load a full cart! => ${errorMessage}`);
              res.status(500).json({ message: `Failed to load a full cart! => ${errorMessage}` });
            } else {
              res.json(fullCart);
            }
          });
        }
    });
  },
};

module.exports = cartController;
