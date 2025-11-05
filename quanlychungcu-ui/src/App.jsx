import React from 'react';
import './App.css';
import BlockList from './components/BlockList';
import ResidentList from './components/ResidentList'; // 1. Import component mới

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hệ Thống Quản lý Chung cư và Dịch vụ Cư dân</h1>
      </header>
      
      <main>
        {/* Component cũ */}
        <BlockList />

        {/* 2. Thêm component mới vào dưới */}
        <ResidentList />
      </main>

      <footer>
        <p>Đồ án tốt nghiệp - 2025</p>
      </footer>
    </div>
  );
}

export default App;