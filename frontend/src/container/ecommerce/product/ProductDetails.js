'use client';

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useParams as useNextParams, useRouter } from 'next/navigation';
import { NextLink } from '../../../components/utilities/NextLink';
import { usePathname } from 'next/navigation';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { filterSinglePage } from '../../../redux/product/actionCreator';
import { ProductDetailsWrapper } from '../Style';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Button } from '../../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../../components/buttons/calendar-button/calendar-button';
import { getImageUrl } from '../../../utility/getImageUrl';

// Direct import - no lazy loading needed since route already uses dynamic()
import DetailsRight from './overview/DetailsRight';

function ProductDetails() {
  const nextParams = useNextParams();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const { products, product } = useSelector(state => {
    return {
      product: state.product.data,
      products: state.products.data,
    };
  });

  // Extract product ID from Next.js route
  // URL format: /admin/ecommerce/productDetails/1 or /admin/ecommerce/productDetails1
  let productId = null;
  if (pathname) {
    // Extract ID from pathname (e.g., "/admin/ecommerce/productDetails/1" -> "1")
    const match = pathname.match(/productDetails\/?(\d+)/i);
    if (match && match[1]) {
      productId = match[1];
    } else if (nextParams?.slug) {
      // Fallback: extract from slug array
      const slug = Array.isArray(nextParams.slug) ? nextParams.slug[0] : nextParams.slug;
      if (slug && slug.toLowerCase().startsWith('productdetails')) {
        const idMatch = slug.match(/\d+/);
        if (idMatch) {
          productId = idMatch[0];
        }
      }
    }
  }

  useEffect(() => {
    if (filterSinglePage && productId && products && products.length > 0) {
      dispatch(filterSinglePage(parseInt(productId, 10), products));
    }
  }, [productId, dispatch, products]);

  // Safety check: don't render until product data is loaded
  // Check product exists and is an array before accessing product[0]
  if (!product || !Array.isArray(product) || product.length === 0) {
    return (
      <>
        <PageHeader ghost title="Product Details" />
        <Main>
          <Cards headless>
            <Skeleton active />
          </Cards>
        </Main>
      </>
    );
  }

  // Safely get the first product and check if it exists
  const currentProduct = product && product.length > 0 ? product[0] : null;
  if (!currentProduct || typeof currentProduct !== 'object') {
    return (
      <>
        <PageHeader ghost title="Product Details" />
        <Main>
          <Cards headless>
            <Skeleton active />
          </Cards>
        </Main>
      </>
    );
  }

  // Now safely destructure - we know currentProduct exists
  const { img = '', category = '' } = currentProduct || {};

  // Memoize filtered products for slider to avoid re-filtering on every render
  const relatedProducts = useMemo(() => {
    if (!products || !Array.isArray(products) || products.length === 0 || !category) {
      return [];
    }
    return products
      .filter(value => value.category === category)
      .slice(0, 4); // Get first 4 related products
  }, [products, category]);

  return (
    <>
      <PageHeader
        ghost
        title="Product Details"
        buttons={[
          <div key="1" className="page-header-actions">
            <CalendarButtonPageHeader key="1" />
            <ExportButtonPageHeader key="2" />
            <ShareButtonPageHeader key="3" />
            <Button size="small" key="4" type="primary">
              <FeatherIcon icon="plus" size={14} />
              Add New
            </Button>
          </div>,
        ]}
      />
      <Main>
        <Cards headless>
          <ProductDetailsWrapper>
            <div className="product-details-box">
              <Row gutter={30}>
                <Col xs={24} lg={10}>
                  <div className="product-details-box__left pdbl">
                    <figure>
                      <img className="w-100" src={getImageUrl(img)} alt="" />
                    </figure>
                    <div className="pdbl__slider pdbs">
                      <Row gutter={5}>
                        {relatedProducts.length > 0
                          ? relatedProducts.map((value) => (
                              <Col md={4} key={value.id}>
                                <div className="pdbl__image">
                                  <figure>
                                    <div
                                      className="cursor-pointer"
                                      onClick={() => {
                                        router.push(`/admin/ecommerce/productDetails/${value.id}`);
                                      }}
                                      role="link"
                                      tabIndex={0}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          router.push(`/admin/ecommerce/productDetails/${value.id}`);
                                        }
                                      }}
                                    >
                                      <img
                                        className="w-100"
                                        src={getImageUrl(value.img)}
                                        alt=""
                                        loading="eager"
                                        decoding="async"
                                      />
                                    </div>
                                  </figure>
                                </div>
                              </Col>
                            ))
                          : null}
                      </Row>
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={14}>
                  <DetailsRight product={currentProduct} />
                </Col>
              </Row>
            </div>
          </ProductDetailsWrapper>
        </Cards>
      </Main>
    </>
  );
}

export default ProductDetails;
