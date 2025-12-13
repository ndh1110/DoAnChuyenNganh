// controllers/aiChatController.js (PHIÊN BẢN HOÀN CHỈNH - SẴN SÀNG SỬ DỤNG MOCK)

const { GoogleGenAI, Type } = require('@google/genai');
const aiDataService = require('../services/aiDataService');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const model = "gemini-2.5-flash"; 

// ⭐ CỜ MOCK: Đặt là "TRUE" trong .env để BỎ QUA API GEMINI ⭐
const USE_MOCK_FUNCTION_CALLING = process.env.USE_MOCK_FUNCTION_CALLING === 'TRUE';

if (!GEMINI_API_KEY) {
    console.warn("Lưu ý: Thiếu GEMINI_API_KEY. Chatbot đang chạy ở chế độ MOCK.");
}

// Khởi tạo AI (Chỉ được sử dụng nếu USE_MOCK_FUNCTION_CALLING là FALSE)
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


// --- 1. ĐỊNH NGHĨA CÔNG CỤ (TOOLS) ---

const apartmentTools = [
    // Định nghĩa này cần thiết cho cả MOCK (để biết tên hàm) và PRODUCTION (cho Gemini)
    { name: 'getEmptyApartments', description: 'Lấy căn hộ trống.', parameters: { type: Type.OBJECT, properties: {} } },
    { name: 'getPendingInvoices', description: 'Lấy hóa đơn chưa thanh toán.', parameters: { type: Type.OBJECT, properties: {} } },
    { name: 'getPendingRequests', description: 'Lấy yêu cầu chưa xử lý.', parameters: { type: Type.OBJECT, properties: {} } },
    { name: 'getResidentInfo', description: 'Lấy thông tin cư dân (ID/Tên).', parameters: { type: Type.OBJECT, properties: { residentId: { type: Type.STRING } } , required: ['residentId'] } },
    { name: 'getApartmentOwnerInfo', description: 'Lấy thông tin Chủ hộ/Người thuê chính.', parameters: { type: Type.OBJECT, properties: { MaCanHo: { type: Type.INTEGER } } , required: ['MaCanHo'] } },
    { name: 'getContractExpiryDate', description: 'Lấy ngày hết hạn hợp đồng.', parameters: { type: Type.OBJECT, properties: { MaCanHo: { type: Type.INTEGER } } , required: ['MaCanHo'] } },
    { name: 'getWorkRequestStatus', description: 'Kiểm tra trạng thái yêu cầu (ID).', parameters: { type: Type.OBJECT, properties: { MaYeuCau: { type: Type.INTEGER } } , required: ['MaYeuCau'] } },
];

/**
 * Hàm thực thi các công cụ thực tế (Gọi Service CSDL)
 */
const executeFunction = async (functionCall) => {
    const { name, args } = functionCall;

    if (name === 'getEmptyApartments') return aiDataService.getEmptyApartments();
    if (name === 'getPendingInvoices') return aiDataService.getPendingInvoices();
    if (name === 'getPendingRequests') return aiDataService.getPendingRequests();
    if (name === 'getResidentInfo') return aiDataService.getResidentInfo(args.residentId); 
    if (name === 'getApartmentOwnerInfo') return aiDataService.getApartmentOwnerInfo(args.MaCanHo);
    if (name === 'getContractExpiryDate') return aiDataService.getContractExpiryDate(args.MaCanHo);
    if (name === 'getWorkRequestStatus') return aiDataService.getWorkRequestStatus(args.MaYeuCau);
    
    return { status: 'error', message: `Hàm ${name} không được hỗ trợ.` };
};

/**
 * Logic suy luận tên hàm (chỉ dùng trong chế độ MOCK, KHÔNG TỐN QUOTA)
 */
const mockFunctionCall = (message) => {
    const msg = message.toLowerCase();

    // 1. Căn hộ trống 
    if (msg.startsWith('1.')) {
        return { name: 'getEmptyApartments', args: {} };
    }
    // 2. Hóa đơn chưa thanh toán
    if (msg.startsWith('2.')) {
        return { name: 'getPendingInvoices', args: {} };
    }
    // 3. Yêu cầu đang chờ xử lý
    if (msg.startsWith('3.')) {
        return { name: 'getPendingRequests', args: {} };
    }
    
    // 4. Liên hệ cư dân (ID/Tên)
    if (msg.startsWith('4.')) {
        const paramMatch = msg.match(/(cư dân|id\/tên)\s*(\w+)/);
        const residentId = paramMatch ? paramMatch[2] : null;
        if (residentId) {
            return { name: 'getResidentInfo', args: { residentId: residentId } };
        }
    }
    
    // 5. Chủ hộ căn hộ
    if (msg.startsWith('5.')) {
        const paramMatch = msg.match(/(căn hộ)\s*(\d+)/);
        const MaCanHo = paramMatch ? parseInt(paramMatch[2]) : null;
        if (MaCanHo) {
            return { name: 'getApartmentOwnerInfo', args: { MaCanHo: MaCanHo } };
        }
    }
    
    // 6. Hạn hợp đồng căn hộ
    if (msg.startsWith('6.')) {
        const paramMatch = msg.match(/(căn hộ)\s*(\d+)/);
        const MaCanHo = paramMatch ? parseInt(paramMatch[2]) : null;
        if (MaCanHo) {
            return { name: 'getContractExpiryDate', args: { MaCanHo: MaCanHo } };
        }
    }
    
    // 7. Trạng thái Yêu cầu
    if (msg.startsWith('7.')) {
        const paramMatch = msg.match(/(yêu cầu)\s*(\d+)/);
        const MaYeuCau = paramMatch ? parseInt(paramMatch[2]) : null;
        if (MaYeuCau) {
            return { name: 'getWorkRequestStatus', args: { MaYeuCau: MaYeuCau } };
        }
    }

    return null; 
};

/**
 * Chỉ dẫn hệ thống (Dùng trong Production)
 */
const getSystemInstruction = () => {
    return `
        Bạn là "Trợ lý Quản lý Tòa nhà A - Chung cư Grand Horizon".
        Bạn phải sử dụng TẤT CẢ các công cụ được cung cấp khi người dùng hỏi về dữ liệu nghiệp vụ.
        
        **QUY TẮC PHẢN HỒI BẮT BUỘNG:**
        1. Câu trả lời của bạn phải LUÔN LUÔN CHUYÊN NGHIỆP và NGẮN GỌN.
        2. Sau khi nhận được kết quả từ công cụ, bạn CHỈ ĐƯỢC PHÉP TRẢ LỜI BẰNG KẾT QUẢ CUỐI CÙNG.
        3. KHÔNG BAO GIỜ hiển thị chi tiết lệnh gọi hàm, mã JSON, hoặc bất kỳ thông tin kỹ thuật nào.
        4. Nếu không tìm thấy Mã căn hộ hoặc Mã yêu cầu, bạn PHẢI yêu cầu người dùng cung cấp rõ.
    `;
};


/**
 * POST /api/chat/ask
 * Xử lý yêu cầu trò chuyện từ Frontend 
 */
const askAIChatbot = async (req, res) => {
    const { message } = req.body;
    
    if (!message) return res.status(400).send('Thiếu nội dung tin nhắn.');
    
    // ⭐ CHẾ ĐỘ MOCK HOÀN TOÀN (0 QUOTA) ⭐
    if (USE_MOCK_FUNCTION_CALLING) {
        try {
            const functionCall = mockFunctionCall(message);

            if (functionCall) {
                const functionResult = await executeFunction(functionCall);
                
                if (functionResult.status === 'success') {
                    // Lấy message đã được định dạng từ Service (ví dụ: "Các căn hộ trống là 201, 202.")
                    const finalReply = functionResult.message || JSON.stringify(functionResult.raw_data, null, 2); 
                    
                    return res.json({ reply: finalReply });
                    
                } else {
                    // Lỗi nghiệp vụ (ví dụ: Không tìm thấy ID 10)
                    return res.json({ reply: functionResult.message || `Lỗi nghiệp vụ khi gọi ${functionCall.name}` });
                }
            }
            
            // Trả lời mặc định nếu không khớp với bất kỳ hàm nào
            return res.json({ reply: "Vui lòng chọn một câu hỏi có sẵn để tra cứu." });

        } catch (error) {
            console.error('[LỖI MOCK]: Lỗi hệ thống khi thực thi service.', error);
            // Trả về lỗi thân thiện cho người dùng
            return res.status(500).send('Lỗi máy chủ khi tra cứu CSDL.');
        }
    } 
    
    // --- CHẾ ĐỘ PRODUCTION (Function Calling 2 bước) ---
    if (!GEMINI_API_KEY) {
        return res.status(500).send('Thiếu GEMINI_API_KEY để chạy chế độ PRODUCTION.');
    }
    
    try {
        // BƯỚC 1: GỌI GEMINI để lấy lệnh gọi hàm (Tốn 1 Quota)
        let response = await ai.models.generateContent({
            model: model, contents: message, config: { systemInstruction: getSystemInstruction(), tools: apartmentTools, },
        });
        
        // BƯỚC 2: THỰC THI HÀM VÀ GỌI LẠI GEMINI
        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionCall = response.functionCalls[0];
            const functionResult = await executeFunction(functionCall);
            
            // Gọi lại Gemini để nó tạo câu trả lời (Tốn thêm 1 Quota)
            response = await ai.models.generateContent({
                model: model,
                contents: [
                    { role: 'user', parts: [{ text: message }] },
                    { role: 'function', parts: [{ functionResponse: { name: functionCall.name, response: functionResult, } }] },
                ],
                config: { systemInstruction: getSystemInstruction(), tools: apartmentTools, }, 
            });
        }
        
        const aiResponse = response.text;
        res.json({ reply: aiResponse });

    } catch (err) {
        console.error('Lỗi gọi Gemini API (Quota Error 429 hoặc Lỗi mạng):', err);
        res.status(500).send('Lỗi máy chủ khi xử lý yêu cầu AI. Vui lòng kiểm tra Quota.');
    }
};

module.exports = {
    askAIChatbot,
};