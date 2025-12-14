# 1. Image nền tảng: Sử dụng Node.js 20 nhẹ (Alpine Linux)
FROM node:20-alpine

# 2. Tạo thư mục làm việc bên trong container
WORKDIR /usr/src/app

# 3. Sao chép file package.json và package-lock.json để cài đặt dependencies
COPY package*.json ./
RUN npm install --only=production

# 4. Sao chép toàn bộ mã nguồn ứng dụng vào thư mục làm việc
COPY . .

# 5. Mở cổng mà Backend lắng nghe (thường là 3000 hoặc 8080)
# Giả sử Backend của bạn lắng nghe trên cổng 3000
EXPOSE 3000

# 6. Lệnh chạy ứng dụng khi container khởi động
CMD [ "npm", "start" ]