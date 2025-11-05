import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email, name) {
  try {
    await resend.emails.send({
      from: 'JobPortal <onboarding@jobportal.com>',
      to: email,
      subject: 'Welcome to JobPortal!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining JobPortal. Start exploring amazing job opportunities today!</p>
        <a href="${process.env.NEXTAUTH_URL}/jobs">Browse Jobs</a>
      `,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}

export async function sendApplicationConfirmation(email, jobTitle, companyName) {
  try {
    await resend.emails.send({
      from: 'JobPortal <applications@jobportal.com>',
      to: email,
      subject: `Application Received - ${jobTitle}`,
      html: `
        <h2>Application Confirmation</h2>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received.</p>
        <p>You will be notified when the employer reviews your application.</p>
      `,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}

export async function sendApplicationStatusUpdate(email, jobTitle, status) {
  try {
    await resend.emails.send({
      from: 'JobPortal <applications@jobportal.com>',
      to: email,
      subject: `Application Update - ${jobTitle}`,
      html: `
        <h2>Application Status Update</h2>
        <p>Your application for <strong>${jobTitle}</strong> has been updated to: <strong>${status}</strong></p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard">View Details</a>
      `,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}

export async function sendNewApplicationAlert(email, jobTitle, applicantName) {
  try {
    await resend.emails.send({
      from: 'JobPortal <alerts@jobportal.com>',
      to: email,
      subject: `New Application - ${jobTitle}`,
      html: `
        <h2>New Application Received</h2>
        <p><strong>${applicantName}</strong> has applied for <strong>${jobTitle}</strong></p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/applications">Review Application</a>
      `,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}

export async function sendJobAlertEmail(email, jobs) {
  const jobsHtml = jobs.map(job => `
    <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
      <h3>${job.title}</h3>
      <p>${job.company.name} - ${job.location}</p>
      <p>Salary: $${job.salary.min} - $${job.salary.max}</p>
      <a href="${process.env.NEXTAUTH_URL}/jobs/${job._id}">View Job</a>
    </div>
  `).join('');

  try {
    await resend.emails.send({
      from: 'JobPortal <alerts@jobportal.com>',
      to: email,
      subject: `${jobs.length} New Job${jobs.length > 1 ? 's' : ''} Match Your Alert`,
      html: `
        <h2>New Jobs Matching Your Criteria</h2>
        ${jobsHtml}
        <p><a href="${process.env.NEXTAUTH_URL}/job-alerts">Manage Your Alerts</a></p>
      `,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}