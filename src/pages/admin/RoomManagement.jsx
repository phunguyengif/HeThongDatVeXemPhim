import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import roomApi from '../../api/roomApi';
import cinemaApi from '../../api/cinemaApi';
import { data } from 'react-router-dom';
import MenuBar from '../../components/admin_components/MenuBar';

const RoomManagement = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { cinemaId, cinemaName } = location.state || {};

    const [rooms, setRooms] = useState([]);
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);

    // --- State quản lý Cụm rạp hiện tại ---
    const [currentCinema, setCurrentCinema] = useState({
        id: cinemaId || null,
        name: cinemaName || ''
    });
    const [cinemaList, setCinemaList] = useState([]);
    const [isCinemaSelectorOpen, setIsCinemaSelectorOpen] = useState(false);

    const [roomName, setRoomName] = useState('');
    const [gridConfig, setGridConfig] = useState({ rows: 10, cols: 14 });
    const [seatsMatrix, setSeatsMatrix] = useState([]);
    const [savedRoomSeats, setSavedRoomSeats] = useState([]);
    const [selectedSeatIds, setSelectedSeatIds] = useState([]);

    const [isRightMouseDown, setIsRightMouseDown] = useState(false);
    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    const handleBackToCinemas = () => {
        navigate("/CinemaManagement");
    };

    useEffect(() => {
        if (!currentCinema.id) {
            const fetchCinemaList = async () => {
                try {
                    const data = await cinemaApi.getAll();
                    setCinemaList(data.content || data);
                    setIsCinemaSelectorOpen(true);
                } catch (error) {
                    console.error("Lỗi lấy danh sách rạp:", error);
                }
            };
            fetchCinemaList();

        }
    }, [currentCinema.id]);

    const fetchRoomsByCinema = useCallback(async () => {
        if (!currentCinema.id) return;
        try {
            const data = await roomApi.getRoomsByCinemaId(currentCinema.id);
            setRooms(data);
        } catch (error) {
            console.error("Lỗi tải danh sách phòng của rạp:", error);
        }
    }, [currentCinema.id]);

    useEffect(() => {
        if (currentCinema.id) {
            fetchRoomsByCinema();
        }
    }, [currentCinema.id, fetchRoomsByCinema]);

    useEffect(() => {
        const handleMouseUpGlobal = () => setIsRightMouseDown(false);
        window.addEventListener('mouseup', handleMouseUpGlobal);
        return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
    }, []);

    const handleSelectCinemaFromPopup = (id, name) => {
        setCurrentCinema({ id, name });
        setIsCinemaSelectorOpen(false);
    };

    // --- Khởi tạo ma trận phòng chiếu ---
    const generateInitialMatrix = useCallback(() => {
        const matrix = [];
        for (let r = 0; r < gridConfig.rows; r++) {
            const row = [];
            let seatCountInRow = 1;
            for (let c = 0; c < gridConfig.cols; c++) {
                row.push({
                    rowIndex: r,
                    columnIndex: c,
                    rowLabel: rowLabels[r] || `R${r + 1}`,
                    columnLabel: seatCountInRow < 10 ? `0${seatCountInRow}` : `${seatCountInRow}`,
                    seatType: 'SINGLE'
                });
                seatCountInRow++;
            }
            matrix.push(row);
        }
        setSeatsMatrix(matrix);
        setSelectedSeatIds([]);
    }, [gridConfig.rows, gridConfig.cols, isCanvasOpen]);

    useEffect(() => {
        if (isCanvasOpen && !isEditMode) generateInitialMatrix();
    }, [gridConfig.rows, gridConfig.cols, isCanvasOpen, isEditMode, generateInitialMatrix]);


    // ========================================================
    // [API 24] MỞ CHẾ ĐỘ CẬP NHẬT PHÒNG CŨ VÀ LẤY SƠ ĐỒ GHẾ
    // ========================================================
    const handleOpenEditRoom = async (room) => {
        try {
            setRoomName(room.name);
            setGridConfig({ rows: room.rowCount, cols: room.columnCount });
            setSelectedRoomId(room.id);
            setIsEditMode(true);

            // Gọi API Lấy chi tiết ghế theo thứ tự gridRow, gridColumn
            const seatsData = await roomApi.getSeatsByRoomId(room.id);
            setSavedRoomSeats(seatsData);
            setSelectedSeatIds([]);
            setIsCanvasOpen(true);
        } catch (error) {
            alert("Không thể tải sơ đồ ghế của phòng chiếu này!");
        }
    };

    const handleOpenCreateMode = () => {
        setIsEditMode(false);
        setRoomName('');
        setGridConfig({ rows: 10, cols: 14 });
        setIsCanvasOpen(true);
    };


    // ========================================================
    // XỬ LÝ TƯƠNG TÁC CHUỘT (DÙNG CHUNG CẢ 2 CHẾ ĐỘ)
    // ========================================================
    const handleSeatLeftClick = (rowIndex, colIndex) => {
        if (selectedSeatIds.length > 0) {
            setSelectedSeatIds([]);
            return;
        }
        // Ở chế độ cập nhật, cấm click trái lẻ để tránh lỗi đồng bộ, chỉ cho phép bôi đen hàng loạt
        if (isEditMode) return;

        const types = ['SINGLE', 'VIP', 'DOUBLE', 'EMPTY'];
        const currentMatrix = [...seatsMatrix];
        const currentType = currentMatrix[rowIndex][colIndex].seatType;

        const nextType = types[(types.indexOf(currentType) + 1) % types.length];
        currentMatrix[rowIndex][colIndex].seatType = nextType;

        if (nextType === 'EMPTY') {
            currentMatrix[rowIndex][colIndex].columnLabel = '';
        } else {
            currentMatrix[rowIndex][colIndex].columnLabel = colIndex < 9 ? `0${colIndex + 1}` : `${colIndex + 1}`;
        }
        setSeatsMatrix(currentMatrix);
    };

    const handleSeatMouseDown = (e, identifier) => {
        if (e.button === 2) {
            e.preventDefault();
            setIsRightMouseDown(true);
            setSelectedSeatIds(prev =>
                prev.includes(identifier) ? prev.filter(id => id !== identifier) : [...prev, identifier]
            );
        }
    };

    const handleSeatMouseEnter = (identifier) => {
        if (!isRightMouseDown) return;
        setSelectedSeatIds(prev => prev.includes(identifier) ? prev : [...prev, identifier]);
    };

    // ========================================================
    // [API 25] ÁP DỤNG CẬP NHẬT CẤU HÌNH GHẾ HÀNG LOẠT
    // ========================================================
    const applyBulkType = async (newType) => {
        if (selectedSeatIds.length === 0) return alert("Vui lòng GIỮ CHUỘT PHẢI và kéo quét chọn các ô trên lưới trước!");

        if (isEditMode) {
            // [API 25] Gửi cập nhật thẳng lên DB nếu đang ở chế độ Sửa
            try {
                await roomApi.updateSeatsTypeBulk(selectedSeatIds, newType);

                // Đồng bộ cập nhật giao diện local
                const updatedSavedSeats = savedRoomSeats.map(seat => {
                    if (selectedSeatIds.includes(seat.id)) {
                        return { ...seat, seatType: newType };
                    }
                    return seat;
                });
                setSavedRoomSeats(updatedSavedSeats);
                setSelectedSeatIds([]);
                alert("Cập nhật loại ghế hàng loạt lên hệ thống thành công!");
            } catch (error) {
                alert("Lỗi khi cập nhật loại ghế!");
            }
        } else {
            // Chế độ Tạo mới (Chỉ xử lý ở biến Local)
            const currentMatrix = [...seatsMatrix];
            selectedSeatIds.forEach(key => {
                const [r, c] = key.split('-').map(Number);
                currentMatrix[r][c].seatType = newType;
                if (newType === 'EMPTY') {
                    currentMatrix[r][c].columnLabel = '';
                } else {
                    currentMatrix[r][c].columnLabel = c < 9 ? `0${c + 1}` : `${c + 1}`;
                }
            });
            setSeatsMatrix(currentMatrix);
            setSelectedSeatIds([]);
        }
    };

    // ========================================================
    // [API 19 & 22] LƯU PHÒNG HOẶC CẬP NHẬT TÊN PHÒNG
    // ========================================================
    const handleSaveRoom = async () => {
        if (!roomName.trim()) return alert("Vui lòng nhập tên phòng chiếu!");

        if (isEditMode) {
            // [API 22] Gửi request cập nhật phòng
            // Mặc dù Backend chỉ cập nhật tên phòng, DTO vẫn yêu cầu trường seats không được rỗng (@NotEmpty)
            // Chuyển đổi dữ liệu ghế từ API 24 (SeatResponseDTO) về dạng request ban đầu (SeatCreateRequest)
            const formattedSeats = savedRoomSeats.map(seat => ({
                rowIndex: seat.gridRow - 1,       // CSS Grid bắt đầu từ 1, map về DB bắt đầu từ 0
                columnIndex: seat.gridColumn - 1, // CSS Grid bắt đầu từ 1, map về DB bắt đầu từ 0
                rowLabel: seat.rowName,
                columnLabel: seat.seatType === 'EMPTY' ? '' : seat.seatLabel,
                seatType: seat.seatType
            }));

            const roomRequestDTO = {
                cinemaId: currentCinema.id,
                roomName: roomName.trim(),
                totalRows: gridConfig.rows,
                totalColumns: gridConfig.cols,
                seats: formattedSeats // Đính kèm mảng ghế cũ để pass qua Validate của Backend
            };

            try {
                await roomApi.updateRoom(selectedRoomId, roomRequestDTO);
                alert("Cập nhật cấu hình phòng thành công!");
                setIsCanvasOpen(false);
                fetchRoomsByCinema();
            } catch (error) {
                if (error.validationErrors) {
                    console.error("Lỗi Validate từ Backend:", error.validationErrors);
                    alert("Dữ liệu phòng không hợp lệ, vui lòng kiểm tra lại cấu hình!");
                } else {
                    alert("Lỗi khi cập nhật phòng chiếu!");
                }
            }
        } else {
            // [API 19] Gửi request Tạo phòng mới tinh
            const formattedSeats = [];
            seatsMatrix.forEach((row) => {
                row.forEach((seat) => {
                    formattedSeats.push({
                        rowIndex: seat.rowIndex,
                        columnIndex: seat.columnIndex,
                        rowLabel: seat.rowLabel,
                        columnLabel: seat.seatType === 'EMPTY' ? '' : seat.columnLabel,
                        seatType: seat.seatType
                    });
                });
            });

            const roomRequestDTO = {
                cinemaId: currentCinema.id,
                roomName: roomName.trim(),
                totalRows: gridConfig.rows,
                totalColumns: gridConfig.cols,
                seats: formattedSeats
            };

            try {
                const data = await roomApi.createRoom(roomRequestDTO);
                alert(`Tạo phòng thành công! Tổng số ghế thật hoạt động: ${data.totalSeats}`);
                setIsCanvasOpen(false);
                fetchRoomsByCinema();
            } catch (error) {
                if (error.validationErrors) {
                    alert("Dữ liệu cấu hình phòng không hợp lệ!");
                } else {
                    alert(error.message || "Lỗi hệ thống khi tạo phòng!");
                }
            }
        }
    };

    // ========================================================
    // [API 23] XÓA MỀM PHÒNG CHIẾU
    // ========================================================
    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm("Bạn có chắc chắn muốn đóng phòng chiếu này không?")) return;
        try {
            await roomApi.deleteRoom(roomId);
            alert("Đã đóng cửa phòng chiếu thành công!");
            fetchRoomsByCinema();
        } catch (error) {
            alert("Thao tác đóng phòng thất bại!");
        }
    };

    return (
        <div>
            <MenuBar />
            <article>
                <div className="room-manager">
                    {!isCanvasOpen ? (
                        /* TRẠNG THÁI 1: DANH SÁCH PHÒNG CHIẾU */
                        <>
                            <div className="room-manager__navigation">
                                {handleBackToCinemas  ? (
                                    <button className="room-manager__btn-back" onClick={handleBackToCinemas }>
                                        Quay lại
                                    </button>
                                ) : (
                                    <button className="room-manager__btn-switch" onClick={() => setIsCinemaSelectorOpen(true)}>
                                        Đổi cụm rạp
                                    </button>
                                )}
                            </div>

                            <div className="room-manager__header">
                                <div className="room-manager__meta">
                                    <h2>Quản lý phòng chiếu: <span className="room-manager__cinema-highlight">{currentCinema.name || 'Chưa chọn rạp'}</span></h2>
                                </div>
                                <button
                                    className="room-manager__btn-add"
                                    onClick={handleOpenCreateMode}
                                    disabled={!currentCinema.id}
                                >
                                    Thiết kế phòng
                                </button>
                            </div>

                            <div className="room-manager__table-wrapper">
                                <table className="room-manager__table">
                                    <thead>
                                        <tr>
                                            <th>Tên phòng chiếu</th>
                                            <th>Kích thước ô lưới gốc</th>
                                            <th>Tổng ghế thật hoạt động</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!currentCinema.id ? (
                                            <tr><td colSpan="5" className="room-manager__empty-row">Vui lòng chọn một cụm rạp để xem danh sách phòng chiếu.</td></tr>
                                        ) : rooms.length === 0 ? (
                                            <tr><td colSpan="5" className="room-manager__empty-row">Rạp chưa có phòng chiếu nào!</td></tr>
                                        ) : (
                                            rooms.map((room) => (
                                                <tr key={room.id}>
                                                    <td className="room-manager__name-cell">
                                                        <h3>{room.name}</h3>
                                                        <small style={{ color: '#64748b' }}>Thuộc cụm: {room.cinemaName}</small>
                                                    </td>
                                                    <td>{room.rowCount} hàng × {room.columnCount} cột</td>
                                                    <td><b>{room.totalSeats} ghế</b></td>
                                                    <td>
                                                        <span className={`room-manager__badge room-manager__badge--${room.isActive ? 'active' : 'inactive'}`}>
                                                            {room.isActive ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ ĐÓNG CỬA'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="room-manager__action-btn room-manager__action-btn--edit"
                                                            onClick={() => handleOpenEditRoom(room)}
                                                        >
                                                            Sửa sơ đồ
                                                        </button>
                                                        <span style={{ color: '#cbd5e1', margin: '0 8px' }}>|</span>
                                                        <button
                                                            className="room-manager__action-btn room-manager__action-btn--delete"
                                                            onClick={() => handleDeleteRoom(room.id)}
                                                            disabled={!room.isActive}
                                                        >
                                                            Đóng phòng
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        /* TRẠNG THÁI 2: STUDIO CANVAS THIẾT KẾ VÀ CẬP NHẬT */
                        <div className="seat-studio">
                            <div className="seat-studio__top-bar">
                                <button className="seat-studio__btn-back" onClick={() => setIsCanvasOpen(false)}>✕ Quay lại</button>
                                <div className="seat-studio__center-title" style={{ textAlign: 'center' }}>
                                    <h3>{isEditMode ? 'Chế độ: Cập nhật sơ đồ ghế' : 'Chế độ: Thiết kế phòng mới'}</h3>
                                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                        Rạp: <b>{currentCinema.name || 'Chưa chọn rạp'}</b>
                                    </span>
                                </div>
                                <button className="seat-studio__btn-save" onClick={handleSaveRoom}>Lưu phòng</button>
                            </div>

                            <div className="seat-studio__layout">
                                {/* THANH ĐIỀU CHỈNH THÔNG SỐ BÊN TRÁI */}
                                <div className="seat-studio__sidebar">
                                    <div className="seat-studio__card">
                                        <h4>1. Thông tin cơ bản</h4>
                                        <label>Tên phòng chiếu</label>
                                        <input
                                            type="text"
                                            placeholder="Ví dụ: Phòng Chiếu 01 (IMAX)"
                                            value={roomName}
                                            onChange={(e) => setRoomName(e.target.value)}
                                        />

                                        <div className="seat-studio__grid-inputs">
                                            <div>
                                                <label>Số hàng dọc (Tối đa 26)</label>
                                                <input
                                                    type="number" disabled={isEditMode}
                                                    min="1" max="26"
                                                    value={gridConfig.rows}
                                                    onChange={(e) => setGridConfig({ ...gridConfig, rows: Math.min(26, Math.max(1, parseInt(e.target.value) || 1)) })}
                                                />
                                            </div>
                                            <div>
                                                <label>Số cột ngang (Tối đa 50)</label>
                                                <input
                                                    type="number" disabled={isEditMode}
                                                    min="1" max="50"
                                                    value={gridConfig.cols}
                                                    onChange={(e) => setGridConfig({ ...gridConfig, cols: Math.min(50, Math.max(1, parseInt(e.target.value) || 1)) })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="seat-studio__card">
                                        <h4>2. Cập nhật ghế hàng loạt</h4>
                                        <p className="seat-studio__help-text">
                                            <b>Mẹo:</b> {isEditMode ? "Nhấn giữ CHUỘT PHẢI quét các ghế để đổi loại trực tiếp trên hệ thống." : "Nhấn giữ CHUỘT PHẢI kéo rê chuột bôi đen các ô trên lưới."}
                                        </p>
                                        <div className="seat-studio__bulk-actions">
                                            <button type="button" onClick={() => applyBulkType('SINGLE')} className="bulk-btn bulk-btn--single">Ghế thường (SINGLE)</button>
                                            <button type="button" onClick={() => applyBulkType('VIP')} className="bulk-btn bulk-btn--vip">Ghế VIP (VIP)</button>
                                            <button type="button" onClick={() => applyBulkType('DOUBLE')} className="bulk-btn bulk-btn--double">Ghế đôi (DOUBLE)</button>
                                            {!isEditMode && <button type="button" onClick={() => applyBulkType('EMPTY')} className="bulk-btn bulk-btn--empty">Lối đi chung (EMPTY)</button>}
                                        </div>
                                    </div>
                                </div>

                                {/* KHU VỰC TRỰC QUAN MÀN HÌNH VÀ GRID GHẾ BÊN PHẢI */}
                                <div className="seat-studio__canvas">
                                    <div className="seat-studio__screen">MÀN HÌNH CHIẾU PHIM (SCREEN)</div>

                                    {/* CHẾ ĐỘ SỬA: Vẽ sơ đồ động dựa vào gridRow, gridColumn */}
                                    {isEditMode ? (
                                        <div
                                            className="seat-studio__grid"
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: `repeat(${gridConfig.cols}, 42px)`,
                                                gridTemplateRows: `repeat(${gridConfig.rows}, 42px)`,
                                                gap: '6px'
                                            }}
                                        >
                                            {savedRoomSeats.map((seat) => {
                                                const isSelected = selectedSeatIds.includes(seat.id);
                                                return (
                                                    <div
                                                        key={seat.id}
                                                        style={{ gridRowStart: seat.gridRow, gridColumnStart: seat.gridColumn }}
                                                        className={`studio-seat studio-seat--${seat.seatType.toLowerCase()} ${isSelected ? 'studio-seat--selected' : ''}`}
                                                        onMouseDown={(e) => handleSeatMouseDown(e, seat.id)}
                                                        onMouseEnter={() => handleSeatMouseEnter(seat.id)}
                                                        onContextMenu={(e) => e.preventDefault()}
                                                        title={`Hàng ${seat.rowName} - Ghế ${seat.seatLabel}`}
                                                    >
                                                        {seat.rowName}{seat.seatLabel}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* CHẾ ĐỘ TẠO MỚI: Vẽ ma trận */
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
                                                            onClick={() => handleSeatLeftClick(rIdx, cIdx)}
                                                            onMouseDown={(e) => handleSeatMouseDown(e, seatKey)}
                                                            onMouseEnter={() => handleSeatMouseEnter(seatKey)}
                                                            onContextMenu={(e) => e.preventDefault()}
                                                            title={`Hàng ${seat.rowLabel} - Cột ${cIdx + 1}`}
                                                        >
                                                            {seat.seatType !== 'EMPTY' ? `${seat.rowLabel}${seat.columnLabel}` : ''}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}

                                    {/* CHÚ THÍCH CÁC MÀU GHẾ */}
                                    <div className="seat-studio__legend">
                                        <span className="legend-item"><span className="dot dot--single"></span> Ghế Thường</span>
                                        <span className="legend-item"><span className="dot dot--vip"></span> Ghế VIP</span>
                                        <span className="legend-item"><span className="dot dot--double"></span> Ghế Đôi (Couples)</span>
                                        {!isEditMode && <span className="legend-item"><span className="dot dot--empty"></span> Lối đi/Ô trống</span>}
                                        <span className="legend-item"><span className="dot dot--selected"></span> Đang bôi đen</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* POPUP MENU CHỌN CỤM RẠP CHỦ ĐỘNG */}
                    {isCinemaSelectorOpen && (
                        <div className="cinema-select-modal">
                            <div className="cinema-select-modal__backdrop" onClick={() => currentCinema.id && setIsCinemaSelectorOpen(false)}></div>
                            <div className="cinema-select-modal__content">
                                <h3 className="cinema-select-modal__title">🏢 Chọn cụm rạp</h3>
                                <p className="cinema-select-modal__desc">Vui lòng chọn hệ thống chi nhánh rạp phim để bắt đầu tải dữ liệu phòng và cấu hình ghế ngồi tương ứng.</p>

                                <div className="cinema-select-modal__list">
                                    {cinemaList.map((cinema) => (
                                        <div
                                            key={cinema.id}
                                            className={`cinema-select-item ${currentCinema.id === cinema.id ? 'cinema-select-item--active' : ''}`}
                                            onClick={() => handleSelectCinemaFromPopup(cinema.id, cinema.name)}
                                        >
                                            <div className="cinema-select-item__icon"></div>
                                            <div className="cinema-select-item__info">
                                                <h4 className="cinema-select-item__name">{cinema.name}</h4>
                                                <p className="cinema-select-item__address">{cinema.address}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {currentCinema.id && (
                                    <button className="cinema-select-modal__btn-close" onClick={() => setIsCinemaSelectorOpen(false)}>
                                        Hủy bỏ
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
};

export default RoomManagement;