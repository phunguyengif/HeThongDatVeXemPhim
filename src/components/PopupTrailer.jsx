import React from 'react';

const PopupTrailer = ({ type, url, onClose, videoRef }) => {
    // Nếu không có url thì không render gì cả (giống logic {preview...Url && ...} của bạn)
    if (!url) return null;

    // Trả về giao diện chính xác của Poster
    if (type === 'poster') {
        return (
            <div className="preview-popup" onClick={onClose}>
                <div className="preview-popup__content preview-popup__content--poster">
                    <img src={url} alt="Poster" />
                    <span className="preview-popup__close-hint">Nhấp chuột ra ngoài để đóng</span>
                </div>
            </div>
        );
    }

    // Trả về giao diện chính xác của Trailer (Video)
    if (type === 'video') {
        return (
            <div className="preview-popup">
                <div className="preview-popup__backdrop" onClick={onClose}></div>
                <div className="preview-popup__content preview-popup__content--video">
                    <video
                        ref={videoRef}
                        src={url}
                        controls
                        autoPlay
                        className="preview-popup__video-player"
                    />
                    <button className="preview-popup__close-btn" onClick={onClose}>
                        Đóng ✕
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default PopupTrailer;