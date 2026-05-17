const nodemailer = require('nodemailer');

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return; // Don't crash if credentials aren't set up yet
  }

  try {
    await transporter.sendMail({
      from: `"AtomQuest Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

const sendGoalSubmissionEmail = async (managerEmail, employeeName) => {
  const subject = `Action Required: New Goal Sheet from ${employeeName}`;
  const html = `
    <h2>Goal Sheet Submitted</h2>
    <p><strong>${employeeName}</strong> has submitted their goals for your review.</p>
    <p>Please log in to the AtomQuest Portal to approve or return the goals for rework.</p>
  `;
  await sendEmail(managerEmail, subject, html);
};

const sendApprovalEmail = async (employeeEmail) => {
  const subject = `Goal Sheet Approved`;
  const html = `
    <h2>Goals Approved!</h2>
    <p>Your manager has approved your goal sheet.</p>
    <p>Your goals are now locked. You can start working towards them and update your progress during check-ins.</p>
  `;
  await sendEmail(employeeEmail, subject, html);
};

const sendReworkEmail = async (employeeEmail) => {
  const subject = `Goal Sheet Returned for Rework`;
  const html = `
    <h2>Action Required: Update Goals</h2>
    <p>Your manager has returned your goal sheet for rework.</p>
    <p>Please log in to the AtomQuest Portal to make the necessary adjustments and resubmit.</p>
  `;
  await sendEmail(employeeEmail, subject, html);
};

module.exports = {
  sendGoalSubmissionEmail,
  sendApprovalEmail,
  sendReworkEmail,
};
