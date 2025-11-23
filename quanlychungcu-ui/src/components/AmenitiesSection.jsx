import React from 'react';

// CẬP NHẬT KHO ẢNH MỚI (Đã kiểm tra link hoạt động)
const AMENITY_IMAGES = {
  'hồ bơi': {
    icon: "🏊‍♂️",
    img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80"
  },
  'gym': {
    icon: "🏋️‍♀️",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80"
  },
  // Cập nhật ảnh Công viên (Fix lỗi ảnh chết)
  'công viên': {
    icon: "🌳",
    img: "https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&w=600&q=80"
  },
  'bbq': {
    icon: "🍖",
    img: "https://images.unsplash.com/photo-1556239019-f25528dc8833?auto=format&fit=crop&w=600&q=80"
  },
  // Thêm ảnh cho Quảng trường (Fix lỗi Quảng trường Golden Eagle)
  'quảng trường': { 
    icon: "⛲",
    img: "/images/quangtruong.png" // <-- SỬA THÀNH DÒNG NÀY
  },
  'sảnh': {
    icon: "✨",
    img: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=600&q=80"
  },
  'default': {
    icon: "🏢",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
  }
};

const getStyleByName = (dbName) => {
  const nameLower = dbName?.toLowerCase() || "";
  if (nameLower.includes('hồ bơi') || nameLower.includes('bể bơi')) return AMENITY_IMAGES['hồ bơi'];
  if (nameLower.includes('gym') || nameLower.includes('thể thao') || nameLower.includes('yoga')) return AMENITY_IMAGES['gym'];
  if (nameLower.includes('công viên') || nameLower.includes('xanh') || nameLower.includes('vườn')) return AMENITY_IMAGES['công viên'];
  if (nameLower.includes('bbq') || nameLower.includes('nướng')) return AMENITY_IMAGES['bbq'];
  // Thêm check cho Quảng trường
  if (nameLower.includes('quảng trường') || nameLower.includes('square')) return AMENITY_IMAGES['quảng trường'];
  if (nameLower.includes('sảnh') || nameLower.includes('tiếp tân')) return AMENITY_IMAGES['sảnh'];
  return AMENITY_IMAGES['default'];
};

const AmenitiesSection = ({ data = [] }) => {
  const amenities = data.filter(item => item.Loai === 'Tiện ích');
  
  // Dữ liệu fallback nếu API rỗng
  const displayData = amenities.length > 0 ? amenities : [
      { Ten: "Hồ bơi Vô cực", MoTa: "Tầng 5, view toàn thành phố" },
      { Ten: "Công viên trung tâm", MoTa: "Không gian xanh mát, khu vui chơi trẻ em." },
      { Ten: "Quảng trường Golden Eagle", MoTa: "Biểu tượng nghệ thuật độc đáo." },
      { Ten: "Phòng Gym & Yoga", MoTa: "Trang thiết bị hiện đại, mở cửa 24/7." }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">Hệ sinh thái</span>
          <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">Tiện ích Đẳng cấp</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayData.map((item, index) => {
            const style = getStyleByName(item.Ten); 
            // Sử dụng key ổn định hơn
            const key = item.MaKhuVuc || index; 
            return (
              <div key={key} className="group relative rounded-2xl overflow-hidden cursor-pointer h-80 shadow-md hover:shadow-2xl transition-all duration-500">
                <img 
                  src={style.img} 
                  alt={item.Ten} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="text-3xl mb-2">{style.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{item.Ten}</h3>
                  <p className="text-slate-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                    {item.MoTa || "Trải nghiệm tiện ích tuyệt vời dành riêng cho cư dân."}
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