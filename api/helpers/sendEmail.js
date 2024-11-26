const nodemailer = require('nodemailer');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
    configUser
};
async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    const transporter = nodemailer.createTransport(config.smtpOptions);
    return await transporter.sendMail({ from, to, subject, html });

}


async function configUser(user) {
    let { email, mailPassword, mailService, mailHost, mailPort } = user
    console.log({ email, mailPassword, mailService, mailHost, mailPort })
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: mailService,
        host: mailHost,
        port: mailPort,
        secure: false,
        auth: {
            user: email,
            pass: mailPassword,
        },
    });
    return transporter
}