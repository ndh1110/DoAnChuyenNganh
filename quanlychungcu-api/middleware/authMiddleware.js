// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. HÀM PROTECT (Giữ nguyên)
// Hàm này kiểm tra Token có hợp lệ không và gắn req.user
const protect = (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Lấy thông tin (bao gồm cả 'role') từ token
            req.user = decoded; 
            
            next(); // Đi tiếp
        } catch (error) {
            console.error(error);
            res.status(401).send('Xác thực thất bại, token không hợp lệ');
        }
    }

    if (!token) {
        res.status(401).send('Xác thực thất bại, không tìm thấy token');
    }
};

// =============================================
// ⭐ HÀM MỚI: AUTHORIZE (Kiểm tra vai trò)
// =============================================
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user được gán từ hàm 'protect'
    // allowedRoles là một mảng, ví dụ: ['Admin', 'Quản lý']
    
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      // Nếu vai trò của người dùng không nằm trong danh sách được phép
      return res.status(403).send('Forbidden: Bạn không có quyền truy cập chức năng này');
    }
    
    // Nếu vai trò hợp lệ, cho đi tiếp
    next(); 
  };
};

module.exports = { protect, authorize }; // 👈 Cập nhật export