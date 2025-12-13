import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apartmentService } from "../services/apartmentService"; // Dùng service mới khôi phục

const ApartmentsPage = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL, EMPTY, OCCUPIED
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await apartmentService.getAll();
      setApartments(data);
    } catch (error) {
      console.error("Lỗi tải danh sách căn hộ:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc dữ liệu
  const filteredApartments = apartments.filter((apt) => {
    const matchStatus = 
      filter === "ALL" ? true :
      filter === "EMPTY" ? apt.MaTrangThai === 8 : // 8 = Trống
      filter === "OCCUPIED" ? apt.MaTrangThai === 11 : false; // 11 = Đã ở

    const matchSearch = apt.SoCanHo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">🔍 Tra cứu Căn hộ</h1>
        <div className="flex gap-3">
           <input 
              type="text" 
              placeholder="Tìm số căn hộ..." 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
           >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="EMPTY">🟢 Phòng Trống</option>
              <option value="OCCUPIED">🔴 Đang có người</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">Số Căn Hộ</th>
              <th className="p-4">Diện tích</th>
              <th className="p-4">Loại Căn</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan="5" className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : filteredApartments.length === 0 ? (
               <tr><td colSpan="5" className="p-8 text-center text-gray-500">Không tìm thấy căn hộ nào.</td></tr>
            ) : (
               filteredApartments.map((apt) => {
                  const isOccupied = apt.MaTrangThai === 11;
                  return (
                    <tr key={apt.MaCanHo} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-700">{apt.SoCanHo}</td>
                      <td className="p-4">{apt.DienTich} m²</td>
                      <td className="p-4">{apt.LoaiCanHo || "Căn hộ tiêu chuẩn"}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOccupied ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {isOccupied ? 'Đã ở' : 'Trống'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                           to={`/apartment/${apt.MaCanHo}`} // Giả định route này tồn tại hoặc bạn sẽ làm sau
                           className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                           Xem chi tiết →
                        </Link>
                      </td>
                    </tr>
                  )
               })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApartmentsPage;