import React from 'react';

// CẬP NHẬT KHO ẢNH MỚI (Ảnh 2 cũ bị lỗi, đã thay bằng ảnh Meeting/Community)
const NEWS_IMAGES = [
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80", // Ảnh 1: Họp mặt/Sự kiện
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80",   // Ảnh 2: Thông báo (Thay ảnh cũ bị lỗi)
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80", // Ảnh 3: Thể thao/Chạy bộ
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80"  // Ảnh 4: Văn phòng/Làm việc
];

const NewsSection = ({ data = [] }) => {
  // Lọc tin tức
  const newsList = data.filter(item => item.MaTemplate === 'NEWS').slice(0, 3);

  // Dữ liệu fallback
  const displayData = newsList.length > 0 ? newsList : [
      { NgayGui: new Date(), NoiDung: "Sự kiện: Đêm hội Trăng Rằm cho cư dân nhí" },
      { NgayGui: new Date(), NoiDung: "Tin tức: Thông báo lịch phun thuốc diệt côn trùng định kỳ" },
      { NgayGui: new Date(), NoiDung: "Sự kiện: Giải chạy bộ Green Run ngày Chủ Nhật" }
  ];

  return (
    <div className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">Cập nhật mới nhất</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Tin tức & Sự kiện</h2>
          </div>
          <button className="hidden md:block text-slate-600 font-semibold hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 pb-1">
            Xem tất cả bài viết
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayData.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group h-full flex flex-col">
              <div className="h-52 overflow-hidden relative bg-gray-200">
                 <img 
                    // Lấy ảnh theo thứ tự index (0, 1, 2...)
                    src={NEWS_IMAGES[index % NEWS_IMAGES.length]} 
                    alt="News" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    onError={(e) => {e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'}} // Fallback cuối cùng
                 />
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                   {item.NgayGui ? new Date(item.NgayGui).toLocaleDateString('vi-VN') : 'Mới'}
                 </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {item.NoiDung.split(':')[1] || item.NoiDung.split(':')[0]}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                   {item.NoiDung}
                </p>
                <a href="#" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 mt-auto">
                  Đọc tiếp <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSection;