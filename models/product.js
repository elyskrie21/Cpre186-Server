let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let productSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("Product", productSchema); 