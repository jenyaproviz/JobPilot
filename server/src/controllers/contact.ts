import nodemailer from 'nodemailer';
import { Request, Response } from 'express';

export const sendContactEmail = async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Create transporter using Gmail service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'jenka.katz@gmail.com', // Your email
        pass: process.env.EMAIL_PASS, // Your app password
      },
    });

    // Email content
    const mailOptions = {
      from: email, // sender's email
      to: process.env.EMAIL_USER || 'jenka.katz@gmail.com', // your email to receive messages
      subject: `JobPilot Contact Form - Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">JobPilot Contact Form</h1>
          </div>
          <div style="padding: 20px; background-color: #f8fafc;">
            <h2 style="color: #1e40af;">New Contact Message</h2>
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>
            <div style="background-color: white; padding: 15px; border-radius: 8px;">
              <p><strong>Message:</strong></p>
              <p style="line-height: 1.6;">${message}</p>
            </div>
          </div>
          <div style="background-color: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            This message was sent through the JobPilot contact form.
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log(`Contact email sent from ${name} (${email})`);
    res.json({ message: 'Message sent successfully! We\'ll get back to you soon.' });
    
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ 
      message: 'Failed to send message. Please try again or contact us directly at jenka.katz@gmail.com' 
    });
  }
};

// Export is already handled by the named export above