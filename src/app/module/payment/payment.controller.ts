 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { PaymentService } from "./payment.service";

const handleStripeWebhookEvent = async (req : Request, res : Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = envVars.STRIPE.WEBHOOK_SECRET;

    // ✅ Always log webhook received
    console.log("🔔 Webhook received:", {
        signature: signature ? "present" : "missing",
        webhookSecret: webhookSecret ? "present" : "missing",
    });

    if(!signature || !webhookSecret){
        console.error("❌ Missing Stripe signature or webhook secret");
        // Return 200 to prevent Stripe from retrying, but log the error
        return res.status(status.BAD_REQUEST).json({message : "Missing signature or secret"});
    }

    let event;

    try {
        // req.body should be a Buffer when using express.raw()
        const body = typeof req.body === 'string' ? req.body : Buffer.from(req.body).toString('utf8');
        console.log("📦 Raw body type:", typeof req.body);
        
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log("✅ Event constructed:", event.type, event.id);
    } catch (error : any) {
        console.error("❌ Webhook signature verification failed:", {
            error: error.message,
            signature: signature ? "provided" : "missing",
        });
        // Return 400 so Stripe retries (useful for debugging)
        return res.status(status.BAD_REQUEST).json({
            error: "Webhook Error",
            message: error.message
        });
    }

    try {
        console.log("📥 Processing event:", event.type);
        await PaymentService.handleStripeWebhookEvent(event);
        console.log("✅ Event processed successfully:", event.type);

        // ✅ Always return 200 OK to acknowledge receipt
        res.status(status.OK).json({
            received: true,
            message: "Event processed",
            event_type: event.type
        });
    } catch (error: any) {
        console.error("❌ Error handling Stripe webhook event:", {
            type: event.type,
            id: event.id,
            error: error.message,
            stack: error.stack
        });
        
        // ✅ Return 200 OK even on error (Stripe expects this)
        // The error is logged, Stripe won't retry
        res.status(status.OK).json({
            received: true,
            message: "Event received but processing failed",
            event_type: event.type,
            error: error.message
        });
    }
};

export const PaymentController = {
    handleStripeWebhookEvent
}