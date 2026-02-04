const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'digigs.noreply@gmail.com', // Hardcoded as per user request, but better in env
        pass: process.env.EMAIL_PASS // User needs to set this in .env
    }
});

exports.sendOTP = async (to, otp) => {
    try {
        const mailOptions = {
            from: '"DGS Secure Platform" <digigs.noreply@gmail.com>',
            to,
            subject: 'Your DGS Login Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #d4af37;">DGS Security Verification</h2>
                    <p>Your One-Time Password (OTP) for login/registration is:</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; color: #000;">${otp}</h1>
                    <p>This code expires in 10 minutes.</p>
                    <hr>
                    <p style="font-size: 12px; color: #777;">If you did not request this code, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Email Error:', error);
        return false;
    }
};
