import { db } from "@/lib/db";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import QRCode from "qrcode";
export const runtime = "nodejs";

const fmtNGN = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

export async function GET(
  req: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;

    const order = await db.order.findFirst({
      where: { orderNumber },
      include: { orderItems: true, user: true },
    });
    if (!order)
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
      });

    const origin = new URL(req.url).origin;
    const orderUrl = `${origin}/order-confirmation/${order.orderNumber}`;

    // Parse shipping JSON you stored in shippingAddressLine1
    let shipName = order.user?.name || order.user?.email || "Customer";
    let shipAddress = "";
    try {
      const s =
        order.shippingAddressLine1 && JSON.parse(order.shippingAddressLine1);
      if (s) {
        shipName = s.name || shipName;
        shipAddress = [s.address, s.city, s.state, s.country]
          .filter(Boolean)
          .join(", ");
      }
    } catch {}

    // PDF + fonts
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const regularPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Inter-Regular.ttf"
    );
    const regBytes = await fs.readFile(regularPath);
    const regular = await pdfDoc.embedFont(regBytes, { subset: false });

    let bold = regular;
    try {
      const boldPath = path.join(
        process.cwd(),
        "public",
        "fonts",
        "Inter-Bold.ttf"
      );
      const boldBytes = await fs.readFile(boldPath);
      bold = await pdfDoc.embedFont(boldBytes, { subset: false });
    } catch {}

    // Page setup
    const A4: [number, number] = [595.28, 841.89];
    let page = pdfDoc.addPage(A4);
    const { width, height } = page.getSize();
    const M = 50;

    // === Background "paper" tint ===
    const PAPER = rgb(0.99, 0.985, 0.97); // soft warm off-white
    page.drawRectangle({ x: 0, y: 0, width, height, color: PAPER });

    // Helpers
    let y = height - M;
    const rightText = (
      text: string,
      xRight: number,
      yPos: number,
      size = 11,
      font = regular
    ) => {
      const w = font.widthOfTextAtSize(text, size);
      page.drawText(text, { x: xRight - w, y: yPos, size, font });
    };
    const line = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      c = rgb(0.9, 0.9, 0.9)
    ) => {
      page.drawRectangle({
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1 || 1,
        color: c,
      });
    };
    const newPage = () => {
      page.drawText("Thank you for your purchase!", {
        x: M,
        y: M - 10,
        size: 10,
        font: regular,
        color: rgb(0.45, 0.45, 0.45),
      });
      page = pdfDoc.addPage(A4);
      page.drawRectangle({ x: 0, y: 0, width, height, color: PAPER });
      y = height - M;
      drawWatermark();
    };
    const ensure = (h = 18) => {
      if (y - h < M + 60) newPage();
    };

    let sharedLogo: any = null;
    const drawWatermark = () => {
      if (!sharedLogo) return;
      const wmW = width * 0.6;
      const wmH = (sharedLogo.height / sharedLogo.width) * wmW;
      page.drawImage(sharedLogo, {
        x: (width - wmW) / 2,
        y: (height - wmH) / 2,
        width: wmW,
        height: wmH,
        opacity: 0.06,
      });
    };

    try {
      const logoCandidate = [
        path.join(
          process.cwd(),
          "public",
          "images",
          "bio-haventransparent.png"
        ),
        path.join(process.cwd(), "public", "bio-haventransparent.png"),
      ];
      for (const p of logoCandidate) {
        try {
          const bytes = await fs.readFile(p);
          sharedLogo = await pdfDoc.embedPng(bytes);
          break;
        } catch {}
      }
    } catch {}

    drawWatermark();

    const logoW = 90;
    let logoH = 0;
    if (sharedLogo) {
      logoH = (sharedLogo.height / sharedLogo.width) * logoW;
      page.drawImage(sharedLogo, {
        x: M,
        y: y - logoH + 6,
        width: logoW,
        height: logoH,
        opacity: 1,
      });
    }

    const headerX = M + logoW + 18;
    let headerCursor = y;
    page.drawText("JaneChuks Mixed Spices", {
      x: headerX,
      y: headerCursor,
      size: 16,
      font: bold,
      color: rgb(0.18, 0.18, 0.18),
    });
    headerCursor -= 18;
    page.drawText(`Date: ${new Date(order.createdAt).toLocaleString()}`, {
      x: headerX,
      y: headerCursor,
      size: 11,
      font: regular,
    });
    headerCursor -= 14;
    page.drawText(`Customer: ${shipName}`, {
      x: headerX,
      y: headerCursor,
      size: 11,
      font: regular,
    });
    headerCursor -= 14;
    page.drawText(`Order #: ${order.orderNumber}`, {
      x: headerX,
      y: headerCursor,
      size: 11,
      font: regular,
    });
    if (shipAddress) {
      headerCursor -= 14;
      page.drawText(`Ship to: ${shipAddress}`, {
        x: headerX,
        y: headerCursor,
        size: 11,
        font: regular,
      });
    }
    if (order.paymentMethod || order.paymentReference) {
      headerCursor -= 14;
      page.drawText(
        `Payment: ${order.paymentMethod || "—"}  ${
          order.paymentReference ? `(ref: ${order.paymentReference})` : ""
        }`,
        { x: headerX, y: headerCursor, size: 11, font: regular }
      );
    }

    const headerBlockHeight = y - headerCursor;
    const used = Math.max(logoH, headerBlockHeight);
    y = y - used - 16;

    const qrPng = await QRCode.toBuffer(orderUrl, { margin: 0, scale: 6 });
    const qrImg = await pdfDoc.embedPng(qrPng);
    const qrSize = 70;

    page.drawImage(qrImg, {
      x: width - M - qrSize,
      y: height - M - qrSize + 6, // top-aligned with header
      width: qrSize,
      height: qrSize,
    });

    // if ((order.paymentStatus || "").toLowerCase() === "paid") {
    //   page.drawText("PAID", {
    //     x: width - 170,
    //     y: height - 130,
    //     size: 36,
    //     font: bold, // use your bold font if available
    //     color: rgb(0.12, 0.58, 0.28), // green
    //     opacity: 0.16, // faint
    //     rotate: degrees(315),
    //   });
    // }

    // Divider
    line(M, y, width - M, y);
    y -= 16;

    // Table header
    const cols = {
      name: M + 10,
      qty: M + 330,
      price: M + 400,
      total: width - M,
    };
    page.drawRectangle({
      x: M,
      y: y - 18,
      width: width - 2 * M,
      height: 24,
      color: rgb(0.965, 0.965, 0.965),
    });
    page.drawText("Item", { x: cols.name, y, size: 11, font: bold });
    page.drawText("Qty", { x: cols.qty, y, size: 11, font: bold });
    page.drawText("Price", { x: cols.price, y, size: 11, font: bold });
    rightText("Total", cols.total, y, 11, bold);
    y -= 28;

    // Rows
    let sub = 0;
    const rowH = 18;
    for (const it of order.orderItems) {
      ensure(rowH + 8);
      const price = Number(it.productPrice || 0);
      const qty = Number(it.quantity || 1);
      const total = Number(it.totalPrice ?? price * qty);
      sub += total;

      line(M, y - 6, width - M, y - 6, rgb(0.95, 0.95, 0.95));
      const name = String(it.productName || "").slice(0, 70);
      page.drawText(name, { x: cols.name, y, size: 11, font: regular });
      page.drawText(String(qty), { x: cols.qty, y, size: 11, font: regular });
      page.drawText(fmtNGN(price), {
        x: cols.price,
        y,
        size: 11,
        font: regular,
      });
      rightText(fmtNGN(total), cols.total, y, 11, regular);
      y -= rowH;
    }

    // Summary
    const shipping = Number(order.shippingAmount || 0);
    const tax = Number(order.taxAmount || 0);
    const grand = Number(order.totalAmount ?? sub + shipping + tax);

    ensure(90);
    y -= 10;
    line(M, y, width - M, y);
    y -= 18;

    const labelX = M + 330;
    const valueRight = width - M;

    page.drawText("Subtotal", { x: labelX, y, size: 11, font: regular });
    rightText(fmtNGN(sub), valueRight, y, 11, regular);
    y -= 16;

    page.drawText("Shipping", { x: labelX, y, size: 11, font: regular });
    rightText(fmtNGN(shipping), valueRight, y, 11, regular);
    y -= 16;

    page.drawText("Tax", { x: labelX, y, size: 11, font: regular });
    rightText(fmtNGN(tax), valueRight, y, 11, regular);
    y -= 18;

    page.drawText("Total", { x: labelX, y, size: 12, font: bold });
    rightText(fmtNGN(grand), valueRight, y, 12, bold);

    // Footer
    page.drawText("Thank you for shopping with JaneChuks Spices.", {
      x: M,
      y: M - 10,
      size: 10,
      font: regular,
      color: rgb(0.45, 0.45, 0.45),
    });

    const pdfBytes = await pdfDoc.save();

    // @ts-expect-error
    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${order.orderNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
