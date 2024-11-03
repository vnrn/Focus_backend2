import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL as string,
    pass: process.env.EMAIL_PASS as string
  }
});

/**
 * Sends an email to the provided list of emails with the given subject and HTML
 *
 * @param {string[]} emails The list of email addresses to send the email to
 * @param {string} subject The subject of the email
 * @param {string} html The HTML of the email
 * @returns {Promise<{status: number, message: string}>} An object with a status and message
 */

export default async function sendEmail(
  emails: string[],
  subject: string,
  html: string
) {
  try {
    const options = {
      from: `"${process.env.APP_NAME as string}" ${
        process.env.EMAIL as string
      }`,
      to: emails,
      subject: subject,
      html: html
    };
    await transporter.sendMail(options);
    return {
      status: 200,
      message: "Email sent successfully"
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: "Error sending email"
    };
  }
}
