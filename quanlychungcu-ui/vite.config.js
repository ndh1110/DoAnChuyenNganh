import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs/dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Giữ cổng 5173
    // Cấu hình PROXY để chuyển tiếp yêu cầu API
    proxy: {
      // Bất kỳ yêu cầu nào bắt đầu bằng '/api'
      // sẽ được chuyển tiếp đến server Backend
      '/api': {
        target: 'http://localhost:5000', // Địa chỉ Backend của bạn
        changeOrigin: true, // Bắt buộc để máy chủ ảo tin tưởng
        secure: false,      // Tắt kiểm tra SSL
      }
    }
  }
})