import PDFDocument from "pdfkit";

interface InvoiceData {
  invoiceId: string;
  userName: string;
  userEmail: string;
  mediaTitle: string;
  amount: number;
  transactionId: string;
  paymentDate: string;
}

export const generateInvoicePdf = async (
  data: InvoiceData
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
          const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
            });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on('error', (error) => {
                reject(error);
            });

    // 🎬 Header
    doc.fontSize(20).text("MEDIA STREAMING INVOICE", { align: "center" });

    doc.moveDown();

    doc.text(`Invoice ID: ${data.invoiceId}`);
    doc.text(`User: ${data.userName}`);
    doc.text(`Email: ${data.userEmail}`);
    doc.text(`Media: ${data.mediaTitle}`);
    doc.text(`Transaction ID: ${data.transactionId}`);
    doc.text(`Date: ${new Date(data.paymentDate).toLocaleDateString()}`);

    doc.moveDown();

    doc.fontSize(14).text(`Amount Paid: $${data.amount}`);

    doc.moveDown();
    doc.text("Thank you for your purchase 🎬");

    doc.end();
    } catch (error) {
      reject(error);
    }
  })
};