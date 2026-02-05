import React from 'react';
import { Rate, Row, Col } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { NextLink } from '../../../../components/utilities/NextLink';
import Heading from '../../../../components/heading/heading';
import { Button } from '../../../../components/buttons/buttons';
import { ProductCard } from '../../Style';
import { updateWishList } from '../../../../redux/product/actionCreator';
import { getImageUrl } from '../../../../utility/getImageUrl';

function ProductCardsList({ product }) {
  const { id, name, rate, price, oldPrice, popular, img, description } = product;
  const dispatch = useDispatch();

  return (
    <ProductCard className="list-view mb-20">
      <div className="product-list">
        <Row gutter={15}>
          <Col md={6} xs={24}>
            <figure>
              <img className="w-100" src={getImageUrl(img)} alt="" />
            </figure>
          </Col>
          <Col md={12} xs={24}>
            <div className="product-single-description">
              <Heading className="product-single-title" as="h5">
                <NextLink href={`/admin/ecommerce/productDetails/${id}`}>{name}</NextLink>
              </Heading>
              <p>{description}</p>
            </div>
          </Col>
          <Col md={6} xs={24}>
            <div className="product-single-info">
              <span onClick={() => dispatch(updateWishList(id))} className="btn-heart cursor-pointer">
                <FeatherIcon
                  icon="heart"
                  size={14}
                  color={popular ? '#FF4D4F' : '#9299B8'}
                  fill={popular ? '#FF4D4F' : 'none'}
                />
              </span>
              <p className="product-single-price">
                <span className="product-single-price__new">${price} </span>
                {oldPrice && (
                  <>
                    <del> ${oldPrice} </del>
                    <span className="product-single-price__offer"> 60% Off</span>
                  </>
                )}
              </p>
              <div className="product-single-rating">
                <Rate allowHalf defaultValue={rate} disabled /> 4.9
                <span className="total-reviews"> 778 Reviews</span>
              </div>
              <div className="product-single-action">
                <Button className="btn-cart" size="small" type="white" outlined>
                  <FeatherIcon icon="shopping-bag" size={14} />
                  Add To Cart
                </Button>
                <Button size="small" type="primary">
                  Buy Now
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </ProductCard>
  );
}

ProductCardsList.propTypes = {
  product: PropTypes.object,
};

export default ProductCardsList;
