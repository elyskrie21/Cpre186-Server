const Product = require("../models/product");
const User = require("../models/user");
const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");
const { response } = require("../app");
require('dotenv').config()


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
              currentPrice = parseFloat(currentPrice, 10);

            User.findById(product.user, (err, user) => {
              if (currentPrice < parseFloat(product.productPrice)) {
                sendMail(user.username, user.email, product.productName, product.productPrice, currentPrice, product.url); 
              }
            });
          });
        } else if (product.url.toLowerCase().includes("ebay")) {
          axios.get(product.url).then(({ data }) => {
            const $ = cheerio.load(data);
            let id = $("#prcIsum") == null ? "#mm-saleDscPrc" : "#prcIsum";
            let currentPrice = $(id).text().replace("US $", "");
            currentPrice = parseFloat(currentPrice, 10);

            User.findById(product.user, (err, user) => {
              if (currentPrice < parseFloat(product.productPrice)) {
                sendMail(user.username, user.email, product.productName, product.productPrice, currentPrice, product.url, product.img); 
              }

            });
         
          });
        }
      });
    }
  });
}

async function sendMail(userName, userEmail, product, oldPrice, currentPrice, url, image) {
  // create reusable transporter object using the default SMTP transport
  console.log("Login: " + process.env.EMAIL + " " + process.env.PASSWORD); 
  let transporter = nodemailer.createTransport({
    host: "smtp.ionos.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL, 
      pass: process.env.PASSWORD
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"MoonDeal" alert.moondeal@mymoondeal.com', // sender address
    to: userEmail, // list of receivers
    subject: "Product is on sale!", // Subject line
    text: `Hello ${userName}! You're product ${product} is currently on sale! The old price was ${oldPrice} but it is now at ${currentPrice}!`,
    html: `<html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="x-apple-disable-message-reformatting" />
      <title></title>
      <style>
        html,
        body {
          margin: 0 auto !important;
          padding: 0 !important;
          height: 100% !important;
          width: 100% !important;
          background: #f1f1f1;
        }
        * {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
        div[style*="margin: 16px 0"] {
          margin: 0 !important;
        }
        table,
        td {
          mso-table-lspace: 0pt !important;
          mso-table-rspace: 0pt !important;
        }
        table {
          border-spacing: 0 !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
          margin: 0 auto !important;
        }
  
  
        img {
          -ms-interpolation-mode: bicubic;
        }
  
        a {
          text-decoration: none;
        }
  
        *[x-apple-data-detectors],  /* iOS */
          .unstyle-auto-detected-links *,
          .aBn {
          border-bottom: 0 !important;
          cursor: default !important;
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }
        .a6S {
          display: none !important;
          opacity: 0.01 !important;
        }
  
        .im {
          color: inherit !important;
        }
  
        img.g-img + div {
          display: none !important;
        }
  
   
        @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
          u ~ div .email-container {
            min-width: 320px !important;
          }
        }
        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
          u ~ div .email-container {
            min-width: 375px !important;
          }
        }
        @media only screen and (min-device-width: 414px) {
          u ~ div .email-container {
            min-width: 414px !important;
          }
        }
      </style>
  
      <style>
        .primary {
          background: #17bebb;
        }
        .bg_white {
          background: #ffffff;
        }
        .bg_light {
          background: #f7fafa;
        }
        .bg_black {
          background: #000000;
        }
        .bg_dark {
          background: rgba(0, 0, 0, 0.8);
        }
        .email-section {
          padding: 2.5em;
        }
  
        .btn {
          padding: 10px 15px;
          display: inline-block;
        }
        .btn.btn-primary {
          border-radius: 5px;
          background: #17bebb;
          color: #ffffff;
        }
        .btn.btn-white {
          border-radius: 5px;
          background: #ffffff;
          color: #000000;
        }
        .btn.btn-white-outline {
          border-radius: 5px;
          background: transparent;
          border: 1px solid #fff;
          color: #fff;
        }
        .btn.btn-black-outline {
          border-radius: 0px;
          background: transparent;
          border: 2px solid #000;
          color: #000;
          font-weight: 700;
        }
        .btn-custom {
          color: rgba(0, 0, 0, 0.3);
          text-decoration: underline;
        }
  
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-family: "Work Sans", sans-serif;
          color: #000000;
          margin-top: 0;
          font-weight: 400;
        }
  
        body {
          font-family: "Work Sans", sans-serif;
          font-weight: 400;
          font-size: 15px;
          line-height: 1.8;
          color: rgba(0, 0, 0, 0.4);
        }
  
        a {
          color: #17bebb;
        }
  
        .logo h1 {
          margin: 0;
        }
        .logo h1 a {
          color: #17bebb;
          font-size: 24px;
          font-weight: 700;
          font-family: "Work Sans", sans-serif;
        }
  
        .hero {
          position: relative;
          z-index: 0;
        }
  
        .hero .text {
          color: rgba(0, 0, 0, 0.3);
        }
        .hero .text h2 {
          color: #000;
          font-size: 34px;
          margin-bottom: 15px;
          font-weight: 300;
          line-height: 1.2;
        }
        .hero .text h3 {
          font-size: 24px;
          font-weight: 200;
        }
        .hero .text h2 span {
          font-weight: 600;
          color: #000;
        }
  
        .product-entry {
          display: block;
          position: relative;
          float: left;
          padding-top: 20px;
        }
        .product-entry .text {
          width: calc(100% - 125px);
          padding-left: 20px;
        }
        .product-entry .text h3 {
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .product-entry .text p {
          margin-top: 0;
        }
        .product-entry img,
        .product-entry .text {
          float: left;
        }
  
        ul.social {
          padding: 0;
        }
        ul.social li {
          display: inline-block;
          margin-right: 10px;
        }
  
        @media screen and (max-width: 500px) {
        }
      </style>
      <meta name="robots" content="noindex, follow" />
    </head>
    <body
      width="100%"
      style="
        margin: 0;
        padding: 0 !important;
        mso-line-height-rule: exactly;
        background-color: #f1f1f1;
      "
      data-new-gr-c-s-check-loaded="8.897.0"
      data-gr-ext-installed=""
    >
      <center style="width: 100%; background-color: #f1f1f1">
        <div
          style="
            display: none;
            font-size: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all;
            font-family: sans-serif;
          "
        ></div>
        <div style="max-width: 600px; margin: 0 auto" class="email-container">
          <table
            role="presentation"
            style="margin: auto"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            align="center"
          >
            <tbody>
              <tr>
                <td
                  class="bg_white"
                  style="padding: 1em 2.5em 0 2.5em"
                  valign="top"
                >
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                  >
                    <tbody>
                      <tr>
                        <td class="logo" style="text-align: left">
                          <h1><a href="#">MoonDeal</a></h1>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td
                  class="hero bg_white"
                  style="padding: 2em 0 2em 0"
                  valign="middle"
                >
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                  >
                    <tbody>
                      <tr>
                        <td style="padding: 0 2.5em; text-align: left">
                          <div class="text">
                            <h2>${userName} there is a product on sale!</h2>
                            <h3>
                              Act now before the deal is gone! 
                            </h3>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr></tr>
            </tbody>
          </table>
          <table
            class="bg_white"
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
          >
            <tbody>
              <tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.05)">
                <th
                  style="
                    text-align: left;
                    padding: 0 2.5em;
                    color: #000;
                    padding-bottom: 20px;
                  "
                  width="80%"
                >
                  Item
                </th>
                <th
                  style="
                    text-align: right;
                    padding: 0 2.5em;
                    color: #000;
                    padding-bottom: 20px;
                  "
                  width="20%"
                >
                  Price
                </th>
                <th
                style="
                  text-align: right;
                  padding: 0 2.5em;
                  color: #000;
                  padding-bottom: 20px;
                "
                width="20%"
              >
                Old Price
              </th>
              </tr>
              <tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.05)">
                <td
                  style="text-align: left; padding: 0 2.5em"
                  width="80%"
                  valign="middle"
                >
                  <div class="product-entry">
                    <img
                      src=${image}
                      alt=""
                      style="
                        width: 100px;
                        max-width: 300px;
                        height: auto;
                        margin-bottom: 20px;
                        display: block;
                      "
                    />
                    <div class="text">
                      <h3>${product}</h3>
                      <span>Small</span>
                    </div>
                  </div>
                </td>
                <td
                  style="text-align: left; padding: 0 2.5em"
                  width="20%"
                  valign="middle"
                >
                  <span class="price" style="color: #000; font-size: 20px"
                    >$${currentPrice}</span
                  >
                </td>
                <td
                style="text-align: left; padding: 0 2.5em"
                width="20%"
                valign="middle"
              >
                <span class="price" style="color: #000; font-size: 20px"
                  >$${oldPrice}</span
                >
              </td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 1em 2.5em" valign="middle">
                  <p>
                    <a href=${url} class="btn btn-primary">Buy now!</a>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
    </body>
  </html>`
  });

  console.log("Message sent: %s", info.messageId);
  console.log(info.accepted, response); 
}

module.exports = update;


