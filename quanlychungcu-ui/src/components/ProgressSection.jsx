import React from 'react';

// Dữ liệu mẫu tiến độ
const progressItems = [
  { title: "The Beverly", status: "Đang hoàn thiện nội thất", img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80" },
  { title: "Glory Heights", status: "Cất nóc tòa GH1", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80" },
  { title: "Quảng trường Golden Eagle", status: "Đã đi vào vận hành", img: "/images/quangtruong.png" },
  { title: "The Opus One", status: "Thi công móng cọc", img: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=500&q=80" },
];

const ProgressSection = () => {
  return (
    <div className="py-16 bg-slate-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2 uppercase tracking-wide">
          Tiến độ Grand Horizon
        </h2>
        <div className="w-20 h-1 bg-blue-600 mx-auto mb-10"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {progressItems.map((item, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer">
              <div className="aspect-[4/3]">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white font-bold text-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {item.title}
                </h3>
                <p className="text-blue-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  {item.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressSection;