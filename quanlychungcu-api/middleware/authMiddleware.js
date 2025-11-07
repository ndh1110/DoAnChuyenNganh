// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    
    // Kiểm tra xem header Authorization có tồn tại và bắt đầu bằng 'Bearer' không
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token (loại bỏ 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Gắn thông tin người dùng (user) vào request để các API sau có thể dùng
            req.user = decoded; 
            
            next(); // Cho phép đi tiếp
        } catch (error) {
            console.error(error);
            res.status(401).send('Xác thực thất bại, token không hợp lệ');
        }
    }

    if (!token) {
        res.status(401).send('Xác thực thất bại, không tìm thấy token');
    }
};

module.exports = { protect };