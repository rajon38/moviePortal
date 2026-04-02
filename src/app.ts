/* eslint-disable @typescript-eslint/no-explicit-any */
import express,{ Application, Request, Response } from 'express';
import { IndexRoute } from './app/routes';
import { globalErrorHandler } from './app/middleware/globalErrorHandler';
import { notFound } from './app/middleware/notFound';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import path from 'path';
import cors from 'cors';
import { envVars } from './app/config/env';
import qs from 'qs';
import { PaymentController } from './app/module/payment/payment.controller';
import { auth } from './app/lib/auth';
import cron from 'node-cron';
import { PurchaseService } from './app/module/purchase/purchase.service';

const app: Application = express();

app.set("query parser", (str: string) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent);

app.use(cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL ,"http://localhost:3000", "http://localhost:8001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use("/api/auth", toNodeHandler(auth))
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
cron.schedule("*/25 * * * *", async () => {
    try {
        await PurchaseService.cancelUnpaidPurchases();
        console.log("Cron job completed: Unpaid purchases cancelled successfully.");
    } catch (error : any) {
        console.error("Error during cron job execution:", error.message);
    }
});
// Importing routes
app.use("/api/v1", IndexRoute);
// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;