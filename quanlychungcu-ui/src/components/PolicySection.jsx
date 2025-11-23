import React from 'react';

const reasons = [
  {
    icon: "💎",
    title: "Chủ đầu tư Uy tín",
    desc: "Được phát triển bởi tập đoàn BĐS hàng đầu, đảm bảo pháp lý và tiến độ."
  },
  {
    icon: "📍",
    title: "Vị trí Đắc địa",
    desc: "Phong thủy 2 mặt giáp sông, kết nối trực tiếp Vành Đai 3 và Metro."
  },
  {
    icon: "🌳",
    title: "Hệ sinh thái Xanh",
    desc: "Mật độ xây dựng chỉ 22%, sở hữu đại công viên 36ha hàng đầu ĐNA."
  },
  {
    icon: "✨",
    title: "Tiện ích Đẳng cấp",
    desc: "Hệ thống trường học, bệnh viện, TTTM Vincom ngay trong nội khu."
  },
  {
    icon: "🛡️",
    title: "An ninh Đa lớp",
    desc: "Hệ thống Camera AI và bảo vệ 24/7 đảm bảo an toàn tuyệt đối."
  },
  {
    icon: "💰",
    title: "Tiềm năng Sinh lời",
    desc: "Cơ hội gia tăng giá trị bền vững theo hạ tầng khu Đông."
  }
];

const PolicySection = () => {
  return (
    <div className="py-16 bg-slate-900 text-white"> {/* Nền tối sang trọng */}
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-yellow-500 mb-4 uppercase tracking-widest">
            Tại sao chọn Grand Horizon?
          </h2>
          <div className="w-24 h-1 bg-white/20 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((item, index) => (
            <div key={index} className="flex gap-4 p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors hover:border-yellow-500/50 group">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Phần thông báo chính sách nhỏ */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl border border-blue-700 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-full text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-lg">Chính sách Bán hàng & Thanh toán</h4>
              <p className="text-blue-200 text-sm">Cập nhật mới nhất tháng 11/2025</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors shadow-lg shadow-yellow-500/20 whitespace-nowrap">
            Tải tài liệu PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default PolicySection;