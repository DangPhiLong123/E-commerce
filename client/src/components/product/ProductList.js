import React from 'react';
import Product from './Product';
import Masonry from 'react-masonry-css';

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const ProductList = ({ products }) => {
  if (!products) return null;

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid flex mx-[-10px]"
      columnClassName="my-masonry-grid_column"
    >
      {products.map(el => (
        <Product
          key={el._id}
          pid={el._id}
          data={el}
          normal={true}
        />
      ))}
    </Masonry>
  );
};

export default ProductList;