import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const resultCode = searchParams.get('resultCode');
        const message = searchParams.get('message');
        if (resultCode !== '0') {
            console.log("Thanh toán bị hủy/thất bại. Lý do:", message);

            navigate('/TrangChu');

        } else {
            console.log("Thanh toán thành công!");
        }

    }, [searchParams, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Đang xử lý kết quả thanh toán...</h2>
        </div>
    );
};

export default PaymentResult;