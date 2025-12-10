// src/pages/MyApartmentPage.jsx
import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService'; // Lấy Hợp đồng
import { apartmentService } from '../services/apartmentService'; // Lấy Căn hộ & Toggle
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/'; 

// Hàm tiện ích (Giữ nguyên)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
};
const formatCurrency = (value) => {
    if (!value) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};


const MyApartmentPage = () => {
  const { user } = useAuth();
  const [ownedContracts, setOwnedContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null); 

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
      
      // Backend (hopDongController.js) đã tự lọc theo user.id
      const allContracts = await contractService.getAll(); 
      
      // Filter: Chỉ lấy hợp đồng Mua Bán hoặc Cho Thuê còn hiệu lực
      const activeContracts = allContracts.filter(c => c.Loai === 'Mua/Bán' || c.Loai === 'Cho Thuê');
      
      setOwnedContracts(activeContracts);

    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin căn hộ. Vui lòng kiểm tra lại đăng nhập.");
    } finally {
      setLoading(false);
    }
  };


  const handleToggleRentalStatus = async (contract) => {
    
    // BƯỚC 1: KIỂM TRA TÍNH HỢP LỆ CỦA ID CĂN HỘ (HARD CHECK)
    const aptId = contract?.MaCanHo;

    if (!aptId) { 
        alert("Lỗi ứng dụng: Không tìm thấy Mã Căn Hộ (MaCanHo) trong dữ liệu Hợp đồng.");
        console.error("Lỗi logic: Contract data missing MaCanHo. Check hopDongController.js SELECT query.");
        return; 
    }
    
    if (contract.Loai === 'Cho Thuê') {
        alert("Căn hộ này đang trong hợp đồng thuê có hiệu lực. Không thể đăng cho thuê.");
        return;
    }
    
    const isCurrentlyListed = contract.IsAvailableForRent;
    const confirmMessage = isCurrentlyListed 
        ? `Bạn có chắc muốn DỪNG cho thuê căn hộ ${contract.SoCanHo} không?`
        : `Bạn có chắc chắn muốn ĐĂNG cho thuê căn hộ ${contract.SoCanHo} không?`;

    if (!window.confirm(confirmMessage)) return;

    try {
        // Gửi ID đã kiểm tra
        await apartmentService.toggleRentStatus(aptId); 
        
        alert(`Đã cập nhật trạng thái thuê thành công!`);
        fetchMyProperties(); // Tải lại danh sách
        setSelectedContract(null); // Đóng chi tiết
    } catch (err) {
        // Xử lý lỗi an toàn
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (err.response) {
            const responseData = err.response.data;
            if (typeof responseData === 'string') {
                errorMessage = responseData; 
            } else if (responseData && responseData.message) {
                errorMessage = responseData.message; 
            } else if (err.response.status) {
                 errorMessage = `Lỗi server ${err.response.status}. Vui lòng kiểm tra log Backend.`;
            }
        } else {
            errorMessage = err.message;
        }
        alert("Lỗi khi cập nhật trạng thái thuê: " + errorMessage);
    }
  }


  if (loading) return <div className="page-container p-6 text-center">Đang tải thông tin nhà của bạn...</div>;
  
  // Logic kiểm tra quyền truy cập chính xác
  if (user.role !== 'Resident') {
      return (
        <div className="page-container p-6 text-center text-red-600">
            <p className="text-xl font-bold">Truy cập bị từ chối.</p>
            <p className="mt-2 text-gray-700">Trang này chỉ dành cho Tài khoản Cư dân. Vui lòng đăng nhập lại nếu bạn vừa hoàn tất hợp đồng mua bán.</p>
        </div>
      );
  }

  const contractDetail = selectedContract;

  return (
    <div className="container mx-auto p-6">
      <div className="page-header">
        <h1 className="text-3xl font-bold text-gray-800">🏠 Quản lý Tài sản</h1>
        <p className="text-md text-gray-500">Chào mừng, {user.HoTen}!</p>
      </div>

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
             </div>

             {/* Nút hành động */}
             <div className="flex flex-col justify-center items-end border-l pl-4">
                 <h3 className="text-gray-600 mb-2 font-semibold">Tình trạng giao dịch</h3>
                 
                 {contractDetail.Loai === 'Mua/Bán' ? (
                     <button 
                         onClick={() => handleToggleRentalStatus(contractDetail)}
                         className={`py-2 px-4 rounded font-bold ${contractDetail.IsAvailableForRent ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                     >
                         {contractDetail.IsAvailableForRent ? '⚠️ Tắt Chế Độ Cho Thuê' : '✅ Đăng Lên Cho Thuê'}
                     </button>
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

// CSS styles (Adopted from ShowcasePage for consistency)
const styles = {
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
  closeDetailBtn: { position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '2em', cursor: 'pointer', color: '#666' }
};

export default MyApartmentPage;