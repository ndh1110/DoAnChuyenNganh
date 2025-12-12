// src/pages/MyApartmentPage.jsx (PHIÊN BẢN HOÀN THIỆN MODULE LISTING)

import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService'; 
import { apartmentService } from '../services/apartmentService'; 
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/'; 

// === COMPONENTS VÀ HÀM TIỆN ÍCH ===

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
};
const formatCurrency = (value) => {
    if (!value) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Component Form chỉnh sửa Listing
const ListingForm = ({ contract, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        RentPrice: contract.RentPrice || '',
        ListingDescription: contract.ListingDescription || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(contract.MaCanHo, formData);
    };

    return (
        <div style={styles.modalBackdrop}>
            <div style={styles.modalContent}>
                <h3 className="text-xl font-bold mb-4">Cập nhật Listing: {contract.SoCanHo}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Giá thuê/tháng (VND)</label>
                        <input
                            type="number"
                            name="RentPrice"
                            value={formData.RentPrice}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Mô tả Listing</label>
                        <textarea
                            name="ListingDescription"
                            value={formData.ListingDescription}
                            onChange={handleChange}
                            rows="4"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
                        <button type="submit" className="btn-primary">Lưu Listing</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// === COMPONENT CHÍNH ===
const MyApartmentPage = () => {
  const { user } = useAuth();
  const [ownedContracts, setOwnedContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null); 
  const [isListingModalOpen, setIsListingModalOpen] = useState(false); // State quản lý Modal

  useEffect(() => {
    if (user && user.role === 'Resident') { 
        fetchMyProperties();
    } else if (user) {
        setLoading(false);
    }
  }, [user]);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allContracts = await contractService.getAll(); 
      const activeContracts = allContracts.filter(c => c.Loai === 'Mua/Bán' || c.Loai === 'Cho Thuê');
      
      setOwnedContracts(activeContracts);
      // Nếu Modal đang mở, cập nhật lại dữ liệu hợp đồng đang chọn
      if (selectedContract) {
         const updatedContract = activeContracts.find(c => c.MaHopDong === selectedContract.MaHopDong);
         setSelectedContract(updatedContract || null);
      }

    } catch (err) {
      console.error("Lỗi khi tải thông tin căn hộ:", err);
      setError("Không thể tải thông tin căn hộ. Vui lòng kiểm tra lại đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER TOGGLE RENTAL STATUS (Giữ nguyên) ---
  const handleToggleRentalStatus = async (contract) => {
    // ... (logic kiểm tra và xác nhận giữ nguyên)
    const aptId = contract?.MaCanHo;
    if (!aptId || contract.Loai === 'Cho Thuê') { /* ... */ return; }
    const isCurrentlyListed = contract.IsAvailableForRent;
    const confirmMessage = isCurrentlyListed 
        ? `Bạn có chắc muốn DỪNG cho thuê căn hộ ${contract.SoCanHo} không?`
        : `Bạn có chắc chắn muốn ĐĂNG cho thuê căn hộ ${contract.SoCanHo} không?`;

    if (!window.confirm(confirmMessage)) return;

    try {
        await apartmentService.toggleRentStatus(aptId); 
        alert(`Đã cập nhật trạng thái thuê thành công!`);
        fetchMyProperties(); 
        setSelectedContract(null); 
    } catch (err) {
        let errorMessage = err.response?.data || err.message || "Lỗi máy chủ nội bộ.";
        alert("Lỗi khi cập nhật trạng thái thuê: " + errorMessage);
    }
  }
  
  // --- HANDLER UPDATE LISTING (Hàm mới) ---
  const handleUpdateListing = async (aptId, formData) => {
      try {
          // ⭐ FIX: Lấy dữ liệu CĂN HỘ đã UPDATE từ response ⭐
          const response = await apartmentService.updateListing(aptId, formData);
          // Backend trả về: { message, updatedApartment: { RentPrice, ListingDescription, ... } }
          const updatedApartmentData = response.updatedApartment; 

          alert("Cập nhật thông tin niêm yết thành công!");
          setIsListingModalOpen(false); // Đóng modal
          
          // ⭐ FIX HIỂN THỊ: CẬP NHẬT STATE TRỰC TIẾP LẬP TỨC ⭐
          if (updatedApartmentData) {
              setSelectedContract(prev => ({
                  ...prev,
                  // Gộp các trường Listing mới vào hợp đồng đang chọn
                  RentPrice: updatedApartmentData.RentPrice,
                  ListingDescription: updatedApartmentData.ListingDescription,
              }));
          }
          
          // Tải lại toàn bộ danh sách để đồng bộ dữ liệu cho các card khác
          fetchMyProperties(); 
          
      } catch (err) {
          let errorMessage = err.response?.data || err.message || "Lỗi máy chủ nội bộ.";
          alert("Lỗi khi cập nhật niêm yết : " + errorMessage);
      }
  };


  if (loading) return <div className="page-container p-6 text-center">Đang tải thông tin nhà của bạn...</div>;
  if (user.role !== 'Resident') {
      return (
        <div className="page-container p-6 text-center text-red-600">
            <p className="text-xl font-bold">Truy cập bị từ chối.</p>
        </div>
      );
  }

  const contractDetail = selectedContract;
  
  const currentListingStatus = contractDetail?.IsAvailableForRent ? '✅ Đang niêm yết' : '❌ Chưa niêm yết';

  return (
    <div className="container mx-auto p-6">
      <div className="page-header">
        <h1 className="text-3xl font-bold text-gray-800">🏠 Quản lý Tài sản</h1>
        <p className="text-md text-gray-500">Chào mừng, {user.HoTen}!</p>
      </div>

      {/* MODAL CHỈNH SỬA LISTING */}
      {isListingModalOpen && contractDetail && (
          <ListingForm 
              contract={contractDetail}
              onSubmit={handleUpdateListing}
              onClose={() => setIsListingModalOpen(false)}
          />
      )}

      {/* Thông báo nếu không có hợp đồng nào */}
      {ownedContracts.length === 0 && (
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded text-center">
              <p className="font-semibold text-xl">Chưa có hợp đồng nào được ghi nhận là thuộc sở hữu của bạn.</p>
          </div>
      )}

     {/* --- PHẦN CHI TIẾT INLINE --- */}
      {contractDetail && (
        <div style={styles.detailSection}>
          <button onClick={() => setSelectedContract(null)} style={styles.closeDetailBtn}>&times;</button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Info */}
             <div className="md:col-span-2">
                 <h2 className="text-2xl font-bold text-blue-700 mb-3">{contractDetail.SoCanHo} - {contractDetail.TenBlock}</h2>
                 <p className="text-sm"><strong>Hợp đồng:</strong> {contractDetail.SoHopDong}</p>
                 <p className="text-sm"><strong>Loại:</strong> {contractDetail.Loai}</p>
                 <p className="text-sm"><strong>Giá trị HĐ:</strong> {formatCurrency(contractDetail.GiaTriHopDong)}</p>
                 <p className="text-sm"><strong>Thời hạn:</strong> {formatDate(contractDetail.NgayKy)} đến {formatDate(contractDetail.NgayHetHan)}</p>
                 
                 {/* THÔNG TIN LISTING */}
                 {contractDetail.Loai === 'Mua/Bán' && (
                     <div className="mt-3 p-3 border rounded bg-gray-50">
                         <h4 className="font-bold text-gray-700">Trạng thái Cho Thuê: {currentListingStatus}</h4>
                         <p className="text-sm">Giá niêm yết: {formatCurrency(contractDetail.RentPrice)}</p>
                         <p className="text-sm italic text-gray-600">Mô tả: {contractDetail.ListingDescription || 'Chưa có mô tả.'}</p>
                     </div>
                 )}
             </div>

             {/* Nút hành động */}
             <div className="flex flex-col justify-center items-end border-l pl-4">
                 <h3 className="text-gray-600 mb-2 font-semibold">Thao tác</h3>
                 
                 {contractDetail.Loai === 'Mua/Bán' ? (
                     <div className="flex flex-col space-y-2 w-full items-end">
                          {/* NÚT 1: TOGGLE TRẠNG THÁI */}
                          <button 
                             onClick={() => handleToggleRentalStatus(contractDetail)}
                             className={`py-2 px-4 w-full rounded font-bold ${contractDetail.IsAvailableForRent ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                          >
                              {contractDetail.IsAvailableForRent ? '⚠️ Tắt Chế Độ Cho Thuê' : '✅ Đăng Lên Cho Thuê'}
                          </button>
                          
                          {/* NÚT 2: CẬP NHẬT LISTING */}
                          <button
                             onClick={() => setIsListingModalOpen(true)}
                             className="py-2 px-4 w-full rounded font-bold bg-blue-600 hover:bg-blue-700 text-white"
                          >
                             📝 Cập nhật Niêm yết
                          </button>
                     </div>
                 ) : (
                     <p className="text-orange-600 font-bold">Đang được thuê</p>
                 )}
                 
                 <button className="text-sm text-blue-600 mt-3 hover:underline">Xem Điều khoản</button>
             </div>
          </div>
        </div>
      )}
      
      {/* --- GRID VIEW (Các Card Thuộc Sở Hữu) --- */}
      <div style={styles.gridContainer}>
        {ownedContracts.map((contract) => (
          <div key={contract.MaHopDong} style={styles.card} onClick={() => setSelectedContract(contract)}>
            <div style={styles.cardInfo}>
                <h4 className="text-xl font-bold text-blue-600">{contract.SoCanHo}</h4>
                <p className="text-sm text-gray-600 mb-3">{contract.TenBlock} - Tầng {contract.SoTang}</p>
                <div className="flex justify-between items-center text-xs">
                     <span className={`px-2 py-1 rounded font-bold ${contract.Loai === 'Mua/Bán' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {contract.Loai === 'Mua/Bán' ? 'SỞ HỮU' : 'ĐANG THUÊ'}
                     </span>
                     <span className="text-gray-500">{formatCurrency(contract.GiaTriHopDong)}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// CSS styles
const styles = {
  // ... (CSS cũ giữ nguyên)
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', padding: '20px 0' },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    borderLeft: '5px solid #3498db'
  },
  cardInfo: { padding: '15px 20px' },
  detailSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    padding: '30px',
    marginBottom: '40px',
    position: 'relative',
    border: '1px solid #ddd'
  },
  closeDetailBtn: { position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '2em', cursor: 'pointer', color: '#666' },
  // CSS cho Modal
  modalBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
};

export default MyApartmentPage;