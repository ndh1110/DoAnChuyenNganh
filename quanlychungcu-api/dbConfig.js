// dbConfig.js
require('dotenv').config();
const mssql = require('mssql');

// Cấu hình kết nối
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: true, // Bắt buộc nếu dùng Azure
        trustServerCertificate: true // Rất quan trọng cho kết nối local dev (SQL Server 2022)
    }
};

// Tạo một Connection Pool
const pool = new mssql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
    console.error('Lỗi Connection Pool SQL:', err);
});

module.exports = {
    pool,
    poolConnect // Xuất promise để server chờ kết nối
};