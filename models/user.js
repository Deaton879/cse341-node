const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
      }
    ]
    
  }
});

userSchema.methods.addToCart = function(product, quantity, price) {

  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = parseInt(quantity);
  let newPrice = (newQuantity * price).toFixed(2);
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity += this.cart.items[cartProductIndex].quantity;
    newPrice = (newQuantity * price).toFixed(2);
    updatedCartItems[cartProductIndex].quantity = newQuantity;
    updatedCartItems[cartProductIndex].price = newPrice;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
      price: price,
      total: newPrice
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.removeFromCart = function(productId, quantity, price) {

  let updatedCartItems;
  let newQuantity = parseInt(quantity);

  const productIndex = this.cart.items.findIndex(item =>{
    return item.productId.toString() === productId.toString();
  });

  if (parseInt(quantity) === 0) {
    updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
  } 
  else {
    updatedCartItems = [...this.cart.items];
    updatedCartItems[productIndex].quantity = newQuantity;
    updatedCartItems[productIndex].total = (newQuantity * price).toFixed(2);
  }

  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);