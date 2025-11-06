import React, { useState, useEffect, useCallback } from 'react';

// 1. Import Services
import { requestService } from '../services/requestService';
import { incidentService } from '../services/incidentService';

// 2. Import Components
import RequestList from '../components/RequestList.jsx';
import IncidentList from '../components/IncidentList.jsx';

const RequestsPage = () => {
  // 3. Quản lý State
  const [requests, setRequests] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [loadingIncs, setLoadingIncs] = useState(true);
  const [error, setError] = useState(null);

  // 4. Logic Fetch Data
  const loadData = useCallback(async () => {
    try {
      setLoadingReqs(true);
      setLoadingIncs(true);
      setError(null);
      
      // Gọi cả 2 API song song
      const [reqData, incData] = await Promise.all([
        requestService.getAllRequests(), // Dùng hàm gốc từ service
        incidentService.getAll()
      ]);
      
      setRequests(reqData.data); // Lấy .data
      setIncidents(incData.data); // Lấy .data

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Yêu cầu/Sự cố:", err);
      setError(err.message || "Không thể tải dữ liệu.");
    } finally {
      setLoadingReqs(false);
      setLoadingIncs(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // (Các hàm handle... sẽ được thêm sau khi có Form)
  const handleAction = () => {
    alert('Chức năng Tạo Yêu cầu/Sự cố sẽ được xây dựng sau!');
  };

  const handleDeleteRequest = (id) => {
    alert(`Yêu cầu Xóa Request ID: ${id} (chưa làm)`);
  };

  const handleDeleteIncident = (id) => {
    alert(`Yêu cầu Xóa Incident ID: ${id} (chưa làm)`);
  };

  // 5. Render và truyền props
  return (
    <div className="requests-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          📣 Quản lý Yêu cầu & Sự cố
        </h1>
        <button 
          onClick={handleAction}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
        >
          + Ghi Nhận Mới
        </button>
      </div>

      <hr className="mb-6"/>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">Lỗi: {error}</div>}

      {/* 1. Danh sách Yêu cầu (Truyền props) */}
      <RequestList 
        requests={requests}
        isLoading={loadingReqs}
        onDelete={handleDeleteRequest}
        onEdit={() => alert('Edit Yêu cầu')}
      />

      {/* 2. Danh sách Sự cố (Truyền props) */}
      <IncidentList 
        incidents={incidents}
        isLoading={loadingIncs}
        onDelete={handleDeleteIncident}
        onEdit={() => alert('Edit Sự cố')}
      />
    </div>
  );
};

export default RequestsPage;