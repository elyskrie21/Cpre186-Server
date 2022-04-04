const Product = require("../models/product");
const axios = require("axios");
const cheerio = require("cheerio");

function update() {
  Product.find({}, function (err, products) {
    if (err) {
      console.log(err);
    } else {
      products.forEach(async (product) => {
        if (product.url.toLowerCase().includes("amazon")) {
          axios.get(product.url).then(({ data }) => {
            const $ = cheerio.load(data);

            let currentPrice =
              $(
                "#corePrice_feature_div > div > span.a-price.aok-align-center > span:nth-child(2) > span.a-price-whole"
              ).text() +
              $(
                "#tp_price_block_total_price_ww > span:nth-child(2) > span.a-price-fraction"
              ).text();

            console.log(parseFloat(currentPrice, 10));
          });
        } else if (product.url.toLowerCase().includes("ebay")) {
          axios.get(product.url).then(({ data }) => {
            const $ = cheerio.load(data);
            let id = $("#prcIsum") == null ? "#mm-saleDscPrc" : "#prcIsum";
            let currentPrice = $(id).text().replace("US $", "");
            console.log(parseFloat(currentPrice, 10));
          });
        }
      });
    }
  });
}

module.exports = update;
