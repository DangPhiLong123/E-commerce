import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { FaCalendarAlt, FaComment } from 'react-icons/fa';
import useI18n from 'hooks/useI18n';

const BlogPosts = () => {
  const { t } = useI18n();

  const blogData = [
    {
      id: 1,
      image: 'https://digital-world-2.myshopify.com/cdn/shop/articles/Photoroom_20250620_92041_CH_1.png?v=1750843003',
      title: 'THESE ARE THE 5 BEST PHONES YOU CAN BUY RIGHT NOW',
      date: 'December 13, 2016',
      comments: 1,
      description: "From high-priced pocket-busters to our favorite budget beauties. You're up to date on everything you need to know before buying a phone, and now the..."
    },
    {
      id: 2,
      image: 'https://digital-world-2.myshopify.com/cdn/shop/articles/Photoroom_20250620_91904_CH.png?v=1750843029',
      title: "APPLE'S NEW TV APP GOES LIVE WITH UNIFIED SEARCH",
      date: 'December 13, 2016',
      comments: 1,
      description: "An update to Apple's iOS mobile software also brings hundreds of new emojis to your iPhone and iPad -- and keeps that beloved butt-looking peach..."
    },
    {
      id: 3,
      image: 'https://digital-world-2.myshopify.com/cdn/shop/articles/blog1.jpg?v=1492594896',
      title: 'IN 2017, YOUR PHONE\'S CAMERA WILL HAVE SUPERPOWERS',
      date: 'December 13, 2016',
      comments: 1,
      description: "Virtual reality is a somewhat understandable concept in 2016. You put on a headset, you find yourself in 3D worlds. But augmented reality -- AR..."
    }
  ];

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
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

  return (
    <div className='w-full'>
      <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-main'>
        {t('common.blog_post')}
      </h3>
      <div className='mt-6'>
        <Slider {...settings}>
          {blogData.map((blog) => (
            <div key={blog.id} className='px-3'>
              <div className='border hover:shadow-lg transition-shadow duration-300 bg-white'>
                {/* Blog Image */}
                <div className='relative overflow-hidden'>
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className='w-full h-[250px] object-cover transition-transform duration-300 hover:scale-105'
                  />
                </div>

                {/* Blog Content */}
                <div className='p-6'>
                  {/* Blog Title */}
                  <h4 className='text-base font-bold uppercase text-gray-800 mb-3 line-clamp-2 hover:text-main transition-colors'>
                    <Link to={`/blogs/${blog.id}`}>
                      {blog.title}
                    </Link>
                  </h4>

                  {/* Blog Metadata */}
                  <div className='flex items-center gap-4 mb-3 text-sm text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <FaCalendarAlt size={12} />
                      <span>{blog.date}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <FaComment size={12} />
                      <span>{blog.comments} comment{blog.comments > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Blog Description */}
                  <p className='text-sm text-gray-600 leading-relaxed line-clamp-3'>
                    {blog.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default BlogPosts;
