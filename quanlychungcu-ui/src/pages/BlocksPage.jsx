import React, { useState, useEffect } from 'react';
import { blockService } from '../services/blockService';
import BlockForm from '../components/BlockForm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // <-- Import hook điều hướng

const BlocksPage = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [formMode, setFormMode] = useState('crud');
  
  const { user } = useAuth();
  const navigate = useNavigate(); // <-- Hook
  const canManage = ['Quản lý', 'Admin'].includes(user?.role);

  const loadBlocks = async () => {
    try {
      setLoading(true);
      const data = await blockService.getAll();
      setBlocks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const handleAdd = () => {
    setEditingBlock(null);
    setFormMode('crud'); // Chế độ thường
    setIsModalOpen(true);
  };
  
  // Hàm mới cho nút Setup
  const handleSetup = () => {
    setEditingBlock(null);
    setFormMode('setup'); // Chế độ Setup nâng cao
    setIsModalOpen(true);
  };

  const handleEdit = (e, block) => {
    e.stopPropagation();
    setEditingBlock(block);
    setFormMode('crud'); // Chế độ thường
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === 'setup') {
          // Gọi API Setup (Cần đảm bảo blockService có hàm createBlockSetup)
          // Nếu chưa có, dùng createBlock tạm hoặc báo lỗi
          await blockService.create(formData); 
      } else {
          // Logic CRUD cũ
          if (editingBlock) await blockService.update(editingBlock.MaBlock, formData);
          else await blockService.create(formData);
      }
      setIsModalOpen(false);
      loadBlocks();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quản lý Khu Tòa Nhà</h1>
          <p className="text-slate-500 mt-1">Danh sách các Block thuộc dự án Grand Horizon</p>
        </div>
        
        {canManage && (
          <div className="flex gap-3">
            <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2">
              + Thêm Block Mới
            </button>
            {/* Kích hoạt nút Setup */}
            <button onClick={handleSetup} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2">
              ⚙️ Setup Nhanh
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">⏳ Đang tải danh sách...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50 m-4 rounded-lg">❌ Lỗi: {error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4 pl-6">Mã Block</th>
                  <th className="p-4">Tên Block</th>
                  <th className="p-4 text-center">Số Tầng</th>
                  <th className="p-4 text-right pr-6">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blocks.map((block) => (
                  <tr 
                    key={block.MaBlock} 
                    onClick={() => navigate(`/blocks/${block.MaBlock}`)} // <-- THÊM DÒNG NÀY VÀO
                    className="hover:bg-blue-50 transition-colors cursor-pointer group" 
                  >
                    <td className="p-4 pl-6 font-medium text-slate-900">#{block.MaBlock}</td>
                    <td className="p-4">
                        <div className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{block.TenBlock}</div>
                    </td>
                    <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {block.SoTang} Tầng
                        </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      {canManage && (
                        <>
                          <button 
                            onClick={(e) => handleEdit(e, block)}
                            className="text-slate-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-all cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, block.MaBlock)}
                            className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-all cursor-pointer"
                            title="Xóa"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {blocks.length === 0 && (
                    <tr><td colSpan="4" className="p-12 text-center text-slate-400 italic">Chưa có dữ liệu Block nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- SỬA LẠI MODAL FORM CHO ĐẸP --- */}
      {isModalOpen && (
        <BlockForm 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingBlock}
          mode={formMode} // <-- Truyền mode vào
        />
      )}
    </div>
  );
};

export default BlocksPage;