import React, { useState, useEffect, useCallback } from 'react';
import { roleService } from '../services/roleService';
import RoleEditModal from '../components/RoleEditModal.jsx';

/**
 * Component "Thông Minh" (Smart Component)
 * - Quản lý state và logic cho trang Phân quyền.
 */
function UserManagementPage() {
  // 3. Quản lý State
  const [userRolesList, setUserRolesList] = useState([]); // Từ GET /api/user-roles
  const [allRoles, setAllRoles] = useState([]);         // Từ GET /api/vaitro
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 4. Logic Fetch Data (Tải cả 2 API)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Chạy 2 API song song
      const [usersData, rolesData] = await Promise.all([
        roleService.getUserRoles(),
        roleService.getAllRoles()
      ]);
      
      setUserRolesList(usersData);
      setAllRoles(rolesData);

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu trang Phân quyền:", err);
      setError(err.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 6. Các Hàm Xử Lý Sự Kiện (Handlers)

  // Mở modal
  const handleOpenModal = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  // Xử lý SUBMIT Form (từ Modal)
  const handleModalSubmit = async (userId, roleIds) => {
    try {
      setFormLoading(true);
      setError(null);

      await roleService.syncUserRoles(userId, roleIds);
      
      alert("Cập nhật vai trò thành công!");
      setIsModalOpen(false);
      loadData(); // Tải lại danh sách
    } catch (err) {
      const errorMsg = err.response?.data || err.message || "Lỗi khi lưu.";
      setError(errorMsg);
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setFormLoading(false);
    }
  };

  // 7. Render Giao Diện
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Phân Quyền Người Dùng</h2>
      </div>

      {error && <div className="error-message">Lỗi: {error}</div>}
      
      {loading ? (
        <div>Đang tải danh sách người dùng...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã ND</th>
              <th>Họ Tên</th>
              <th>Email</th>
              <th>Vai Trò Hiện Tại</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {userRolesList.map((user) => (
              <tr key={user.MaNguoiDung}>
                <td>{user.MaNguoiDung}</td>
                <td>{user.HoTen}</td>
                <td>{user.Email}</td>
                <td>
                  {/* Hiển thị vai trò dạng tag/badge */}
                  {user.Roles.map(role => (
                    <span key={role.MaVaiTro} className="role-badge">
                      {role.TenVaiTro}
                    </span>
                  ))}
                </td>
                <td className="actions">
                  <button onClick={() => handleOpenModal(user)} className="btn-edit">
                    Sửa vai trò
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* 8. Render Modal (ẩn) */}
      <RoleEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isLoading={formLoading}
        allRoles={allRoles}
        currentUser={currentUser}
      />
    </div>
  );
}

export default UserManagementPage;