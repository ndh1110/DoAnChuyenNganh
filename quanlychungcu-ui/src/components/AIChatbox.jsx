// src/components/AIChatbox.jsx (PHIÊN BẢN CUỐI CÙNG: PHÂN QUYỀN TRUY VẤN CHÍNH XÁC)

import React, { useState, useMemo } from 'react'; 
import api from '../services/api'; 
import toast, { Toaster } from 'react-hot-toast'; 

// Nhận prop 'userRole' (Ví dụ: 'Quản lý', 'Nhân viên', 'Resident', 'Khách')
const AIChatbox = ({ onClose, userRole }) => { 
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // ⭐ ĐỊNH NGHĨA VÀ PHÂN QUYỀN CHÍNH XÁC THEO BẢNG VAI TRÒ ⭐
    const allFixedQueries = [
        // ------------------ TRUY VẤN CÔNG KHAI (Dành cho Resident & Khách) ------------------
        { id: 1, text: "1. Căn hộ nào đang trống?", roles: ['Resident', 'Khách', 'Nhân viên', 'Quản lý'], type: "Public" },
        
        // ------------------ TRUY VẤN NỘI BỘ (Dành cho Nhân viên & Quản lý) ------------------
        { id: 2, text: "2. Tổng tiền hóa đơn chưa thanh toán?", roles: ['Nhân viên', 'Quản lý'], type: "Staff" },
        { id: 3, text: "3. Tình trạng các yêu cầu đang chờ xử lý?", roles: ['Nhân viên', 'Quản lý'], type: "Staff" },
        
        { id: 4, text: "4. Liên hệ của cư dân ID/Tên?", needsParam: true, paramName: "ID/Tên cư dân", roles: ['Nhân viên', 'Quản lý'], type: "Staff" },
        { id: 5, text: "5. Chủ hộ căn hộ nào đó?", needsParam: true, paramName: "Mã căn hộ", roles: ['Nhân viên', 'Quản lý'], type: "Staff" },
        { id: 6, text: "6. Ngày hết hạn hợp đồng căn nào đó?", needsParam: true, paramName: "Mã căn hộ", roles: ['Nhân viên', 'Quản lý'], type: "Staff" },
        { id: 7, text: "7. Trạng thái Yêu cầu số bao nhiêu?", needsParam: true, paramName: "Mã Yêu Cầu", roles: ['Nhân viên', 'Quản lý'], type: "Staff" },
    ];
    
    // ⭐ LOGIC LỌC TRUY VẤN DỰA TRÊN VAI TRÒ CHUẨN ⭐
    const filteredQueries = useMemo(() => {
        // userRole sẽ là một chuỗi (ví dụ: 'Quản lý')
        return allFixedQueries.filter(q => q.roles.includes(userRole));
    }, [userRole]);


    const handleSend = async (messageText) => {
        if (loading || !messageText) return;

        setMessages(prev => [...prev, { sender: 'user', text: messageText }]);
        setLoading(true);

        try {
            // Gửi messageText đến Backend. Backend sẽ chạy mockFunctionCall(messageText)
            const response = await api.post('/chat/ask', { message: messageText }); 
            
            // Phản hồi đã được định dạng và FIX trong Service
            setMessages(prev => [...prev, { sender: 'ai', text: response.data.reply }]);
        } catch (error) {
            console.error("Lỗi gọi Chat API:", error);
            const errMsg = error.response?.data?.reply || error.response?.data || "Lỗi kết nối Server/Service CSDL.";
            setMessages(prev => [...prev, { sender: 'ai', text: errMsg }]);
            toast.error("Lỗi khi tra cứu!");
        } finally {
            setLoading(false);
        }
    };
    
    const handleFixedQuery = (query) => {
        let messageText = query.text;

        if (query.needsParam) {
            const param = prompt(`Vui lòng nhập ${query.paramName} để tra cứu:`);
            if (param) {
                // Tạo câu hỏi có chứa tham số (ví dụ: "4. Liên hệ của cư dân ID/Tên? 10")
                messageText = `${query.id}. ${query.text.substring(3)} ${param}`; 
            } else {
                return; 
            }
        }
        
        // Thêm ID cố định vào đầu câu hỏi để Backend (Mock Controller) nhận diện
        messageText = `${query.id}. ${messageText.substring(3)}`; // Loại bỏ số cũ và thêm số mới (ví dụ: "1. Căn hộ...")
        
        handleSend(messageText);
    };

    // --- Giao diện Bong bóng Chat và Nút bấm ---
    return (
        <div className="flex flex-col h-[500px] w-80 bg-white border border-indigo-300 rounded-lg shadow-2xl overflow-hidden fixed bottom-4 right-4 z-50">
            <Toaster position="top-center" />
            
            {/* Header */}
            <div className="p-3 bg-indigo-600 text-white flex justify-between items-center">
                <h3 className="text-md font-semibold">Trợ lý CSKH</h3>
                <button 
                    onClick={onClose} 
                    className="text-white hover:text-gray-200 transition-colors p-1"
                    title="Đóng cửa sổ"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Vùng Tin nhắn/Giao tiếp */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 italic text-sm mt-8">Chào mừng. Vai trò của bạn là **{userRole}**. Hãy chọn một câu hỏi có sẵn.</p>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-2 rounded-lg text-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Phần NÚT TRUY VẤN CỐ ĐỊNH */}
            <div className="p-3 border-t overflow-y-auto max-h-40 bg-gray-50">
                <p className="text-xs text-indigo-700 mb-2 font-semibold">Câu hỏi Thường gặp:</p>
                <div className="grid grid-cols-2 gap-2">
                    {filteredQueries.length > 0 ? (
                        filteredQueries.map((q) => (
                            <button 
                                key={q.id} 
                                onClick={() => handleFixedQuery(q)}
                                disabled={loading}
                                className={`text-xs py-1.5 px-2 rounded-md transition-colors shadow-sm
                                    ${q.type === 'Public' 
                                        ? 'bg-green-100 hover:bg-green-200 text-green-700 disabled:bg-gray-100 disabled:text-gray-400' 
                                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700 disabled:bg-gray-100 disabled:text-gray-400'}
                                `}
                            >
                                {q.text.substring(3)} {/* Cắt bỏ số ID (ví dụ: "1. ") cho gọn gàng */}
                            </button>
                        ))
                    ) : (
                        <p className="text-xs text-gray-500 col-span-2">Không có truy vấn nào được cấp quyền cho vai trò {userRole}.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIChatbox;