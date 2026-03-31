import * as brevo from '@getbrevo/brevo';

// import nodemailer from 'nodemailer';

// // Gmail SMTP Configuration
// // const transporter = nodemailer.createTransport({
// //   service: 'gmail',
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS,
// //   },
// // });

// // Brevo SMTP Configuration
// // const transporter = nodemailer.createTransport({
// //   host: 'smtp-relay.brevo.com',
// //   port: 587,
// //   secure: false, // Use TLS
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.BREVO_API_KEY, 
// //   },
// // });

export const sendEmail = async (to, subject, html, name) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY, 
      },
      body: JSON.stringify({
        sender: {
          name: 'Ricky Chat App',
          email: process.env.EMAIL_USER,
        },
        to: [{ email: to, name: name || "User" }],
        subject: subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('✅ Email sent via direct API:', data.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};
