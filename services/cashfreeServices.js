//services/cashfreeServices.js
const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(CFEnvironment.SANDBOX, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);

exports.createOrder = async (
  orderId,
  orderAmount,
  orderCurrency="INR",
  customerID
) => {
  try {
    const expiryDate=new Date(Date.now()+60*60*1000);
    const formattedExpiryDate=expiryDate.toISOString();

    const request = {
      order_amount: orderAmount,
      order_currency: orderCurrency,
      order_id: orderId,

      customer_details: {
        customer_id: customerID,
        customer_name:"Ganesh Kumar K",
        customer_email:"kumarhcem@gmail.com",
        customer_phone: "9597559831"
      },

      order_meta: {
        return_url: "http://localhost:3000/payment/callback?order_id={order_id}",
        notify_url: "http://localhost:3000/payment/callback",
        payment_methods: "cc,dc,upi"
      },

      order_expiry_time: formattedExpiryDate,
    };

    const response = await cashfree.PGCreateOrder(request);
    const paymentSessionId = response.data.payment_session_id;

    return paymentSessionId;
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
};

exports.getPaymentStatus = async (orderId) => {
  try {
    const response = await cashfree.PGOrderFetchPayments(orderId);

    let getOrderResponse=response.data;
    let orderStatus="PENDING";

    if (getOrderResponse.some((transaction) => transaction.payment_status === "SUCCESS")) {
        orderStatus="SUCCESS";
    } else if (getOrderResponse.some((transaction) => transaction.payment_status === "FAILED")) {
        orderStatus="FAILED";
    }

    return { status: orderStatus, data: getOrderResponse };
} catch (error) {
    console.error("Error fetching payment status:", error.response.data.message);
    return {status:"FAILED",data:[]};
  }
};
