import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "JaneChucks Mixed Spices <onboarding@resend.dev>" // Change this to your verified domain

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Reset Your Password - JaneChucks Mixed Spices",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">JaneChucks Mixed Spices</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
              <p style="color: #4b5563; font-size: 16px;">Hi ${name},</p>
              <p style="color: #4b5563; font-size: 16px;">We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Reset Password</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
              <p style="color: #6b7280; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">JaneChucks Mixed Spices - Premium Nigerian Spice Blends</p>
            </div>
          </body>
        </html>
      `,
    })
    console.log(`Password reset email sent to ${to}`)
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Welcome to JaneChucks Mixed Spices!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to JaneChucks!</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Thank You for Joining Us!</h2>
              <p style="color: #4b5563; font-size: 16px;">Hi ${name},</p>
              <p style="color: #4b5563; font-size: 16px;">Welcome to JaneChucks Mixed Spices! We're thrilled to have you as part of our community.</p>
              <p style="color: #4b5563; font-size: 16px;">Explore our premium Nigerian spice blends crafted to perfection:</p>
              <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                <li><strong>Multi-Purpose Spice</strong> - Perfect for all your cooking needs</li>
                <li><strong>For Women</strong> - Specially crafted blend</li>
                <li><strong>For Men</strong> - Bold and flavorful</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Shop Now</a>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">JaneChucks Mixed Spices - Premium Nigerian Spice Blends</p>
            </div>
          </body>
        </html>
      `,
    })
    console.log(`Welcome email sent to ${to}`)
  } catch (error) {
    console.error("Error sending welcome email:", error)
    // Don't throw error for welcome email - it's not critical
  }
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string,
  orderTotal: number,
  items: Array<{ name: string; quantity: number; price: number }>,
) {
  try {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₦${item.price.toLocaleString()}</td>
        </tr>
      `,
      )
      .join("")

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order Confirmation #${orderNumber} - JaneChucks Mixed Spices`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Thank You for Your Order!</h2>
              <p style="color: #4b5563; font-size: 16px;">Hi ${name},</p>
              <p style="color: #4b5563; font-size: 16px;">Your order has been confirmed and is being processed.</p>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Order Number</p>
                <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0;">#${orderNumber}</p>
              </div>
              <h3 style="color: #1f2937; margin-top: 30px;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-weight: 600; color: #ea580c;">₦${orderTotal.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Track Your Order</a>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">JaneChucks Mixed Spices - Premium Nigerian Spice Blends</p>
            </div>
          </body>
        </html>
      `,
    })
    console.log(`Order confirmation email sent to ${to}`)
  } catch (error) {
    console.error("Error sending order confirmation email:", error)
    // Don't throw error - order is already placed
  }
}
