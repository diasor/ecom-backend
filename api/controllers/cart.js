const { Cart } = require('../../models/cart');
const { getCart, insertUpdateItem, removeItem } = require('../../dao/cartDao');

/******************************************************
  Cart's cartController:
    This controller provides de apis for retrieving,
    creating and updating a shopping cart.
******************************************************/
const cartController = {
  get (req, res) {
    // this method searches if the user has a cart and returns it. If not, then creates one
    const getFullCart = req.params.getFullCart;
    getCart(getFullCart, (error, fullCart) => {
      if (error) res.status(500).json({ message: error });
      res.json(fullCart);
    });
  },

  createUpdateItem (req, res) {
    // this methods creates or updates a cart by adding a new item or changing its amount
    const cartId = req.params.id;
    const productId = req.body.productId;
    const productAmount = req.body.amount;
    let responseSent = false;
    insertUpdateItem(cartId, productId, productAmount, (error, fullCart) => {
      if (error) {
        res.status(500).json({ message: error });
      }
      res.json(fullCart);
    });
  },

  removeItem (req, res) {
    // this method removes an item from thee cart
    const cartId = req.body.cartId;
    const productId = req.body.productId;
    const getFullCart = req.body.getFullCart;
    removeItem(cartId, productId, getFullCart, (error, fullCart) => {
      if (error) {
        res.status(500).json({ message: error });
      }
      res.json(fullCart);
    });
  },
};

module.exports = { cartController };
