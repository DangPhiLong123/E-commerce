import React, { useEffect, useState } from 'react'
import { VoteBar } from '..'
import { FaStar } from 'react-icons/fa'
import { VoteOption } from '..'
import { apiRatings, apiGetUser } from '../../apis/product'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { showModal } from '../../store/appSlice'
import Login from '../../pages/public/Login'

const Ratings = ({ totalRatings, ratings, totalCount, pid, rerender, title }) => {
    const [ratingArr, setRatingArr] = useState([])
    const [isVoteNow, setIsVoteNow] = useState(false)
    const [usersData, setUsersData] = useState({})  // Lưu trữ thông tin người dùng
    const { isLoggedIn, current } = useSelector(state => state.user)
    const dispatch = useDispatch()

    useEffect(() => {
        const arr = []
        for (let i = 1; i <= 5; i++) {
            const ratingCount = ratings?.filter(item => item.star === i)?.length || 0
            arr.push({
                star: i,
                count: ratingCount,
                percent: Math.round((ratingCount * 100) / totalCount) || 0
            })
        }
        setRatingArr(arr.reverse())
    }, [ratings, totalCount])

    // Thêm useEffect để lấy thông tin người dùng
    useEffect(() => {
        const fetchUsersData = async () => {
            try {
                // Lấy danh sách unique userIds từ ratings
                const userIds = [...new Set(ratings?.map(rating => rating.postedBy))]
                
                // Lấy thông tin cho mỗi userId
                const promises = userIds.map(async (userId) => {
                    if (!userId) return null;
                    try {
                        const response = await apiGetUser(userId);
                        if (response.success) {
                            return { [userId]: response.userData };
                        }
                        return null;
                    } catch (error) {
                        console.error('Error fetching user', userId);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                const usersInfo = results.reduce((acc, curr) => {
                    if (curr) {
                        return { ...acc, ...curr };
                    }
                    return acc;
                }, {});

                setUsersData(usersInfo);
            } catch (error) {
                console.error('Error in fetchUsersData:', error);
            }
        };

        if (ratings?.length > 0) {
            fetchUsersData();
        }
    }, [ratings]);

    const handleSubmitVote = async (data) => {
        if (!data.score || !data.comment) {
            toast.warning('Please vote star and comment')
            return
        }
        const response = await apiRatings({
            star: data.score,
            comment: data.comment,
            pid,
        })
        if (response.success) {
            toast.success('Thank you for rating this product')
            setIsVoteNow(false)
            rerender()
        }
    }

    const handleVoteNow = () => {
        if (!isLoggedIn) {
            toast.warn('Please login to vote and comment', {
                position: "top-center",
                autoClose: 3000
            })
            dispatch(showModal({ isShowModal: true, modalChildren: <Login /> }))
            return
        }
        setIsVoteNow(true)
    }

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        // Nếu dưới 1 phút
        if (diffInSeconds < 60) {
            return 'a few seconds ago';
        }
        
        // Nếu dưới 1 giờ, hiển thị số phút
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        }
        
        // Nếu dưới 1 ngày, hiển thị số giờ
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        }
        
        // Nếu dưới 1 tháng, hiển thị số ngày
        if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
        
        // Nếu dưới 1 năm, hiển thị số tháng
        if (diffInSeconds < 31536000) {
            const months = Math.floor(diffInSeconds / 2592000);
            return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        }
        
        // Nếu trên 1 năm
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }

    const formatUserName = (postedBy) => {
        // Nếu là ID của current user
        if (current?._id === postedBy) {
            return `${current.firstname} ${current.lastname}`;
        }

        // Lấy thông tin từ usersData
        const userData = usersData[postedBy];
        if (userData) {
            return `${userData.firstname} ${userData.lastname}`;
        }

        // Lấy 4 ký tự cuối của MongoDB ObjectId
        // Format của MongoDB ObjectId là: "67ed91771c3e3dd23aac5f00"
        const lastFourChars = postedBy?.toString().replace(/[^a-zA-Z0-9]/g, '').slice(-4);
        return `User ${lastFourChars || '????'}`;
    }

    return (
        <div className='flex flex-col p-4'>
            <div className='flex'>
                <div className='flex-4 flex flex-col items-center justify-center'>
                    <span className='font-semibold text-3xl'>{`${totalRatings}/5`}</span>
                    <div className='flex items-center gap-1'>
                        {Array.from(Array(5).keys()).map((item, index) => (
                            <span key={index}>
                                <FaStar color={index < Math.round(totalRatings) ? '#f59e0b' : '#ccc'} />
                            </span>
                        ))}
                    </div>
                    <span className='text-sm text-gray-500'>{`${totalCount} reviewers and commentors`}</span>
                </div>
                <div className='flex-6 flex flex-col gap-1'>
                    {ratingArr.map(item => (
                        <VoteBar 
                            key={item.star}
                            number={item.star}
                            ratingCount={item.count}
                            ratingTotal={totalCount}
                        />
                    ))}
                </div>
            </div>
            <div className='flex flex-col items-center gap-4 mt-8'>
                <span className='text-sm font-semibold'>Do you review this product?</span>
                <button 
                    className='w-fit px-4 py-2 rounded-md text-white font-semibold bg-main hover:bg-main/90'
                    onClick={handleVoteNow}
                >
                    Vote now!
                </button>
            </div>
            <div className='flex flex-col gap-4 mt-8'>
                {ratings?.map((rating, index) => (
                    <div key={index} className='flex flex-col gap-2 border-b pb-4'>
                        <div className='flex items-center gap-2'>
                            <img 
                                src={usersData[rating.postedBy]?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formatUserName(rating.postedBy))}&background=random`} 
                                alt="user" 
                                className='w-10 h-10 rounded-full object-cover'
                            />
                            <div>
                                <h3 className='font-semibold'>{formatUserName(rating.postedBy)}</h3>
                                <span className='text-sm text-gray-500'>{formatDate(rating.createdAt)}</span>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='flex items-center gap-1'>
                                {Array.from(Array(5).keys()).map((star, index) => (
                                    <FaStar 
                                        key={index} 
                                        color={index < rating.star ? '#f59e0b' : '#ccc'} 
                                        size={14}
                                    />
                                ))}
                            </span>
                        </div>
                        <p className='text-sm text-gray-600'>{rating.comment}</p>
                    </div>
                ))}
            </div>
            {isVoteNow && (
                <VoteOption 
                    nameProduct={title || 'this product'}
                    handleSubmitVote={handleSubmitVote}
                    handleCloseVote={() => setIsVoteNow(false)}
                />
            )}
        </div>
    )
}

export default Ratings
