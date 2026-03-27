/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { PaymentStatus, PurchaseType } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { generateInvoicePdf } from "./payment.utils";
import status from "http-status";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { sendEmail } from "../../utils/email";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  // ✅ Prevent duplicate processing (idempotency)
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingPayment) {
    console.log(`Event ${event.id} already processed`);
    return { message: "Already processed", data: existingPayment };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      const purchaseId = session.metadata?.purchaseId;
      const paymentId = session.metadata?.paymentId;

      if (!purchaseId || !paymentId) {
        throw new AppError(status.BAD_REQUEST, "Missing purchase or payment metadata");
      }

      // 🔍 Get purchase + relations
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: {
          user: true,
          media: true,
          payment: true,
        },
      });

      if (!purchase) {
        throw new AppError(status.NOT_FOUND, "Purchase not found");
      }

      if (!purchase.payment) {
        throw new AppError(status.NOT_FOUND, "Payment not found");
      }

      let invoiceUrl: string | null = null;

      // 📄 Generate invoice PDF and upload to Cloudinary
      if (session.payment_status === "paid") {
        try {
          // 1️⃣ Generate PDF buffer
          const pdfBuffer = await generateInvoicePdf({
            invoiceId: paymentId,
            userName: purchase.user.name,
            userEmail: purchase.user.email,
            mediaTitle: purchase.media?.title || "Media",
            amount: purchase.price,
            transactionId: purchase.payment.transactionId || "",
            paymentDate: new Date().toISOString(),
          });

          // 2️⃣ Upload to Cloudinary
          const cloudinaryResponse = await uploadFileToCloudinary(
            pdfBuffer,
            `invoice-${paymentId}.pdf`
          );

          invoiceUrl = cloudinaryResponse.secure_url;
          console.log("✅ Invoice uploaded to Cloudinary:", invoiceUrl);
        } catch (err) {
          console.error("❌ Invoice generation/upload error:", err);
          // Don't throw, continue with payment processing
          // Invoice URL will be null if upload fails
        }
      }

      // 💳 Update in transaction
      const result = await prisma.$transaction(async (tx) => {
        // ✅ Update purchase (important for access)
        const updatedPurchase = await tx.purchase.update({
          where: { id: purchaseId },
          data: {
            // RENT expiry logic
            expiresAt:
              purchase.type === PurchaseType.RENT
                ? new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h
                : null,
          },
        });

        // 💳 Update payment
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status:
              session.payment_status === "paid"
                ? PaymentStatus.SUCCESS
                : PaymentStatus.FAILED,
            paymentGatewayData: session,
            stripeEventId: event.id,
            invoiceUrl,
          },
        });

        return { updatedPurchase, updatedPayment };
      });

      console.log("✅ Payment success for purchase:", purchaseId);

      // 📧 Send invoice email outside transaction (non-blocking)
      if (session.payment_status === "paid") {
        try {
          await sendEmail({
            to: purchase.user.email,
            subject: `Invoice for ${purchase.media?.title || "Media"} Purchase`,
            templateName: "invoice",
            templateData: {
              userName: purchase.user.name,
              userEmail: purchase.user.email,
              invoiceId: paymentId,
              mediaTitle: purchase.media?.title || "Media",
              transactionId: purchase.payment.transactionId || "",
              paymentDate: new Date().toISOString(),
              amount: purchase.price,
            },
            attachments: invoiceUrl
              ? [
                  {
                    filename: `invoice-${paymentId}.pdf`,
                    content: await generateInvoicePdf({
                      invoiceId: paymentId,
                      userName: purchase.user.name,
                      userEmail: purchase.user.email,
                      mediaTitle: purchase.media?.title || "Media",
                      amount: purchase.price,
                      transactionId: purchase.payment.transactionId || "",
                      paymentDate: new Date().toISOString(),
                    }),
                    contentType: "application/pdf",
                  },
                ]
              : undefined,
          });
          console.log("✅ Invoice email sent to:", purchase.user.email);
        } catch (err) {
          console.error("❌ Email sending error:", err);
          // Non-blocking: don't let email failure affect payment processing
        }
      }

      return result;
    }

    case "checkout.session.expired": {
      console.log("Checkout session expired");
      return { message: "Checkout session expired" };
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as any;
      console.log("Payment failed for intent:", paymentIntent.id);
      
      // Update payment status to FAILED if needed
      try {
        const payment = await prisma.payment.findUnique({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.FAILED,
              stripeEventId: event.id,
            },
          });
        }
      } catch (err) {
        console.error("Error updating failed payment:", err);
      }

      return { message: "Payment failed processed" };
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
      return { message: `Unhandled event type: ${event.type}` };
  }
};

export const PaymentService = {
  handleStripeWebhookEvent,
};