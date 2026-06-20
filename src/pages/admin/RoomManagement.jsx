import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import roomApi from '../../api/roomApi';
import cinemaApi from '../../api/cinemaApi';
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
    const [originalRoomSeats, setOriginalRoomSeats] = useState([]);
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
                    seatType: 'NORMAL'
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


    // CẬP NHẬT (LẤY CHI TIẾT PHÒNG)
    const handleOpenEditRoom = async (room) => {
        try {
            const roomDetail = await roomApi.getRoomById(room.id);

            setRoomName(roomDetail.name);
            setGridConfig({ rows: roomDetail.rowCount, cols: roomDetail.columnCount });
            setSelectedRoomId(roomDetail.id);
            setIsEditMode(true);

            // Chuyển đổi mảng 2 chiều (seatMatrix) thành mảng 1 chiều để render Grid
            const flatSeats = [];
            roomDetail.seatMatrix.forEach((rowArr, rIdx) => {
                rowArr.forEach((seat, cIdx) => {
                    flatSeats.push({
                        id: seat.id,
                        gridRow: rIdx + 1,
                        gridColumn: cIdx + 1,
                        rowName: seat.row,
                        seatLabel: seat.col,
                        seatType: seat.type
                    });
                });
            });

            setSavedRoomSeats(flatSeats);
            setOriginalRoomSeats(flatSeats);
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

    // XỬ LÝ TƯƠNG TÁC CHUỘT
    const handleSeatLeftClick = (rowIndex, colIndex) => {
        if (selectedSeatIds.length > 0) {
            setSelectedSeatIds([]);
            return;
        }
        if (isEditMode) return;

        // 👉 ĐÃ CẬP NHẬT: Thêm MAINTENANCE và đổi tên theo API
        const types = ['NORMAL', 'VIP', 'COUPLE', 'MAINTENANCE', 'EMPTY'];
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

    // CẬP NHẬT LOẠI GHẾ HÀNG LOẠT
    const applyBulkType = async (newType) => {
        if (selectedSeatIds.length === 0) return alert("Vui lòng GIỮ CHUỘT PHẢI và kéo quét chọn các ô trên lưới trước!");

        if (isEditMode) {
            try {
                await roomApi.updateSeatsTypeBulk(selectedSeatIds, newType);

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

    // LƯU PHÒNG HOẶC CẬP NHẬT PHÒNG
    const handleSaveRoom = async () => {
        if (!roomName.trim()) return alert("Vui lòng nhập tên phòng chiếu!");

        if (isEditMode) {

            const changedSeats = savedRoomSeats.filter(seat => {
                const origSeat = originalRoomSeats.find(o => o.id === seat.id);
                return origSeat && origSeat.seatType !== seat.seatType;
            });

            if (changedSeats.length > 0) {
                // Gom nhóm ID ghế theo loại mới (VD: { VIP: ['id1', 'id2'], EMPTY: ['id3'] })
                const groupedByType = changedSeats.reduce((acc, seat) => {
                    if (!acc[seat.seatType]) acc[seat.seatType] = [];
                    acc[seat.seatType].push(seat.id);
                    return acc;
                }, {});
                const updateSeatPromises = Object.keys(groupedByType).map(type => {
                    const ids = groupedByType[type];
                    // Sử dụng hàm update Bulk bạn đã có sẵn
                    return roomApi.updateSeatsTypeBulk(ids, type);
                });

                // Gọi TẤT CẢ API đổi loại ghế cùng một lúc để tăng tốc độ
                await Promise.all(updateSeatPromises);
            }

            const dummySeats = [{
                rowIndex: 0,
                columnIndex: 0,
                rowLabel: "A",
                columnLabel: "",
                seatType: "EMPTY"
            }];

            const roomRequestDTO = {
                cinemaId: currentCinema.id,
                roomName: roomName.trim(),
                totalRows: gridConfig.rows,
                totalColumns: gridConfig.cols,
                seats: dummySeats
            };
            try {
                await roomApi.updateRoom(selectedRoomId, roomRequestDTO);

                alert("Đã lưu lại Tên phòng và Sơ đồ ghế thành công!");
                setIsCanvasOpen(false);
                fetchRoomsByCinema();
            } catch (error) {
                if (error.validationErrors) {
                    alert("Dữ liệu cấu hình phòng không hợp lệ: " + JSON.stringify(error.validationErrors));
                } else {
                    alert("Đã xảy ra lỗi trong quá trình lưu dữ liệu!");
                }
            }
        } else {
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
            console.log(roomRequestDTO);


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

    // XÓA MỀM VÀ PHỤC HỒI PHÒNG CHIẾU
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

    const handleRestoreRoom = async (roomId) => {
        if (!window.confirm("Bạn muốn MỞ LẠI phòng chiếu này?")) return;
        try {
            const roomDetail = await roomApi.getRoomById(roomId);
            const formattedSeats = [];

            roomDetail.seatMatrix.forEach((rowArr, rIdx) => {
                rowArr.forEach((seat, cIdx) => {
                    formattedSeats.push({
                        rowIndex: rIdx,
                        columnIndex: cIdx,
                        rowLabel: seat.row,
                        columnLabel: seat.type === 'EMPTY' ? '' : seat.col,
                        seatType: seat.type
                    });
                });
            });


            await roomApi.reopenRoom(roomId);
            alert("Đã mở lại phòng chiếu thành công!");
            fetchRoomsByCinema();
        } catch (error) {
            alert("Không thể mở lại phòng!");
        }
    };

    return (
        <div>
            <MenuBar />
            <article>
                <div className="room-manager">
                    {!isCanvasOpen ? (
                        <>
                            <div className="room-manager__navigation">
                                {handleBackToCinemas ? (
                                    <button className="room-manager__btn-back" onClick={handleBackToCinemas}>
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

                                                        {room.isActive ? (
                                                            <button
                                                                className="room-manager__action-btn room-manager__action-btn--delete"
                                                                onClick={() => handleDeleteRoom(room.id)}
                                                            >
                                                                Đóng phòng
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="room-manager__action-btn"
                                                                style={{ color: '#28a745', fontWeight: 'bold' }}
                                                                onClick={() => handleRestoreRoom(room.id)}
                                                            >
                                                                Mở lại phòng
                                                            </button>
                                                        )}
                                                        
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
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
                                            <button type="button" onClick={() => applyBulkType('NORMAL')} className="bulk-btn bulk-btn--normal">Ghế thường (NORMAL)</button>
                                            <button type="button" onClick={() => applyBulkType('VIP')} className="bulk-btn bulk-btn--vip">Ghế VIP (VIP)</button>
                                            <button type="button" onClick={() => applyBulkType('COUPLE')} className="bulk-btn bulk-btn--couple">Ghế đôi (COUPLE)</button>
                                            <button type="button" onClick={() => applyBulkType('MAINTENANCE')} className="bulk-btn bulk-btn--maintenance">Bảo trì (MNT)</button>
                                            {!isEditMode && <button type="button" onClick={() => applyBulkType('EMPTY')} className="bulk-btn bulk-btn--empty">Lối đi chung (EMPTY)</button>}
                                        </div>
                                    </div>
                                </div>

                                <div className="seat-studio__canvas">
                                    <div className="seat-studio__screen">MÀN HÌNH CHIẾU PHIM (SCREEN)</div>

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

                                    <div className="seat-studio__legend">
                                        <span className="legend-item"><span className="dot dot--normal"></span> Ghế Thường</span>
                                        <span className="legend-item"><span className="dot dot--vip"></span> Ghế VIP</span>
                                        <span className="legend-item"><span className="dot dot--couple"></span> Ghế Đôi (Couples)</span>
                                        <span className="legend-item"><span className="dot dot--maintenance"></span> Bảo trì</span>
                                        {!isEditMode && <span className="legend-item"><span className="dot dot--empty"></span> Lối đi/Ô trống</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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