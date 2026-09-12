const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send contact form email to admin
const sendContactEmail = async ({ fullName, email, phone, subject, message }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'kevineniyomurinzi@gmail.com',
    subject: `New Contact Form Message from ${fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: #1e3c72; padding: 20px; text-align: center; color: white;">
          <h2>ESSA Nyarugunga School</h2>
          <p>New Contact Form Submission</p>
        </div>
        <div style="background: white; padding: 20px;">
          <h3>Contact Details:</h3>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
          <h3>Message:</h3>
          <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #1e3c72;">${message}</p>
          <hr>
          <p style="font-size: 12px; color: #666;">This message was sent from the ESSA Nyarugunga School website contact form.</p>
        </div>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send admission application email to admin
const sendAdmissionEmail = async (application) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'kevineniyomurinzi@gmail.com',
    subject: `New Admission Application from ${application.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: #1e3c72; padding: 20px; text-align: center; color: white;">
          <h2>ESSA Nyarugunga School</h2>
          <p>New Admission Application Received</p>
        </div>
        <div style="background: white; padding: 20px;">
          <h3>Student Information:</h3>
          <p><strong>Name:</strong> ${application.fullName}</p>
          <p><strong>Email:</strong> ${application.email}</p>
          <p><strong>Phone:</strong> ${application.phone}</p>
          <p><strong>Level Applying For:</strong> ${application.level}</p>
          <p><strong>Previous School:</strong> ${application.previousSchool}</p>
          <p><strong>Last Average:</strong> ${application.lastAverage}%</p>
          <h3>Parent Information:</h3>
          <p><strong>Parent Name:</strong> ${application.parentName}</p>
          <p><strong>Parent Phone:</strong> ${application.parentPhone}</p>
          <hr>
          <p style="font-size: 12px; color: #666;">Login to the admin dashboard to view full details and update application status.</p>
        </div>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send newsletter email to subscribers
const sendNewsletterEmail = async (email, type, data = {}) => {
  if (type === 'welcome') {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to ESSA Nyarugunga Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: #1e3c72; padding: 20px; text-align: center; color: white;">
            <h2>ESSA Nyarugunga School</h2>
          </div>
          <div style="background: white; padding: 20px;">
            <h3>Welcome to Our Newsletter!</h3>
            <p>Thank you for subscribing to the ESSA Nyarugunga School newsletter. You will now receive updates about:</p>
            <ul>
              <li>Upcoming events and activities</li>
              <li>Academic achievements and announcements</li>
              <li>Important deadlines and schedules</li>
              <li>School news and updates</li>
            </ul>
            <p>We're excited to keep you informed about our school community!</p>
            <hr>
            <p style="font-size: 12px; color: #666;">You can unsubscribe at any time by clicking <a href="#">here</a>.</p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
  }
};

module.exports = { sendContactEmail, sendAdmissionEmail, sendNewsletterEmail };