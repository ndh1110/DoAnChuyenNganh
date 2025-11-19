import React from 'react';

// Kho ảnh Hardcode (Map theo tên tiện ích)
const AMENITY_IMAGES = {
  'hồ bơi': {
    icon: "🏊‍♂️",
    img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=500&q=80"
  },
  'gym': {
    icon: "🏋️‍♀️",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80"
  },
  'công viên': {
    icon: "🌳",
    img: "https://images.unsplash.com/photo-1496091094433-99355f51681f?auto=format&fit=crop&w=500&q=80"
  },
  'bbq': {
    icon: "🍖",
    img: "https://images.unsplash.com/photo-1556239019-f25528dc8833?auto=format&fit=crop&w=500&q=80"
  },
  'sảnh': {
    icon: "✨",
    img: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=500&q=80"
  },
  'default': {
    icon: "wb_incandescent", // Icon mặc định
    img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=500&q=80"
  }
};

const getStyleByName = (dbName) => {
  const nameLower = dbName?.toLowerCase() || "";
  if (nameLower.includes('hồ bơi')) return AMENITY_IMAGES['hồ bơi'];
  if (nameLower.includes('gym') || nameLower.includes('thể thao')) return AMENITY_IMAGES['gym'];
  if (nameLower.includes('công viên') || nameLower.includes('cây xanh')) return AMENITY_IMAGES['công viên'];
  if (nameLower.includes('bbq') || nameLower.includes('nướng')) return AMENITY_IMAGES['bbq'];
  if (nameLower.includes('sảnh')) return AMENITY_IMAGES['sảnh'];
  return AMENITY_IMAGES['default'];
};

const AmenitiesSection = ({ data = [] }) => {
  // 1. Lọc dữ liệu theo yêu cầu Backend: Loai === 'Tiện ích'
  // Lưu ý: Backend trả về cột tên là 'Ten' (không phải TenKhuVuc)
  const amenities = data.filter(item => item.Loai === 'Tiện ích');

  if (amenities.length === 0) return null;

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Tiện ích Đẳng cấp</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm cuộc sống tiện nghi với hệ thống tiện ích nội khu.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {amenities.map((item) => {
            // Dùng trường 'Ten' như Backend yêu cầu
            const style = getStyleByName(item.Ten); 
            
            // Key dùng ID (giả sử backend có ID, nếu không dùng index tạm)
            const key = item.MaKhuVuc || item.id || Math.random();

            return (
              <div key={key} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={style.img} 
                    alt={item.Ten} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="text-4xl mb-3 text-blue-600 material-icons">{style.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.Ten}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {item.MoTa || "Tiện ích dành riêng cho cư dân."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AmenitiesSection;