// services/emailService.js
const nodemailer = require('nodemailer');

// 1. Cấu hình "Người vận chuyển" (Transporter)
// Chúng ta đăng nhập vào Gmail bằng thông tin trong .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng 16 ký tự
    },
});

/**
 * Hàm gửi email chung
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} htmlBody - Nội dung email (dạng HTML)
 */
const sendEmail = async (to, subject, htmlBody) => {
    try {
        const mailOptions = {
            from: `"Hệ thống Quản lý Chung cư" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlBody,
        };

        // Gửi email
        let info = await transporter.sendMail(mailOptions);
        console.log('Email đã gửi thành công: ' + info.messageId);
        return true;

    } catch (error) {
        console.error('Lỗi khi gửi email (emailService.js):', error);
        // Ném lỗi ra ngoài để controller biết và xử lý
        throw new Error('Không thể gửi email. Lỗi SMTP.'); 
    }
};

/**
 * Gửi email reset mật khẩu
 * @param {string} userEmail - Email của người quên mật khẩu
 * @param {string} resetToken - Token reset (chỉ có hạn 15p)
 */
const sendPasswordResetEmail = async (userEmail, resetToken) => {
    // URL của trang Frontend (Cổng 5173)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const subject = 'Yêu cầu Đặt lại Mật khẩu (Quản lý Chung cư)';
    
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Chào bạn,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Vui lòng nhấp vào nút dưới đây để đặt lại mật khẩu của bạn. Link này sẽ <strong>hết hạn sau 15 phút</strong>:</p>
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Đặt lại Mật khẩu
            </a>
            <p style="margin-top: 20px;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,<br>Ban Quản lý Chung cư</p>
        </div>
    `;

    return await sendEmail(userEmail, subject, htmlBody);
};

// Export các hàm bạn muốn dùng bên ngoài
module.exports = {
    sendPasswordResetEmail
    // (Sau này bạn có thể thêm sendInvoiceEmail, sendNotificationEmail...)
};