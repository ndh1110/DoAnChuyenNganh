// src/pages/ApartmentsPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// 1. Import Lớp Service
import { apartmentService } from '../services/apartmentService';
import { blockService } from '../services/blockService';
import { floorService } from '../services/floorService';
import { statusService } from '../services/statusService'; 

// 2. Import các Component "Ngốc"
import ApartmentList from '../components/ApartmentList';
import ApartmentForm from '../components/ApartmentForm';

// HÀM HELPER: Tạo Mã Căn Hộ (ĐÃ SỬA)
const generateApartmentCode = (block, floor, soThuTu) => {
  if (!block || !floor || !soThuTu) {
    throw new Error("Dữ liệu không hợp lệ để tạo mã căn hộ.");
  }
  
  // Tách "Block A" -> "A" hoặc "E" -> "E"
  const tenBlockParts = block.TenBlock.split(' ');
  const tenBlock = tenBlockParts[tenBlockParts.length - 1]; // Lấy phần tử cuối
  
  const soTangStr = String(floor.SoTang).padStart(2, '0'); // "2" -> "02"
  const soThuTuStr = String(soThuTu).padStart(2, '0'); // "3" -> "03"
  
  return `${tenBlock}.${soTangStr}.${soThuTuStr}`; // "A.02.03"
};

function ApartmentsPage() {
  // === 3. Quản lý State ===
  const [allApartments, setAllApartments] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [apartmentStatuses, setApartmentStatuses] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentApartment, setCurrentApartment] = useState(null);
  
  // State cho Bộ lọc (Filters)
  const [filterBlockId, setFilterBlockId] = useState('');
  const [filterFloorId, setFilterFloorId] = useState('');
  const [filterStatusId, setFilterStatusId] = useState('');
  const [filterLoaiCanHo, setFilterLoaiCanHo] = useState(''); // <-- STATE MỚI

  // STATE MỚI CHO IMPORT
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null); 

  // === 4. Logic (useEffect) ===
  
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

  // === 5. Logic Lọc và "Làm giàu" Dữ liệu (useMemo) ===

  const filteredFloorsForFilter = useMemo(() => {
    if (!filterBlockId) return [];
    return allFloors.filter(f => f.MaBlock.toString() === filterBlockId);
  }, [filterBlockId, allFloors]);

  // USEMEMO MỚI (Tạo danh sách lọc động)
  const availableLoaiCanHo = useMemo(() => {
    // Lấy tất cả các loại, lọc ra 'null'/'N/A' hoặc rỗng
    const types = allApartments.map(apt => apt.LoaiCanHo).filter(Boolean);
    // Lấy giá trị duy nhất và sắp xếp
    return [...new Set(types)].sort();
  }, [allApartments]);

  // Lọc và "làm giàu" danh sách căn hộ để hiển thị
  const hydratedAndFilteredApartments = useMemo(() => {
    const floorMap = new Map(allFloors.map(f => [f.MaTang, f]));
    const blockMap = new Map(allBlocks.map(b => [b.MaBlock, b]));

    return allApartments
      .filter(apt => {
        // Lọc theo Block
        if (filterBlockId) {
          const floor = floorMap.get(apt.MaTang);
          if (!floor || floor.MaBlock.toString() !== filterBlockId) {
            return false;
          }
        }
        // Lọc theo Tầng
        if (filterFloorId) {
          if (apt.MaTang.toString() !== filterFloorId) {
            return false;
          }
        }
        // LỌC THEO TRẠNG THÁI
        if (filterStatusId) {
          if ((apt.MaTrangThai || '').toString() !== filterStatusId) {
            return false;
          }
        }
        
        // LOGIC LỌC MỚI
        if (filterLoaiCanHo) {
          if (apt.LoaiCanHo !== filterLoaiCanHo) {
            return false;
          }
        }
        return true; 
      })
      .map(apt => {
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
      filterLoaiCanHo // THÊM DEPENDENCY MỚI
    ]);

  // === 6. Các Hàm Xử Lý Sự Kiện (Event Handlers) ===
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
  
  useEffect(() => {
    setFilterFloorId('');
  }, [filterBlockId]);

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

  // === 7. Render Giao Diện ===
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Quản lý Căn Hộ</h2>
        <button onClick={handleAddNew} className="btn-add-new" disabled={isImporting}>
          + Thêm Căn Hộ Mới
        </button>
      </div>

      <div className="import-container" style={{ padding: '10px 0', borderBottom: '1px solid #ccc', marginBottom: '15px' }}>
        <h4>Import từ Excel</h4>
        <p style={{margin: '5px 0', fontSize: '0.9em'}}>
          File phải có 5 cột: <strong>Tên Block, Số Tầng, Số Thứ Tự, Loại Căn Hộ, Diện Tích</strong> (Bỏ qua dòng tiêu đề).
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

      {/* --- Bộ lọc (Filters) --- */}
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
        
        {/* <-- DROPDOWN LỌC MỚI --> */}
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

      <ApartmentList
        apartments={hydratedAndFilteredApartments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />
      
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
    </div>
  );
}

export default ApartmentsPage;