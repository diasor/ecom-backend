const path = require('path');
const IncomingForm = require('formidable');
const { isEmpty, each } = require('lodash');
const { Product } = require('../../models/product');
const { Manufacturer } = require('../../models/manufacturer');
const { getAll, productById, deleteImage, getImagePath } = require('../../dao/productDao');

/******************************************************
  Product's cartController:
    This controller provides de apis for retrieving,
    creating and updating a shopping cart.
******************************************************/
const productController = {
  all (req, res) {
    // returns all products
    getAll((error, products) => {
      if (error) return res.status(500).json({ message: error });
      return res.json(products);
    });
  },

  byId (req, res) {
    const productId = req.params.id;
    if (req.params.id === 'undefined') {
      return res.status(400).json({ message: 'The product Id can not be empty.' });
    }
    // returns a single product based on the passed in ID parameter
    productById(productId, (error, productDocument) => {
      if (error) return res.status(500).json({ message: error });
      return res.json(productDocument);
    });
  },

  createUpdate (req, res) {
    // Creates a new record from a submitted form
    let form = new IncomingForm();
    let newFileName = '';
    let idParam = '';
    // managing the file (if there is one)
    form.on('fileBegin', (name, file) => {
      newFileName = file.name;
      file.path = path.join(getImagePath(), newFileName);
    });
    form.parse(req, (err, fields, files) => {
      idParam = fields.id;
      let isNewProduct = isEmpty(idParam);
      let oldImageName = '';
      let product = new Product();
      // creating the new product to be saved in the database
      if (!isNewProduct) {
        product._id = idParam;
      }
      product.name = fields.name;
      product.price = fields.price;
      product.description = fields.description;
      product.imageName = newFileName;
      product.manufacturer = fields.manufacturer;

      if (isNewProduct) {
        // if it is a new product, we just save it
        product.save((err, saved) => res.json(saved));
      } else {
        // if the object already existed, the it must be found in the database to be updated
        Product.findById({_id: idParam}, (err, productDocument) => {
          // updates the product payload
          productDocument.name = product.name;
          productDocument.description = product.description;
          productDocument.price = product.price;
          productDocument.manufacturer = product.manufacturer;
          if (!isEmpty(newFileName)) {
            // checking whether a new image must be uploaded
            newFileName = product.imageName;
            oldImageName = productDocument.imageName;
            productDocument.imageName = product.imageName;
          }

          if (!isEmpty(newFileName)) {
            const uploadDir = getImagePath();
            const oldImagePath = `${uploadDir}${oldImageName}`;
            deleteImage(oldImagePath);
          }
          // saves the product
          productDocument.save((err, saved) => res.json(saved));
        });
      }
    });
    form.on('error', (err) => {
      console.log('error ', JSON.stringify(err));
    });
  },

  remove (req, res) {
    const idParam = req.params.id;
    // Removes a product
    Product.findById({_id: idParam}, (err, productDocument) => {
      if (err) {
        console.log('Error finding the product to remove: ', err);
      } else {
        // checking whether a new image must be uploaded
        const uploadDir = getImagePath();
        const removeImageName = `${uploadDir}${productDocument.imageName}`;
        if (!isEmpty(productDocument.imageName)) {
          deleteImage(removeImageName);
        }
      }
    })
    .then(() => Product.deleteOne({_id: idParam}, (err) => {
      return res.json("OK");
    }))
    .catch(err => console.log('Error removing a product: ', err));
  },

  findManyProducts (idCollection) {
    Product.find({_id: { $in: idCollection } },
      (error, productList) => {
        if (error) {
          return {};
        }
        return productList;
      });
  },
};
module.exports = { productController };
