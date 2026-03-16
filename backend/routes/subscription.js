const express = require('express');
const router = express.Router();
const axios = require('axios');
const Stripe = require("stripe");
const User = require('../models/user')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {

  const { amount, userId, plan, planDuration } = req.body;

  console.log('pago', req.body)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "cop",
    automatic_payment_methods: { enabled: true },

    metadata: {
      userId: userId,
      plan: plan,
      planDuration: planDuration
    }
  });

  res.send({
    clientSecret: paymentIntent.client_secret
  });

});
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {

    const sig = req.headers["stripe-signature"];

    let event;

    try {

      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

    } catch (err) {

      console.log("Webhook error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);

    }

    if (event.type === "payment_intent.succeeded") {

      const paymentIntent = event.data.object;

      const userId = paymentIntent.metadata.userId;
      const plan = paymentIntent.metadata.plan;
      const planDuration = paymentIntent.metadata.planDuration;

      await User.findByIdAndUpdate(userId, {
        plan: plan,
        planDuration: planDuration,
        planTotalDuration: planDuration,
        planStartDate: new Date(),
        stripePaymentIntent: paymentIntent.id
      });

      console.log("Plan activado para usuario:", userId);
    }

    res.json({ received: true });
  }
);


module.exports = router;