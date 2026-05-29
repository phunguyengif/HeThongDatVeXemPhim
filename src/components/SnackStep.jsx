import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSnackQuantity } from '../redux/slices/bookingSlice';
import { fetchAllSnacks } from '../redux/slices/SnackApiSlice';

const SnackStep = () => {
    const dispatch = useDispatch();
    const { snacks: bookingSnacks } = useSelector(state => state.bookingStore);
    const { list: snackList, isLoading } = useSelector(state => state.snackStore);

    useEffect(() => {
        if (snackList.length === 0) {
            dispatch(fetchAllSnacks({
                isActive: true,
                pageNumber: 0,
                pageSize: 50
            }));
        }
    }, [dispatch, snackList.length]);

    return (
        <div className="snack-step-container">
            <h2 className="step-title">CHỌN BẮP NƯỚC</h2>

            {isLoading ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                    Đang tải thực đơn bắp nước...
                </div>
            ) : snackList.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                    Hiện tại rạp chưa phục vụ combo bắp nước nào!
                </div>
            ) : (
                <div className="snack-list-wrapper">
                    {snackList.map(item => {
                        const qty = bookingSnacks[item.id]?.quantity || 0;
                        const imgSrc = item.imageUrl || 'https://via.placeholder.com/150?text=No+Image';

                        return (
                            <div key={item.id} className="snack-horizontal-card">
                                <img className="snack-img-preview" src={imgSrc} alt={item.name}  />

                                <div className="snack-action">
                                    <div className="snack-details">
                                        <p>{item.name}</p>
                                        <span className="category-tag">{item.description || 'Combo Rạp'}</span>

                                        <p className="price-text">{item.price.toLocaleString()} VNĐ</p>
                                    </div>

                                    <div className="snack-counter">
                                        <button onClick={() => dispatch(updateSnackQuantity({
                                            id: item.id,
                                            name: item.name,
                                            price: item.price,
                                            quantity: qty - 1
                                        }))}>-</button>

                                        <span>{qty}</span>

                                        <button onClick={() => dispatch(updateSnackQuantity({
                                            id: item.id,
                                            name: item.name,
                                            price: item.price,
                                            quantity: qty + 1
                                        }))}>+</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SnackStep;