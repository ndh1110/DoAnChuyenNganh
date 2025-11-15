// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

function ProfilePage() {
  const { user } = useAuth(); 
  
  const [profile, setProfile] = useState({
    HoTen: '',
    Email: '',
    SoDienThoai: '',
    VaiTro: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Trạng thái tải ban đầu
  const [saving, setSaving] = useState(false);  // Trạng thái khi bấm Lưu
  const [error, setError] = useState(null);

  // 1. Tải thông tin User khi component được mount hoặc user thay đổi
  useEffect(() => {
    const loadData = async () => {
      // Nếu chưa có user (ví dụ: F5 trang, context chưa kịp load), chờ chút
      if (!user) {
        // Nếu context báo đã login mà user vẫn null thì mới là lỗi, còn không thì cứ chờ
        return; 
      }

      // DEBUG: In ra console để xem user có trường ID tên là gì
      console.log("User Object từ AuthContext:", user);

      // Cố gắng tìm ID từ các tên biến phổ biến
      const userId = user.id || user.MaNguoiDung || user.Id || user.sub || user.userId;

      if (!userId) {
        console.error("Lỗi: Không tìm thấy ID trong đối tượng user.");
        setError("Không tìm thấy thông tin định danh (ID) của bạn.");
        setLoading(false); // QUAN TRỌNG: Tắt loading để hiện lỗi
        return;
      }

      // Nếu có ID, gọi API
      await fetchUserProfile(userId);
    };

    loadData();
  }, [user]);

  const fetchUserProfile = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await userService.getById(id);
      
      setProfile({
        HoTen: data.HoTen || '',
        Email: data.Email || '',
        SoDienThoai: data.SoDienThoai || '',
        VaiTro: user.role || 'Người dùng' 
      });
    } catch (err) {
      console.error("Lỗi API getById:", err);
      setError("Không thể tải thông tin cá nhân. " + (err.response?.data || err.message));
    } finally {
      // QUAN TRỌNG: Luôn tắt loading dù thành công hay thất bại
      setLoading(false);
    }
  };

  // 2. Xử lý khi nhập liệu vào ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 3. Xử lý Lưu thay đổi
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!profile.HoTen.trim()) {
      alert("Họ tên không được để trống!");
      return;
    }

    try {
      setSaving(true);
      
      // Lấy lại ID để update
      const userId = user.id || user.MaNguoiDung || user.Id || user.sub || user.userId;
      
      // Chỉ gửi HoTen và SoDienThoai lên server
      const dataToUpdate = {
        HoTen: profile.HoTen,
        SoDienThoai: profile.SoDienThoai
      };

      await userService.update(userId, dataToUpdate);
      
      alert("Cập nhật hồ sơ thành công!");
      setIsEditing(false); // Tắt chế độ sửa
    } catch (err) {
      const msg = err.response?.data || err.message;
      alert(`Lỗi khi cập nhật: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // 4. Nút Hủy bỏ (Load lại dữ liệu gốc)
  const handleCancel = () => {
    setIsEditing(false);
    const userId = user.id || user.MaNguoiDung || user.Id || user.sub || user.userId;
    if (userId) fetchUserProfile(userId);
  };

  // --- RENDER GIAO DIỆN ---

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Đang tải dữ liệu hồ sơ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
        <h3>Đã xảy ra lỗi</h3>
        <p>{error}</p>
        <p>Vui lòng thử đăng xuất và đăng nhập lại.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Hồ sơ cá nhân</h2>
        {/* Nút chuyển chế độ Xem <-> Sửa */}
        {!isEditing && (
          <button className="btn-edit" onClick={() => setIsEditing(true)}>
            Chỉnh sửa thông tin
          </button>
        )}
      </div>

      <div className="profile-card" style={styles.card}>
        {/* Phần Avatar và Tên hiển thị bên trên */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarCircle}>
            {/* Lấy chữ cái đầu tiên của tên làm avatar */}
            {profile.HoTen ? profile.HoTen.charAt(0).toUpperCase() : 'U'}
          </div>
          <h3>{profile.HoTen || 'Chưa cập nhật tên'}</h3>
          <span className="badge" style={{ padding: '5px 10px', background: '#eee', borderRadius: '4px' }}>
            {profile.VaiTro}
          </span>
        </div>

        {/* Form thông tin */}
        <form onSubmit={handleSave} style={styles.form}>
          
          {/* --- HỌ TÊN --- */}
          <div className="form-group">
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Họ và Tên</label>
            {isEditing ? (
              <input
                type="text"
                name="HoTen"
                value={profile.HoTen}
                onChange={handleChange}
                className="form-control"
                style={styles.input}
              />
            ) : (
              <p style={styles.textData}>{profile.HoTen}</p>
            )}
          </div>

          {/* --- EMAIL (READ ONLY) --- */}
          <div className="form-group">
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Email (Không thể thay đổi)</label>
            <input
              type="email"
              value={profile.Email}
              disabled
              className="form-control disabled"
              style={{ ...styles.input, backgroundColor: '#f0f0f0', cursor: 'not-allowed', color: '#666' }}
            />
          </div>

          {/* --- SỐ ĐIỆN THOẠI --- */}
          <div className="form-group">
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Số điện thoại</label>
            {isEditing ? (
              <input
                type="text"
                name="SoDienThoai"
                value={profile.SoDienThoai}
                onChange={handleChange}
                className="form-control"
                placeholder="Nhập số điện thoại..."
                style={styles.input}
              />
            ) : (
              <p style={styles.textData}>{profile.SoDienThoai || '(Chưa cập nhật)'}</p>
            )}
          </div>

          {/* --- CÁC NÚT HÀNH ĐỘNG (LƯU/HỦY) --- */}
          {isEditing && (
            <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={handleCancel} 
                className="btn-cancel" 
                disabled={saving}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="btn-submit" 
                disabled={saving}
                style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// CSS Styles (bạn có thể chuyển sang file .css nếu muốn)
const styles = {
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '20px auto',
    border: '1px solid #eee'
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #eee',
    paddingBottom: '20px'
  },
  avatarCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: '32px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  textData: {
    padding: '10px',
    backgroundColor: '#f9f9f9',
    border: '1px solid transparent',
    borderRadius: '4px',
    margin: 0,
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box'
  }
};

export default ProfilePage;