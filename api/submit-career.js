import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { full_name, email, phone, department, category, description, file_url } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    return res.status(200).json({ success: true });
  }

  const submittedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const fileLink = file_url
    ? `<a href="${file_url}" target="_blank" style="color: #1E56C7;">View Document</a>`
    : 'No file uploaded';

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #0B2D6B, #1E56C7); padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">New Career Application</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">Submitted on ${submittedAt}</p>
      </div>
      <div style="padding: 24px 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          ${row('Full Name', full_name)}
          ${row('Email', email)}
          ${row('Phone', phone)}
          ${row('Department', department || '\u2014')}
          ${row('Category', category || '\u2014')}
          ${row('Description', (description || '\u2014').replace(/\n/g, '<br>'))}
          ${row('Document', fileLink)}
        </table>
      </div>
      <div style="padding: 16px 32px; background: #F5F6F8; font-size: 12px; color: #5F6B7A; text-align: center; border-top: 1px solid #e5e7eb;">
        Marvel Slice \u2014 Career Page
      </div>
    </div>`;

  try {
    await transporter.sendMail({
      from: `"Marvel Careers" <${process.env.SMTP_EMAIL}>`,
      to: adminEmail,
      subject: `New Application from ${full_name}`,
      html,
    });
  } catch (emailError) {
    console.error('Email send failed:', emailError);
  }

  return res.status(200).json({ success: true });
}

function row(label, value) {
  return `<tr>
    <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #5F6B7A; font-size: 13px; width: 120px; vertical-align: top;">${label}</td>
    <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1B2333; font-size: 14px;">${value}</td>
  </tr>`;
}
