import React from 'react';

const LocationSection = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Text Content */}
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 border-l-4 border-blue-600 pl-4">
              Vị trí Kim Cương - Kết nối ngàn tiện ích
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              <strong>Grand Horizon</strong> tọa lạc giữa trung tâm khu Đông Sài Gòn, sở hữu địa thế phong thủy đắc địa với 2 mặt giáp sông.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 p-1 rounded mr-3 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </span>
                <span className="text-gray-700"><strong>10 phút</strong> di chuyển đến tuyến Metro Bến Thành – Suối Tiên.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 p-1 rounded mr-3 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </span>
                <span className="text-gray-700">Kết nối Quận 1 chỉ khoảng <strong>30 phút</strong>.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 p-1 rounded mr-3 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </span>
                <span className="text-gray-700">Hệ thống xe buýt điện <strong>VinBus</strong> nội khu kết nối trực tiếp đến các trung tâm thương mại lớn.</span>
              </li>
            </ul>
          </div>
          
          {/* Image Map (Dùng ảnh placeholder bản đồ) */}
          <div className="w-full md:w-1/2">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1000&q=80" 
                alt="Ban do vi tri" 
                className="w-full h-full object-cover min-h-[300px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSection;