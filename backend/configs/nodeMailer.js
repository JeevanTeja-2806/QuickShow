import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL, // e.g. nasajeevanteja2806@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // ⚠️ NOT your normal password
  },
})

const sendEmail = async ({ to, subject, body }) => {
  const response = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html: body,
  })
  return response
}

export default sendEmail
