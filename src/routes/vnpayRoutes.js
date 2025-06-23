/**
 * VNPay Routes - Unified VNPay integration
 * Thay thế cho src/route_vnpay/order.js và src/api/vnpayRoutes.js
 */

import express from 'express';
import moment from 'moment';
import querystring from 'qs';
import crypto from 'crypto';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config
const configPath = path.join(__dirname, '../config/default.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const router = express.Router();

// Hàm sắp xếp object
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
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
 * POST /api/vnpay/create_payment_url
 * POST /order/create_payment_url (legacy)
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
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  // Kiểm tra nếu request từ frontend (AJAX) thì trả về JSON
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    res.json({
      success: true,
      paymentUrl: vnpUrl,
      orderId: orderId
    });
  } else {
    // Nếu là form submit thì redirect trực tiếp
    res.redirect(vnpUrl);
  }
});

/**
 * Xử lý kết quả trả về từ VNPay
 * GET /api/vnpay/vnpay_return
 * GET /order/vnpay_return (legacy)
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
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

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

  // Kiểm tra nếu request từ API thì trả về JSON
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    res.json(paymentStatus);
  } else {
    // Nếu là browser redirect thì redirect về trang xử lý kết quả VNPay
    // Để trang VNPayReturn.jsx xử lý việc tạo đơn hàng và xóa giỏ hàng
    const frontendUrl = `http://localhost:5173/checkout/vnpay-return?${req.url.split('?')[1]}`;
    res.redirect(frontendUrl);
  }
});

/**
 * API để verify signature VNPay từ frontend
 * POST /api/vnpay/verify_payment
 */
router.post('/verify_payment', function (req, res, next) {
  try {
    let vnp_Params = { ...req.body };
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = config.vnp_HashSecret;
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    let paymentStatus = {
      success: false,
      code: vnp_Params['vnp_ResponseCode'],
      message: 'Giao dịch thất bại',
      orderId: vnp_Params['vnp_TxnRef'],
      amount: vnp_Params['vnp_Amount'],
      transactionNo: vnp_Params['vnp_TransactionNo'],
      bankCode: vnp_Params['vnp_BankCode'],
      payDate: vnp_Params['vnp_PayDate'],
      signatureValid: false
    };

    if (secureHash === signed) {
      paymentStatus.signatureValid = true;
      if (vnp_Params['vnp_ResponseCode'] === '00') {
        paymentStatus.success = true;
        paymentStatus.message = 'Giao dịch thành công';
      }
    } else {
      paymentStatus.code = '97';
      paymentStatus.message = 'Chữ ký không hợp lệ';
    }

    res.json(paymentStatus);
  } catch (error) {
    console.error('Error verifying VNPay payment:', error);
    res.status(500).json({
      success: false,
      code: 'ERROR',
      message: 'Lỗi hệ thống khi xác thực thanh toán'
    });
  }
});

/**
 * IPN (Instant Payment Notification) từ VNPay
 * GET /api/vnpay/vnpay_ipn
 * GET /order/vnpay_ipn (legacy)
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
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

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
 * POST /api/vnpay/querydr
 * POST /order/querydr (legacy)
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
  let vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest("hex");
  
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

/**
 * Hoàn tiền giao dịch
 * POST /api/vnpay/refund
 * POST /order/refund (legacy)
 */
router.post('/refund', function (req, res, next) {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  let date = new Date();

  let vnp_TmnCode = config.vnp_TmnCode;
  let secretKey = config.vnp_HashSecret;
  let vnp_Api = config.vnp_Api;
  
  let vnp_TxnRef = req.body.orderId;
  let vnp_TransactionDate = req.body.transDate;
  let vnp_Amount = req.body.amount * 100;
  let vnp_TransactionType = req.body.transType;
  let vnp_CreateBy = req.body.user;
          
  let currCode = 'VND';
  
  let vnp_RequestId = moment(date).format('HHmmss');
  let vnp_Version = '2.1.0';
  let vnp_Command = 'refund';
  let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;
          
  let vnp_IpAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
  let vnp_TransactionNo = '0';
  
  let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_TransactionNo + "|" + vnp_TransactionDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
  let hmac = crypto.createHmac("sha512", secretKey);
  let vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest("hex");
  
  let dataObj = {
    'vnp_RequestId': vnp_RequestId,
    'vnp_Version': vnp_Version,
    'vnp_Command': vnp_Command,
    'vnp_TmnCode': vnp_TmnCode,
    'vnp_TransactionType': vnp_TransactionType,
    'vnp_TxnRef': vnp_TxnRef,
    'vnp_Amount': vnp_Amount,
    'vnp_TransactionNo': vnp_TransactionNo,
    'vnp_CreateBy': vnp_CreateBy,
    'vnp_OrderInfo': vnp_OrderInfo,
    'vnp_TransactionDate': vnp_TransactionDate,
    'vnp_CreateDate': vnp_CreateDate,
    'vnp_IpAddr': vnp_IpAddr,
    'vnp_SecureHash': vnp_SecureHash
  };
  
  // TODO: Implement actual API call to VNPay
  res.json({
    success: true,
    message: 'Refund request sent',
    data: dataObj
  });
});

// Demo pages (legacy support)
router.get('/', function(req, res, next){
  res.render('orderlist', { title: 'Danh sách đơn hàng' })
});

router.get('/create_payment_url', function (req, res, next) {
  res.render('order', {title: 'Tạo mới đơn hàng', amount: 10000})
});

router.get('/querydr', function (req, res, next) {
  res.render('querydr', {title: 'Truy vấn kết quả thanh toán'})
});

router.get('/refund', function (req, res, next) {
  res.render('refund', {title: 'Hoàn tiền giao dịch thanh toán'})
});

export default router;
