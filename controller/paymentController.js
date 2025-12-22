// controllers/paymentController.js
const { createOrder, getPaymentStatus } = require("../services/cashfreeServices");
const Payment = require("../models/payment");
const User=require("../models/user");
const path = require("path");

exports.getPaymentPage=(req,res)=> {
    res.sendFile(path.join(__dirname,"../views/index.html"));
}

exports.processPayment = async (req, res) => {
  const orderId = "ORDER-" + Date.now();
  const orderAmount = 2000;
  const orderCurrency = "INR";
  const customerID = req.body.userId||"1";
  const customerPhone = "9999999999";

  try {
    // Create order on Cashfree and get the payment session ID
    const paymentSessionId = await createOrder(
      orderId,
      orderAmount,
      orderCurrency,
      customerID,
      customerPhone
    );

    // Save payment details in DB
    await Payment.create({
      orderId,
      paymentSessionId,
      orderAmount,
      orderCurrency,
      paymentStatus: "Pending",
      userId:customerID
    });

    res.json({ paymentSessionId, orderId });
  } catch (error) {
    console.error("Error processing payment:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updatePaymentStatus=async (req,res) => {
  const {orderId,status,userId}=req.body;

  try {
    await Payment.update({paymentStatus:status},{where:{orderId}});

    if (status==="SUCCESS") {
      await User.update({isPremiumUser:true},{where:{id:userId}});
    }

    res.json({message:"Payment status updated successfully"});
  } catch (error) {
    console.error("Error updating payment status:",error.message);
    res.status(500).json({error:error.message});
  }
}

exports.getPaymentStatus=async (req,res) => {
  const {paymentSessionId}=req.params;
  try {
    const status=await getPaymentStatus(paymentSessionId);
    res.json(status);
  } catch (error) {
    console.error("Error fetching payment status:",error.message);
    res.status(500).json({error:error.message});
  }
}

exports.paymentCallback=async (req,res)=> {
  try {
    const {order_id}=req.query;

    if (!order_id) {
      return res.send("<script>alert('Invalid callback data'); window.location.href='/';</script>");
    }

    const statusResponse=await getPaymentStatus(order_id);
    const orderStatus=statusResponse?.status||"PENDING";

    await Payment.update({paymentStatus:orderStatus},{where:{orderId:order_id}});

    const payment=await Payment.findOne({where:{orderId:order_id}});
    if (orderStatus==="SUCCESS") {
      await User.update({isPremiumUser:true},{where:{id:payment.userId}});
      return res.send("<script>alert('Transaction Successful'); window.location.href='/payment/success';</script>");
    } else if (orderStatus==="FAILED") {
      return res.send("<script>alert('TRANSACTION FAILED'); window.location.href='/payment/failed';</script>");
    } else {
      return res.send("<script>alert('Transaction Pending'); window.location.href='/payment/pending';</script>");
    }

  } catch (error) {
    console.error("Error in payment callback:",error.message);
    res.send("<script>alert('Error updating tarnsaction');</script>");    
  }
}
