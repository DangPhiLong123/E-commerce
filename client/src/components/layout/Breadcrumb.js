import React from 'react'
import useBreadcrumb from 'use-react-router-breadcrumbs'
import { Link } from 'react-router-dom';
import { FaAngleRight } from 'react-icons/fa';



const Breadcrumb = ({title, category}) => {
    const routes = [
        { path: "/:category", breadcrumb: category },
        { path: "/", breadcrumb: " Home" },
        { path: "/:category/:pid/:title", breadcrumb: title },

        
        
      ];
    const breadcrumb = useBreadcrumb(routes)
    return (
        <div className='text-sm flex items-center gap-1'>
            {breadcrumb?.filter(el => !el.match.route === false).map(({ match, breadcrumb }, index, self ) => (
                <Link className='flex items-center gap-1 hover:text-main' key={match.pathname} to={match.pathname}>
                    <span>{breadcrumb} </span>
                    {index !== self.length - 1 && <FaAngleRight className='text-gray-500'/>}
                </Link>
            ))}
        </div>
    )
    }

export default Breadcrumb
