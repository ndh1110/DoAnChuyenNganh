import React from 'react';

const NewsSection = ({ data = [] }) => {
  
  // 1. Lọc dữ liệu theo yêu cầu Backend: MaTemplate === 'NEWS'
  const newsList = data.filter(item => item.MaTemplate === 'NEWS').slice(0, 3);

  if (newsList.length === 0) return null;

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Tin tức & Sự kiện</h2>
            <p className="text-gray-600">Cập nhật những hoạt động mới nhất tại khu dân cư.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsList.map((item, index) => (
            <div key={item.MaThongBao || index} className="flex flex-col h-full border border-gray-100 rounded-lg hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden rounded-t-lg relative bg-blue-50">
                 <img 
                    src="https://images.unsplash.com/photo-1504384308090-c54be3855212?auto=format&fit=crop&w=500&q=80" 
                    alt="News" 
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity" 
                 />
                 <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                   TIN TỨC
                 </span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-sm text-gray-400 mb-2">
                    {/* Backend trả về NgayGui */}
                    {item.NgayGui ? new Date(item.NgayGui).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2">
                  {/* Backend chưa có Title riêng, dùng NoiDung làm title tạm */}
                  {item.NoiDung?.substring(0, 50) + "..."}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                  {item.NoiDung}
                </p>
                <button className="text-blue-600 font-medium text-sm hover:underline self-start">
                  Đọc tiếp
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSection;