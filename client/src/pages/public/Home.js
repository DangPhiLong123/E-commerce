import React, { useEffect } from "react";
import { Banner, Sidebar, BestSeller, DealDaily, FeatureProduct, NewArrivals, HotCollections, BlogPosts, CollapsibleSection } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from 'react-router-dom'
import { clearCart } from 'store/cartSlice'

const Home = () => {
  const dispatch = useDispatch()
  const { current } = useSelector(state => state.user)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const paid = searchParams.get('paid')
    if (!paid) return
    if (paid === 'success') {
      dispatch(clearCart())
      if (current?._id) localStorage.removeItem(`cart_${current._id}`)
      alert('Thanh toán thành công!')
    } else if (paid === 'fail') {
      alert('Thanh toán thất bại!')
    } else if (paid === 'invalid') {
      alert('Chữ ký không hợp lệ!')
    } else if (paid === 'error') {
      alert('Có lỗi khi xử lý thanh toán!')
    }
    // Xóa tham số để tránh lặp lại thông báo khi refresh
    searchParams.delete('paid')
    setSearchParams(searchParams, { replace: true })
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <div className="w-full flex flex-col">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="w-full">
            <Banner />
          </div>
          <div className="w-full mt-4">
            <DealDaily />
          </div>
          <div className="w-full mt-4">
            <CollapsibleSection titleKey="common.best_seller">
              <BestSeller />
            </CollapsibleSection>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            <div className="w-full lg:w-[292px] order-1 lg:order-1">
              <Sidebar />
            </div>
            <div className="flex-1 order-2 lg:order-2">
              <Banner />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row mt-8 gap-4">
            <div className="w-full lg:w-[292px] order-1 lg:order-1 flex flex-col">
              <DealDaily />
            </div>
            <div className="flex-1 order-2 lg:order-2 px-4 overflow-hidden">
              <BestSeller />
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Layout for FeatureProduct, NewArrivals, HotCollections */}
      <div className="lg:hidden">
        <div className="my-2 px-4">
          <CollapsibleSection titleKey="common.featured_products">
            <FeatureProduct />
          </CollapsibleSection>
        </div>
        <div className="my-2 px-4">
          <CollapsibleSection titleKey="common.new_arrivals">
            <NewArrivals />
          </CollapsibleSection>
        </div>
        <div className="my-2 px-4">
          <CollapsibleSection titleKey="common.hot_collections">
            <HotCollections />
          </CollapsibleSection>
        </div>
        <div className="my-2 px-4">
          <BlogPosts />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="my-2 px-4">
          <FeatureProduct />
        </div>
        <div className="my-2 px-4">
          <NewArrivals />
        </div>
        <div className="my-2 px-4">
          <HotCollections />
        </div>
        <div className="my-2 px-4">
          <BlogPosts />
        </div>
      </div>
       
    </>
  );
};

export default Home;