/**
 * Simple Express server để xử lý VNPay
 */

const express = require('express');
const cors = require('cors');
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');

const app = express();
const PORT = 8888;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// VNPay Config
const config = {
  vnp_TmnCode: "I4DYIEAK",
  vnp_HashSecret: "5ODNWM2N44JBXXG7K4O6WMWTSRONED8I",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: "http://localhost:3000/checkout/vnpay-return"
};

// Hàm sắp xếp object
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// Route tạo URL thanh toán VNPay
app.post('/order/create_payment_url', function (req, res, next) {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  
  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss');
  
  let ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = config.vnp_TmnCode;
  let secretKey = config.vnp_HashSecret;
  let vnpUrl = config.vnp_Url;
  let returnUrl = config.vnp_ReturnUrl;
  
  let orderId = req.body.orderId || moment(date).format('DDHHmmss');
  let amount = req.body.amount;
  let bankCode = req.body.bankCode;
  
  let locale = req.body.language;
  if (locale === null || locale === '') {
    locale = 'vn';
  }
  let currCode = 'VND';
  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = req.body.orderInfo || 'Thanh toan cho ma GD:' + orderId;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  res.redirect(vnpUrl);
});

// Route xử lý return từ VNPay
app.get('/order/vnpay_return', function (req, res, next) {
  let vnp_Params = req.query;

  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  let secretKey = config.vnp_HashSecret;

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  if (secureHash === signed) {
    // Chuyển hướng về frontend với query parameters
    const frontendUrl = `http://localhost:3000/checkout/vnpay-return?${querystring.stringify(req.query)}`;
    res.redirect(frontendUrl);
  } else {
    res.render('success', { code: '97' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`VNPay server is running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});

module.exports = app;