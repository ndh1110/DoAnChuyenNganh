// src/components/ContractDetails.jsx
import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';

const ContractDetails = ({ contract, onBack }) => {
  const [terms, setTerms] = useState([]);
  const [loadingTerms, setLoadingTerms] = useState(false);

  useEffect(() => {
    if (contract?.MaHopDong) {
      fetchTerms();
    }
  }, [contract]);

  const fetchTerms = async () => {
    setLoadingTerms(true);
    try {
      const data = await contractService.getTerms(contract.MaHopDong);
      setTerms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTerms(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'N/A';
  const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  if (!contract) return null;

  return (
    <div className="contract-details mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
      <button onClick={onBack} className="text-blue-600 mb-4 hover:underline flex items-center">
        &larr; Quay lại danh sách
      </button>
      
      <div className="flex justify-between items-start border-b pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hợp đồng {contract.SoHopDong}</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-bold mt-2 inline-block">
                {contract.Loai}
            </span>
          </div>
          <div className="text-right">
              <p className="text-sm text-gray-500">Giá trị hợp đồng</p>
              <p className="text-2xl font-bold text-red-600">{formatMoney(contract.GiaTriHopDong)}</p>
              <p className="text-sm text-gray-500 mt-1">Đã đặt cọc: <span className="font-semibold text-black">{formatMoney(contract.SoTienCoc)}</span></p>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {/* BÊN A */}
         <div className="bg-white p-4 rounded border border-blue-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Bên A (Bán/Cho Thuê)</h4>
            <p className="font-bold text-lg text-gray-800">{contract.TenBenA || 'CÔNG TY (CHỦ ĐẦU TƯ)'}</p>
            <p className="text-sm text-gray-500">{contract.TenBenA ? 'Chủ hộ hiện tại' : 'Đơn vị quản lý'}</p>
         </div>

         {/* BÊN B */}
         <div className="bg-white p-4 rounded border border-green-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Bên B (Mua/Thuê)</h4>
            <p className="font-bold text-lg text-gray-800">{contract.TenBenB}</p>
            <p className="text-sm text-gray-500">Khách hàng</p>
         </div>

         {/* THÔNG TIN KHÁC */}
         <div className="bg-white p-4 rounded border border-gray-100">
             <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Thông tin khác</h4>
             <p className="text-sm"><strong>Căn hộ:</strong> {contract.SoCanHo}</p>
             <p className="text-sm"><strong>Ngày ký:</strong> {formatDate(contract.NgayKy)}</p>
             <p className="text-sm"><strong>Hết hạn:</strong> {formatDate(contract.NgayHetHan)}</p>
         </div>
      </div>

      <div className="terms-section">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Điều khoản chi tiết</h3>
          {loadingTerms ? (
              <div className="text-center py-4 text-gray-500">Đang tải điều khoản...</div>
          ) : (
              <div className="bg-white p-6 rounded border shadow-inner">
                  {terms.length === 0 && <p className="text-gray-500 italic text-center">Không có điều khoản nào.</p>}
                  <ul className="space-y-3">
                      {terms.map((term, index) => (
                          <li key={term.MaDieuKhoan} className="flex items-start text-gray-800 text-justify">
                              <span className="font-bold mr-2 min-w-[20px]">{index + 1}.</span>
                              <span className="leading-relaxed">{term.NoiDung}</span>
                          </li>
                      ))}
                  </ul>
              </div>
          )}
      </div>
    </div>
  );
};

export default ContractDetails;