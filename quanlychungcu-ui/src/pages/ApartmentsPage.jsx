// src/pages/ApartmentsPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// 1. Import Lớp Service
import { apartmentService } from '../services/apartmentService';
import { blockService } from '../services/blockService';
import { floorService } from '../services/floorService';
import { statusService } from '../services/statusService'; 

// 2. Import Context để lấy thông tin User hiện tại
import { useAuth } from '../context/AuthContext';

// 3. Import các Component con
import ApartmentList from '../components/ApartmentList';
import ApartmentForm from '../components/ApartmentForm';

// HÀM HELPER: Tạo Mã Căn Hộ
const generateApartmentCode = (block, floor, soThuTu) => {
  if (!block || !floor || !soThuTu) {
    throw new Error("Dữ liệu không hợp lệ để tạo mã căn hộ.");
  }
  
  // Tách tên Block để lấy ký tự cuối (VD: "Block A" -> "A")
  const tenBlockParts = block.TenBlock.split(' ');
  const tenBlock = tenBlockParts[tenBlockParts.length - 1]; 
  
  const soTangStr = String(floor.SoTang).padStart(2, '0'); // Ví dụ: 2 -> "02"
  const soThuTuStr = String(soThuTu).padStart(2, '0'); // Ví dụ: 3 -> "03"
  
  // Kết quả: "A.02.03"
  return `${tenBlock}.${soTangStr}.${soThuTuStr}`; 
};

function ApartmentsPage() {
  // === QUẢN LÝ STATE ===
  const [allApartments, setAllApartments] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [apartmentStatuses, setApartmentStatuses] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal Form (Thêm/Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentApartment, setCurrentApartment] = useState(null);
  
  // State cho Bộ lọc (Filters)
  const [filterBlockId, setFilterBlockId] = useState('');
  const [filterFloorId, setFilterFloorId] = useState('');
  const [filterStatusId, setFilterStatusId] = useState('');
  const [filterLoaiCanHo, setFilterLoaiCanHo] = useState(''); 

  // State cho Import Excel
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null); 

  // === LOGIC PHÂN QUYỀN ===
  const { user } = useAuth();
  // Chỉ hiển thị các chức năng quản lý nếu role là 'Quản lý' hoặc 'Admin'
  const canManage = ['Quản lý', 'Admin'].includes(user?.role);

  // === TẢI DỮ LIỆU BAN ĐẦU ===
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [apartmentsData, blocksData, floorsData, statusesData] = await Promise.all([
        apartmentService.getAll(),
        blockService.getAll(),
        floorService.getAll(),
        statusService.getByContext('APARTMENT') 
      ]);
      
      setAllApartments(apartmentsData);
      setAllBlocks(blocksData);
      setAllFloors(floorsData);
      setApartmentStatuses(statusesData); 
      
    } catch (err) {
      setError(err.message || "Lỗi khi tải dữ liệu ban đầu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); 

  // === TÍNH TOÁN & LỌC DỮ LIỆU (useMemo) ===

  // 1. Lọc danh sách tầng theo Block đang chọn (để hiển thị dropdown lọc)
  const filteredFloorsForFilter = useMemo(() => {
    if (!filterBlockId) return [];
    return allFloors.filter(f => f.MaBlock.toString() === filterBlockId);
  }, [filterBlockId, allFloors]);

  // 2. Lấy danh sách các "Loại căn hộ" duy nhất có trong DB
  const availableLoaiCanHo = useMemo(() => {
    const types = allApartments.map(apt => apt.LoaiCanHo).filter(Boolean);
    return [...new Set(types)].sort();
  }, [allApartments]);

  // 3. "Làm giàu" dữ liệu (Join bảng) và áp dụng các bộ lọc
  const hydratedAndFilteredApartments = useMemo(() => {
    const floorMap = new Map(allFloors.map(f => [f.MaTang, f]));
    const blockMap = new Map(allBlocks.map(b => [b.MaBlock, b]));

    return allApartments
      .filter(apt => {
        // Lọc theo Block
        if (filterBlockId) {
          const floor = floorMap.get(apt.MaTang);
          if (!floor || floor.MaBlock.toString() !== filterBlockId) return false;
        }
        // Lọc theo Tầng
        if (filterFloorId) {
          if (apt.MaTang.toString() !== filterFloorId) return false;
        }
        // Lọc theo Trạng Thái
        if (filterStatusId) {
          if ((apt.MaTrangThai || '').toString() !== filterStatusId) return false;
        }
        // Lọc theo Loại Căn Hộ
        if (filterLoaiCanHo) {
          if (apt.LoaiCanHo !== filterLoaiCanHo) return false;
        }
        return true; 
      })
      .map(apt => {
        // Join dữ liệu để lấy tên Block và tên Tầng
        const floor = floorMap.get(apt.MaTang);
        const block = floor ? blockMap.get(floor.MaBlock) : null;
        
        return {
          ...apt,
          SoTang: floor ? floor.SoTang : null,
          TenBlock: block ? block.TenBlock : null,
          MaBlock: block ? block.MaBlock : null,
        };
      });
  }, [
      allApartments, allBlocks, allFloors, 
      filterBlockId, filterFloorId, filterStatusId, 
      filterLoaiCanHo
    ]);

  // === XỬ LÝ SỰ KIỆN (HANDLERS) ===

  // Reset filter tầng khi đổi block
  useEffect(() => {
    setFilterFloorId('');
  }, [filterBlockId]);

  const handleAddNew = () => { 
    setCurrentApartment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (apartment) => { 
    setCurrentApartment(apartment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => { 
    if (window.confirm(`Bạn có chắc muốn xóa Căn hộ (ID: ${id})?`)) {
      try {
        setLoading(true);
        await apartmentService.delete(id);
        alert("Xóa Căn hộ thành công!");
        loadInitialData();
      } catch (err) {
        const errorMsg = err.response?.data || err.message || "Lỗi khi xóa Căn hộ.";
        setError(errorMsg);
        alert(`Lỗi khi xóa: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      // Tìm thông tin Block và Floor để tạo mã căn hộ tự động
      const floor = allFloors.find(f => f.MaTang === formData.MaTang);
      if (!floor) throw new Error("Không tìm thấy Tầng đã chọn.");
      
      const block = allBlocks.find(b => b.MaBlock === floor.MaBlock);
      if (!block) throw new Error("Không tìm thấy Block tương ứng.");

      const generatedSoCanHo = generateApartmentCode(block, floor, formData.SoThuTu);

      const dataToSubmit = {
        MaTang: formData.MaTang,
        SoCanHo: generatedSoCanHo,
        MaTrangThai: formData.MaTrangThai,
        LoaiCanHo: formData.LoaiCanHo,
        DienTich: formData.DienTich
      };

      if (currentApartment) {
        await apartmentService.update(currentApartment.MaCanHo, dataToSubmit);
        alert("Cập nhật Căn hộ thành công!");
      } else {
        await apartmentService.create(dataToSubmit);
        alert("Tạo mới Căn hộ thành công!");
      }

      setIsModalOpen(false);
      setCurrentApartment(null);
      loadInitialData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi lưu Căn hộ.";
      setError(errorMsg);
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setFormLoading(false);
    }
  };

  // --- Handlers cho Import Excel ---
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn một file Excel (.xlsx) để import.");
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn import các căn hộ từ file: ${selectedFile.name}?`)) {
      return;
    }

    setIsImporting(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const result = await apartmentService.importExcel(formData);
      alert(result.message);
      loadInitialData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi import file.";
      const errorDetails = err.response?.data?.errors 
          ? `\nChi tiết:\n- ${err.response.data.errors.join('\n- ')}` 
          : '';
      setError(errorMsg + errorDetails);
      alert(`LỖI IMPORT: ${errorMsg}${errorDetails}`);
    } finally {
      setIsImporting(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // === RENDER GIAO DIỆN ===
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Quản lý Căn Hộ</h2>
        
        {/* CHỈ HIỆN NÚT THÊM NẾU LÀ QUẢN LÝ/ADMIN */}
        {canManage && (
          <button onClick={handleAddNew} className="btn-add-new" disabled={isImporting}>
            + Thêm Căn Hộ Mới
          </button>
        )}
      </div>

      {/* CHỈ HIỆN KHUNG IMPORT NẾU LÀ QUẢN LÝ/ADMIN */}
      {canManage && (
        <div className="import-container" style={{ padding: '10px 0', borderBottom: '1px solid #ccc', marginBottom: '15px' }}>
          <h4>Import từ Excel</h4>
          <p style={{margin: '5px 0', fontSize: '0.9em', color: '#666'}}>
            File yêu cầu các cột: <strong>Tên Block, Số Tầng, Số Thứ Tự, Loại Căn Hộ, Diện Tích</strong>.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept=".xlsx, .xls"
              disabled={isImporting}
            />
            <button 
              onClick={handleImport} 
              className="btn-submit" 
              disabled={!selectedFile || isImporting}
            >
              {isImporting ? 'Đang import...' : 'Bắt đầu Import'}
            </button>
          </div>
        </div>
      )}

      {/* --- BỘ LỌC (Dành cho tất cả mọi người) --- */}
      <div className="filters-container">
        <div className="filter-item">
          <label htmlFor="filterBlock">Lọc theo Block: </label>
          <select 
            id="filterBlock" 
            value={filterBlockId} 
            onChange={(e) => setFilterBlockId(e.target.value)}
            disabled={loading || isImporting}
          >
            <option value="">{loading ? 'Đang tải...' : 'Tất cả Block'}</option>
            {allBlocks.map(block => (
              <option key={block.MaBlock} value={block.MaBlock}>
                {block.TenBlock}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-item">
          <label htmlFor="filterFloor">Lọc theo Tầng: </label>
          <select 
            id="filterFloor" 
            value={filterFloorId} 
            onChange={(e) => setFilterFloorId(e.target.value)}
            disabled={!filterBlockId || loading || isImporting} 
          >
            <option value="">Tất cả Tầng</option>
            {filteredFloorsForFilter.map(floor => (
              <option key={floor.MaTang} value={floor.MaTang}>
                Tầng số: {floor.SoTang}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-item">
          <label htmlFor="filterStatus">Lọc theo Trạng Thái: </label>
          <select 
            id="filterStatus" 
            value={filterStatusId} 
            onChange={(e) => setFilterStatusId(e.target.value)}
            disabled={loading || isImporting}
          >
            <option value="">Tất cả Trạng Thái</option>
            {apartmentStatuses.map(status => (
              <option key={status.MaTrangThai} value={status.MaTrangThai}>
                {status.Ten}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-item">
          <label htmlFor="filterLoaiCanHo">Lọc theo Loại Căn Hộ: </label>
          <select 
            id="filterLoaiCanHo" 
            value={filterLoaiCanHo} 
            onChange={(e) => setFilterLoaiCanHo(e.target.value)}
            disabled={loading || isImporting}
          >
            <option value="">Tất cả Các Loại</option>
            {availableLoaiCanHo.map(loai => (
              <option key={loai} value={loai}>
                {loai}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-message">Lỗi: {error}</div>}

      {/* DANH SÁCH CĂN HỘ */}
      {/* Truyền prop canManage xuống để List tự ẩn nút Sửa/Xóa */}
      <ApartmentList
        apartments={hydratedAndFilteredApartments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
        canManage={canManage} 
      />
      
      {/* FORM THÊM/SỬA (Chỉ render nếu là Quản lý/Admin) */}
      {canManage && (
        <ApartmentForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          initialData={currentApartment}
          allBlocks={allBlocks}
          allFloors={allFloors}
          apartmentStatuses={apartmentStatuses}
        />
      )}
    </div>
  );
}

export default ApartmentsPage;