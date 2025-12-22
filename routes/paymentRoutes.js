//routes/paymentRoutes.js
const express=require('express');
const router=express.Router();
const { getPaymentPage, processPayment, getPaymentStatus, paymentCallback } = require('../controller/paymentController');

router.get('/',getPaymentPage);
router.post('/pay',processPayment);
router.get('/payment-status/:paymentSessionId',getPaymentStatus);
router.get('/callback',paymentCallback);

module.exports=router;
