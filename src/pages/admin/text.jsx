import React, { useState, useEffect } from 'react';
import roomApi from '../../api/roomApi';

const RoomManagement = () => {
  // --- Quản lý trạng thái danh sách phòng ---
  const [rooms, setRooms] = useState([]);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [cinemaId, setCinemaId] = useState('cinema-uuid-default'); // Nên lấy từ context cụm rạp đang chọn

  // --- State thiết kế sơ đồ phòng chiếu ---
  const [roomName, setRoomName] = useState('');
  const [gridConfig, setGridConfig] = useState({ rows: 10, cols: 14 }); // Mặc định lưới 10x14
  const [seatsMatrix, setSeatsMatrix] = useState([]); // Mảng 2 chiều lưu cấu trúc thiết kế tạm thời
  const [selectedSeatIds, setSelectedSeatIds] = useState([]); // Lưu các ghế đang được bôi đen để đổi hàng loạt

  // Bảng ký tự hàng ghế tương ứng index 0 -> A, 1 -> B...
  const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Tải danh sách phòng
  const fetchRooms = async () => {
    try {
      const data = await roomApi.getAll();
      setRooms(data.content || data);
    } catch (error) {
      console.error("Lỗi tải phòng:", error);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  // --- Tự động tạo Ma trận ghế trống ban đầu dựa trên Số Hàng & Số Cột Admin nhập ---
  const generateInitialMatrix = () => {
    const matrix = [];
    for (let r = 0; r < gridConfig.rows; r++) {
      const row = [];
      let seatCountInRow = 1; // Số thứ tự ghế hiển thị lẻ (bỏ qua ô trống)
      
      for (let c = 0; c < gridConfig.cols; c++) {
        row.push({
          rowIndex: r,
          columnIndex: c,
          rowLabel: rowLabels[r] || `R${r+1}`,
          columnLabel: seatCountInRow < 10 ? `0${seatCountInRow}` : `${seatCountInRow}`,
          seatType: 'SINGLE' // Mặc định ban đầu toàn bộ là ghế thường
        });
        seatCountInRow++;
      }
      matrix.push(row);
    }
    setSeatsMatrix(matrix);
    setSelectedSeatIds([]); // Reset bôi đen
  };

  // Khởi chạy ma trận khi mở chế độ vẽ sơ đồ
  useEffect(() => {
    if (isCanvasOpen) generateInitialMatrix();
  }, [gridConfig, isCanvasOpen]);

  // --- Click vào từng ghế để đổi loại xoay vòng (SINGLE -> VIP -> DOUBLE -> EMPTY) ---
  const handleSingleSeatClick = (rowIndex, colIndex) => {
    const types = ['SINGLE', 'VIP', 'DOUBLE', 'EMPTY'];
    const currentMatrix = [...seatsMatrix];
    const currentType = currentMatrix[rowIndex][colIndex].seatType;
    
    // Tìm loại tiếp theo trong mảng tuần hoàn
    const nextType = types[(types.indexOf(currentType) + 1) % types.length];
    currentMatrix[rowIndex][colIndex].seatType = nextType;
    
    // Nếu biến thành lối đi (EMPTY), xóa nhãn số ghế
    if (nextType === 'EMPTY') {
      currentMatrix[rowIndex][colIndex].columnLabel = '';
    } else {
      currentMatrix[rowIndex][colIndex].columnLabel = `${colIndex + 1}`;
    }

    setSeatsMatrix(currentMatrix);
  };

  // --- Chọn/Bôi đen nhiều ghế để gom nhóm (Phục vụ Đổi Loại Hàng Loạt) ---
  const toggleSelectSeatForBulk = (rowIndex, colIndex) => {
    const seatKey = `${rowIndex}-${colIndex}`;
    setSelectedSeatIds(prev => 
      prev.includes(seatKey) ? prev.filter(id => id !== seatKey) : [...prev, seatKey]
    );
  };

  // Thực thi đổi loại ghế hàng loạt cho các ô đang bôi đen trên Canvas thiết kế
  const applyBulkType = (newType) => {
    if (selectedSeatIds.length === 0) return alert("Vui lòng click chọn các ghế trên lưới trước!");
    
    const currentMatrix = [...seatsMatrix];
    selectedSeatIds.forEach(key => {
      const [r, c] = key.split('-').map(Number);
      currentMatrix[r][c].seatType = newType;
      if (newType === 'EMPTY') currentMatrix[r][c].columnLabel = '';
    });
    
    setSeatsMatrix(currentMatrix);
    setSelectedSeatIds([]); // Reset lại mảng bôi đen sau khi áp dụng thành công
  };

  // --- Gửi dữ liệu Tạo phòng lên Backend ---
  const handleSaveRoom = async () => {
    if (!roomName.trim()) return alert("Vui lòng nhập tên phòng chiếu!");

    // Ép mảng 2 chiều thành mảng 1 chiều phẳng (seats) gửi lên đúng DTO của BE
    const flattenedSeats = seatsMatrix.flat();

    const roomRequestDTO = {
      cinemaId,
      roomName,
      totalRows: gridConfig.rows,
      totalColumns: gridConfig.cols,
      seats: flattenedSeats
    };

    try {
      await roomApi.createRoom(roomRequestDTO);
      alert("Thiết kế sơ đồ phòng và ghế thành công!");
      setIsCanvasOpen(false);
      fetchRooms();
    } catch (error) {
      alert("Tạo phòng chiếu thất bại, vui lòng kiểm tra lại dữ liệu!");
    }
  };

  // Đóng phòng chiếu (Xóa mềm)
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Bạn có chắc chắn muốn đóng phòng chiếu này (isActive = false)?")) return;
    try {
      await roomApi.deleteRoom(roomId);
      alert("Đã đóng cửa phòng chiếu!");
      fetchRooms();
    } catch (error) {
      alert("Thao tác thất bại!");
    }
  };

  return (
    <div className="room-manager">
      {!isCanvasOpen ? (
        /* ==================================================== */
        /* TRẠNG THÁI 1: DANH SÁCH PHÒNG CHIẾU HIỆN TẠI          */
        /* ==================================================== */
        <>
          <div className="room-manager__header">
            <h2>Quản lý Sơ đồ ghế & Phòng chiếu</h2>
            <button className="room-manager__btn-add" onClick={() => setIsCanvasOpen(true)}>
              🛠️ Thiết kế phòng mới
            </button>
          </div>

          <div className="room-manager__table-wrapper">
            <table className="room-manager__table">
              <thead>
                <tr>
                  <th>Tên phòng chiếu</th>
                  <th>Số lượng hàng</th>
                  <th>Số lượng cột</th>
                  <th>Kích thước tổng số ghế</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id}>
                    <td className="room-manager__name-cell">🚪 {room.roomName}</td>
                    <td>{room.totalRows || room.rowCount} hàng</td>
                    <td>{room.totalColumns || room.columnCount} cột</td>
                    <td>{(room.totalRows * room.totalColumns) || 0} ô lưới</td>
                    <td>
                      <span className={`room-manager__badge room-manager__badge--${room.isActive ? 'active' : 'inactive'}`}>
                        {room.isActive ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ ĐÓNG CỬA'}
                      </span>
                    </td>
                    <td>
                      <button className="room-manager__action-btn room-manager__action-btn--delete" onClick={() => handleDeleteRoom(room.id)}>
                        Đóng phòng
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ==================================================== */
        /* TRẠNG THÁI 2: STUDIO CANVAS THIẾT KẾ SƠ ĐỒ GHẾ        */
        /* ==================================================== */
        <div className="seat-studio">
          <div className="seat-studio__top-bar">
            <button className="seat-studio__btn-back" onClick={() => setIsCanvasOpen(false)}>✕ Quay lại danh sách</button>
            <h3>Studio Thiết kế Sơ đồ Phòng Chiếu</h3>
            <button className="seat-studio__btn-save" onClick={handleSaveRoom}>💾 Lưu cấu hình sơ đồ</button>
          </div>

          <div className="seat-studio__layout">
            {/* THANH ĐIỀU CHỈNH THÔNG SỐ BÊN TRÁI */}
            <div className="seat-studio__sidebar">
              <div className="seat-studio__card">
                <h4>1. Thông tin cơ bản</h4>
                <label>Tên phòng chiếu</label>
                <input type="text" placeholder="Ví dụ: Phòng Chiếu 01 (IMAX)" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                
                <div className="seat-studio__grid-inputs">
                  <div>
                    <label>Số hàng dọc (Y)</label>
                    <input type="number" value={gridConfig.rows} onChange={(e) => setGridConfig({...gridConfig, rows: parseInt(e.target.value) || 1})} />
                  </div>
                  <div>
                    <label>Số cột ngang (X)</label>
                    <input type="number" value={gridConfig.cols} onChange={(e) => setGridConfig({...gridConfig, cols: parseInt(e.target.value) || 1})} />
                  </div>
                </div>
              </div>

              <div className="seat-studio__card">
                <h4>2. Đổi loại ghế hàng loạt</h4>
                <p className="seat-studio__help-text">Mẹo: Nhấn đúp chuột hoặc giữ chuột để bọc chọn nhiều ô ghế, sau đó click chọn loại ghế áp dụng dưới đây:</p>
                <div className="seat-studio__bulk-actions">
                  <button onClick={() => applyBulkType('SINGLE')} className="bulk-btn bulk-btn--single">Ghế thường (SINGLE)</button>
                  <button onClick={() => applyBulkType('VIP')} className="bulk-btn bulk-btn--vip">Ghế VIP (VIP)</button>
                  <button onClick={() => applyBulkType('DOUBLE')} className="bulk-btn bulk-btn--double">Ghế đôi (DOUBLE)</button>
                  <button onClick={() => applyBulkType('EMPTY')} className="bulk-btn bulk-btn--empty">Lối đi chung (EMPTY)</button>
                </div>
              </div>
            </div>

            {/* KHU VỰC TRỰC QUAN MÀN HÌNH VÀ GRID GHẾ BÊN PHẢI */}
            <div className="seat-studio__canvas">
              <div className="seat-studio__screen">MÀN HÌNH CHIẾU PHIM (SCREEN)</div>
              
              <div 
                className="seat-studio__grid"
                style={{
                  gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(42px, 1fr))`,
                  gridTemplateRows: `repeat(${gridConfig.rows}, 42px)`
                }}
              >
                {seatsMatrix.map((row, rIdx) => 
                  row.map((seat, cIdx) => {
                    const seatKey = `${rIdx}-${cIdx}`;
                    const isSelected = selectedSeatIds.includes(seatKey);

                    return (
                      <div 
                        key={seatKey}
                        className={`studio-seat studio-seat--${seat.seatType.toLowerCase()} ${isSelected ? 'studio-seat--selected' : ''}`}
                        onClick={() => handleSingleSeatClick(rIdx, cIdx)}
                        onContextMenu={(e) => {
                          e.preventDefault(); // Click chuột phải để bôi đen chọn nhiều ô
                          toggleSelectSeatForBulk(rIdx, cIdx);
                        }}
                        title={`Hàng ${seat.rowLabel} - Cột ${cIdx + 1}`}
                      >
                        {seat.seatType !== 'EMPTY' ? `${seat.rowLabel}${seat.columnLabel}` : ''}
                      </div>
                    );
                  })
                )}
              </div>

              {/* CHÚ THÍCH CÁC MÀU GHẾ */}
              <div className="seat-studio__legend">
                <span className="legend-item"><span className="dot dot--single"></span> Ghế Thường</span>
                <span className="legend-item"><span className="dot dot--vip"></span> Ghế VIP</span>
                <span className="legend-item"><span className="dot dot--double"></span> Ghế Đôi (Couples)</span>
                <span className="legend-item"><span className="dot dot--empty"></span> Lối đi/Ô trống</span>
                <span className="legend-item"><span className="dot dot--selected"></span> Đang bôi đen</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;