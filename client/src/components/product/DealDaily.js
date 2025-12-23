import React, { useState, useEffect, memo, useCallback } from 'react';
import { apiGetProducts } from '../../apis/product';
import { formatPrice } from '../../ultils/helpers';
import { CountDown } from '..';
import { FaStar } from 'react-icons/fa';
import {LuMenu} from 'react-icons/lu'
import { useNavigate } from 'react-router-dom';
import useI18n from 'hooks/useI18n';

const DealDaily = () => {
    const navigate = useNavigate();
    const { t } = useI18n();
    const [dealProduct, setDealProduct] = useState(null);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [second, setSecond] = useState(0);
    const [expireTime, setExpireTime] = useState(false);

    const fetchDealDaily = useCallback(async () => {
        try {
            let response = await apiGetProducts({
                limit: 1,
                page: Math.round(Math.random() * 5) + 1
            });

            if (response.success && response.products && response.products.length > 0) {
                const product = response.products[0];
                product.originalPrice = product.price;
                product.price = Math.round(product.price * 0.8);
                
                setDealProduct(product);
                
                // Tạo thời gian hết hạn là 24 giờ kể từ thời điểm hiện tại
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1); // Thêm 1 ngày
                tomorrow.setHours(0, 0, 0, 0); // Set về 00:00:00

                // Lưu deal và thời gian vào localStorage
                localStorage.setItem('dealDaily', JSON.stringify(product));
                const dealTime = {
                    expireAt: tomorrow.getTime()
                };
                localStorage.setItem('dealTime', JSON.stringify(dealTime));
                
                // Tính toán thời gian còn lại
                const timeLeft = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
                updateCountdown(timeLeft);
                setExpireTime(false);
            } else {
                console.log('Không tìm thấy sản phẩm mới');
                // Thử lấy sản phẩm khác nếu không tìm thấy sản phẩm
                if (dealProduct) {
                    // Nếu đã có sản phẩm trước đó, thử lấy sản phẩm khác
                    fetchDealDaily();
                } else {
                    setExpireTime(false);
                }
            }
        } catch (error) {
            console.log(error);
            // Thử lấy sản phẩm khác nếu có lỗi
            if (dealProduct) {
                fetchDealDaily();
            } else {
                setExpireTime(false);
            }
        }
    }, []);

    const updateCountdown = (timeLeft) => {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        setHour(hours);
        setMinute(minutes);
        setSecond(seconds);
    };

    useEffect(() => {
        const savedDeal = localStorage.getItem('dealDaily');
        const savedTime = localStorage.getItem('dealTime');
        
        if (savedDeal && savedTime) {
            try {
                const dealTime = JSON.parse(savedTime);
                const now = new Date().getTime();
                
                if (dealTime.expireAt > now) {
                    setDealProduct(JSON.parse(savedDeal));
                    const timeLeft = Math.floor((dealTime.expireAt - now) / 1000);
                    updateCountdown(timeLeft);
                    setExpireTime(false);
                } else {
                    setExpireTime(true);
                    localStorage.removeItem('dealDaily');
                    localStorage.removeItem('dealTime');
                    fetchDealDaily();
                }
            } catch (error) {
                console.log(error);
                localStorage.removeItem('dealDaily');
                localStorage.removeItem('dealTime');
                fetchDealDaily();
            }
        } else {
            fetchDealDaily();
        }
    }, [fetchDealDaily]);

    useEffect(() => {
        let intervalId;
        if (!expireTime) {
            intervalId = setInterval(() => {
                const savedTime = localStorage.getItem('dealTime');
                if (savedTime) {
                    const dealTime = JSON.parse(savedTime);
                    const now = new Date().getTime();
                    
                    if (dealTime.expireAt > now) {
                        const timeLeft = Math.floor((dealTime.expireAt - now) / 1000);
                        updateCountdown(timeLeft);
                    } else {
                        clearInterval(intervalId);
                        setExpireTime(true);
                        localStorage.removeItem('dealDaily');
                        localStorage.removeItem('dealTime');
                        fetchDealDaily();
                    }
                }
            }, 1000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [expireTime]);

    useEffect(() => {
        if (expireTime) {
            fetchDealDaily();
        }
    }, [expireTime, fetchDealDaily]);

    const handleClickProduct = () => {
        if (dealProduct) {
            window.scrollTo(0, 0);
            navigate(`/${dealProduct?.category?.toLowerCase()}/${dealProduct?._id}/${dealProduct?.title}`);
        }
    };

    return (
        <div className="w-full h-[629px] border flex flex-col overflow-hidden">
            <div className="flex items-center p-4 border-b">
                <span className="flex-1 flex justify-center"><FaStar size={20} color="#DD1111" /></span>
                <span className="flex-8 font-semibold text-[16px] lg:text-[20px] text-center uppercase">{t('common.daily_deals')}</span>
                <span className="flex-1"></span>
            </div>
            <div className="w-full flex flex-col items-center pt-8 px-4 gap-2">
                {dealProduct && (
                    <>
                        <div 
                            onClick={handleClickProduct}
                            className='w-full cursor-pointer'
                        >
                            <img 
                                src={
                                    dealProduct?.thumb && dealProduct?.thumb !== ""
                                        ? dealProduct.thumb
                                        : (dealProduct?.images && dealProduct.images.length > 0
                                            ? dealProduct.images[0]
                                            : 'https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png'
                                        )
                                }
                                alt={dealProduct?.title} 
                                className="w-full object-contain"
                            />
                        </div>
                        <h4 
                            className="text-center text-xs lg:text-sm line-clamp-1 hover:text-main cursor-pointer"
                            onClick={handleClickProduct}
                        >
                            {dealProduct?.title}
                        </h4>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-center text-gray-400 text-sm lg:text-base line-through">
                                {formatPrice(dealProduct?.originalPrice)} VND
                            </span>
                            <span className="text-center text-main text-base lg:text-lg font-semibold">
                                {formatPrice(dealProduct?.price)} VND
                            </span>
                        </div>
                    </>
                )}
            </div>
            <div className="px-4 mt-8 pb-4">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <CountDown unit={t('common.hours')} number={hour} />
                    <CountDown unit={t('common.minutes')} number={minute} />
                    <CountDown unit={t('common.seconds')} number={second} />
                </div>
                <button 
                    type="button"
                    className="flex gap-2 items-center justify-center w-full bg-main hover:bg-gray-800 text-white font-medium py-2 text-sm lg:text-base"
                    onClick={handleClickProduct}
                >
                    <LuMenu />{t('common.options')}
                </button>
            </div>
        </div>
    );
};

export default memo(DealDaily);
