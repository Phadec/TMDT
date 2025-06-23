/**
 * VNPay API Routes - Xử lý các request liên quan đến VNPay
 * Dựa trên code từ src/route_vnpay/order.js
 */

const express = require('express');
const router = express.Router();
const moment = require('moment');
const querystring = require('qs');
const crypto = require("crypto");

// Import config VNPay
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

/**
 * Tạo URL thanh toán VNPay
 */
router.post('/create_payment_url', function (req, res, next) {
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
  
  // Tạo orderId unique
  let orderId = req.body.orderId || moment(date).format('DDHHmmss');
  let amount = req.body.amount;
  let bankCode = req.body.bankCode || '';
  let orderInfo = req.body.orderInfo || `Thanh toan don hang ${orderId}`;
  
  let locale = req.body.language || 'vn';
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
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = req.body.orderType || 'other';
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

  // Trả về URL thay vì redirect
  res.json({
    success: true,
    paymentUrl: vnpUrl,
    orderId: orderId
  });
});

/**
 * Xử lý kết quả trả về từ VNPay
 */
router.get('/vnpay_return', function (req, res, next) {
  let vnp_Params = req.query;
  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  let secretKey = config.vnp_HashSecret;
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  let paymentStatus = {
    success: false,
    code: vnp_Params['vnp_ResponseCode'],
    message: 'Giao dịch thất bại',
    orderId: vnp_Params['vnp_TxnRef'],
    amount: vnp_Params['vnp_Amount'],
    transactionNo: vnp_Params['vnp_TransactionNo'],
    bankCode: vnp_Params['vnp_BankCode'],
    payDate: vnp_Params['vnp_PayDate']
  };

  if (secureHash === signed) {
    if (vnp_Params['vnp_ResponseCode'] === '00') {
      paymentStatus.success = true;
      paymentStatus.message = 'Giao dịch thành công';
      
      // TODO: Cập nhật trạng thái đơn hàng trong database
      // updateOrderStatus(vnp_Params['vnp_TxnRef'], 'PAID');
    }
  } else {
    paymentStatus.code = '97';
    paymentStatus.message = 'Chữ ký không hợp lệ';
  }

  res.json(paymentStatus);
});

/**
 * IPN (Instant Payment Notification) từ VNPay
 */
router.get('/vnpay_ipn', function (req, res, next) {
  let vnp_Params = req.query;
  let secureHash = vnp_Params['vnp_SecureHash'];
  
  let orderId = vnp_Params['vnp_TxnRef'];
  let rspCode = vnp_Params['vnp_ResponseCode'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  let secretKey = config.vnp_HashSecret;
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch
  let checkOrderId = true; // Kiểm tra orderId có tồn tại trong DB
  let checkAmount = true; // Kiểm tra số tiền

  if (secureHash === signed) {
    if (checkOrderId) {
      if (checkAmount) {
        if (paymentStatus == "0") {
          if (rspCode == "00") {
            // Thanh toán thành công
            // TODO: Cập nhật trạng thái đơn hàng trong database
            // updateOrderStatus(orderId, 'PAID');
            res.status(200).json({ RspCode: '00', Message: 'Success' });
          } else {
            // Thanh toán thất bại
            // TODO: Cập nhật trạng thái đơn hàng trong database
            // updateOrderStatus(orderId, 'FAILED');
            res.status(200).json({ RspCode: '00', Message: 'Success' });
          }
        } else {
          res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' });
        }
      } else {
        res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
      }
    } else {
      res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }
  } else {
    res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
  }
});

/**
 * Truy vấn kết quả giao dịch
 */
router.post('/querydr', function (req, res, next) {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  let date = new Date();

  let vnp_TmnCode = config.vnp_TmnCode;
  let secretKey = config.vnp_HashSecret;
  let vnp_Api = config.vnp_Api;
  
  let vnp_TxnRef = req.body.orderId;
  let vnp_TransactionDate = req.body.transDate;
  
  let vnp_RequestId = moment(date).format('HHmmss');
  let vnp_Version = '2.1.0';
  let vnp_Command = 'querydr';
  let vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;
  
  let vnp_IpAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let currCode = 'VND';
  let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
  
  let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TxnRef + "|" + vnp_TransactionDate + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
  
  let hmac = crypto.createHmac("sha512", secretKey);
  let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest("hex");
  
  let dataObj = {
    'vnp_RequestId': vnp_RequestId,
    'vnp_Version': vnp_Version,
    'vnp_Command': vnp_Command,
    'vnp_TmnCode': vnp_TmnCode,
    'vnp_TxnRef': vnp_TxnRef,
    'vnp_OrderInfo': vnp_OrderInfo,
    'vnp_TransactionDate': vnp_TransactionDate,
    'vnp_CreateDate': vnp_CreateDate,
    'vnp_IpAddr': vnp_IpAddr,
    'vnp_SecureHash': vnp_SecureHash
  };

  // TODO: Implement actual API call to VNPay
  res.json({
    success: true,
    message: 'Query request sent',
    data: dataObj
  });
});

module.exports = router;