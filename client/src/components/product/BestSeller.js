import React, { useEffect, useState, useCallback } from "react";
import { apiGetProducts } from 'apis/product';
import Product from "components/product/Product";
import Slider from 'react-slick';
import useI18n from 'hooks/useI18n';
// import { formatPrice, renderStarFromNumber } from 'ultils/helpers';
// import { useNavigate } from 'react-router-dom';

const getTabs = (t) => [
    { id: 1, name: t('common.best_seller'), key: 'best_seller' },
    { id: 2, name: t('common.new_arrivals_tab'), key: 'new_arrivals' },
    // {id: 3, name: 'tablet'}
];

const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1
            }
        },
        {
            breakpoint: 640,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
};

const BestSeller = () => {
    const { t } = useI18n();
    const [products, setProducts] = useState({
        bestSeller: [],
        newArrivals: []
    });
    const [loading, setLoading] = useState({
        bestSeller: false,
        newArrivals: false
    });
    const [activedTab, setActiveTab] = useState(1);
    // const navigate = useNavigate();

    const fetchProducts = useCallback(async () => {
        const tabKey = activedTab === 1 ? 'bestSeller' : 'newArrivals';
        
        console.log(`Fetching products for ${tabKey}`);
        
        try {
            setLoading(prev => ({ ...prev, [tabKey]: true }));
            
            // Gọi API để lấy sản phẩm thật
            const response = await apiGetProducts({ 
                limit: 10,
                page: 1,
                sort: activedTab === 1 ? '-sold' : '-createdAt' // Best seller: sort by sold, New arrivals: sort by createdAt
            });
            
            console.log('API Response:', response);
            
            if (response?.success && response.products?.length > 0) {
                const productList = response.products || response.productDatas || [];
                console.log('Product List from API:', productList);
                
                // Thêm originalPrice nếu chưa có (để hiển thị giá gốc bị gạch ngang)
                const productsWithOriginalPrice = productList.map(product => ({
                    ...product,
                    originalPrice: product.originalPrice || Math.round(product.price * 1.2) // Tạo giá gốc nếu chưa có
                }));
                
                // Đảm bảo có ít nhất 3 sản phẩm để hiển thị slider
                if (productsWithOriginalPrice.length < 3) {
                    // Nếu API trả về ít sản phẩm, lặp lại để có đủ 3 sản phẩm
                    const repeatedProducts = [];
                    for (let i = 0; i < 3; i++) {
                        repeatedProducts.push({
                            ...productsWithOriginalPrice[i % productsWithOriginalPrice.length],
                            _id: `${productsWithOriginalPrice[i % productsWithOriginalPrice.length]._id}_${i}`
                        });
                    }
                    setProducts(prev => ({ ...prev, [tabKey]: repeatedProducts }));
                } else {
                    setProducts(prev => ({ ...prev, [tabKey]: productsWithOriginalPrice }));
                }
            } else {
                console.log('No products found from API');
                setProducts(prev => ({ ...prev, [tabKey]: [] }));
            }
            
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts(prev => ({ ...prev, [tabKey]: [] }));
        } finally {
            setLoading(prev => ({ ...prev, [tabKey]: false }));
        }
    }, [activedTab]);

    useEffect(() => {
        fetchProducts();
    }, [activedTab, fetchProducts]);

    const currentProducts = activedTab === 1 ? products.bestSeller : products.newArrivals;
    const currentLoading = activedTab === 1 ? loading.bestSeller : loading.newArrivals;
    
    console.log('Current products:', currentProducts);
    console.log('Current loading:', currentLoading);
    console.log('Products state:', products);

    // const handleProductClick = (product) => {
    //     window.scrollTo(0, 0);
    //     navigate(`/${product.category?.toLowerCase()}/${product._id}/${product.title}`);
    // };

    return (
        <div className="w-full h-[629px] flex flex-col">
            <div className="flex items-center border-b">
                <div className="flex px-4">
                    {getTabs(t).map(el => (
                        <span
                            key={el.id}
                            onClick={() => setActiveTab(el.id)}
                            className={`cursor-pointer py-[15px] px-5 text-sm font-semibold uppercase ${
                                activedTab === el.id
                                    ? 'text-main border-b-2 border-main'
                                    : 'hover:text-main'
                            }`}
                        >
                            {el.name}
                        </span>
                    ))}
                </div>
            </div>
            <div className="mt-6 flex-1">
                {currentProducts?.length > 0 ? (
                    <Slider {...settings}>
                        {currentProducts.map((product) => (
                            <div key={product._id} className="px-3 pb-6">
                                <Product
                                    pid={product._id}
                                    data={product}
                                    isNew={true}
                                    tagType={activedTab === 1 ? 'hot' : 'new'}
                                />
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <div className="flex items-center justify-center h-[400px] text-gray-500">
                        {currentLoading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main"></div>
                        ) : (
                            t('common.no_products_in_category')
                        )}
                    </div>
                )}
            </div>
            <div className="w-full flex gap-4 mt-auto">
                <div className="flex-1 relative group overflow-hidden cursor-pointer">
                    <img
                        src="https://digital-world-2.myshopify.com/cdn/shop/files/banner2-home2_2000x_crop_center.png?v=1613166657"
                        alt='banner'
                        className='w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-90'
                    />
                </div>
                <div className="flex-1 relative group overflow-hidden cursor-pointer">
                    <img
                        src="https://digital-world-2.myshopify.com/cdn/shop/files/banner1-home2_2000x_crop_center.png?v=1613166657"
                        alt='banner'
                        className='w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-90'
                    />
                </div>
            </div>
        </div>
    );
};

export default BestSeller;