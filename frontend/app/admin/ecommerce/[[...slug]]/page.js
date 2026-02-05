'use client';

import { useParams } from 'next/navigation';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

// Direct imports - no lazy loading for maximum performance
import Product from '../../../../src/container/ecommerce/product/Products';
import ProductAdd from '../../../../src/container/ecommerce/product/AddProduct';
import ProductEdit from '../../../../src/container/ecommerce/product/EditProduct';
import ProductDetails from '../../../../src/container/ecommerce/product/ProductDetails';
import Invoice from '../../../../src/container/ecommerce/Invoice';
import Orders from '../../../../src/container/ecommerce/Orders';
import Sellers from '../../../../src/container/ecommerce/Sellers';

function EcommerceRoutesPage() {
  const params = useParams();
  const slug = params?.slug || [];
  const firstSlug = Array.isArray(slug) ? slug[0] || '' : slug || '';
  const firstSlugLower = firstSlug.toLowerCase();

  let Component = null;

  if (firstSlugLower === 'add-product') {
    Component = ProductAdd;
  } else if (firstSlugLower === 'edit-product') {
    Component = ProductEdit;
  } else if (firstSlugLower === 'invoice') {
    Component = Invoice;
  } else if (firstSlugLower === 'orders') {
    Component = Orders;
  } else if (firstSlugLower === 'sellers') {
    Component = Sellers;
  // Cart routes are handled by /app/admin/ecommerce/cart/[[...slug]]/page.js
  // Don't handle cart routes here - let the more specific route handle them
  } else if (firstSlug?.toLowerCase().startsWith('productdetails')) {
    Component = ProductDetails;
  // Products routes are handled by /app/admin/ecommerce/products/[[...slug]]/page.js
  // Don't handle products routes here - let the more specific route handle them
  } else if (!firstSlug) {
    Component = Product;
  }

  if (!Component) {
    return <div>Page not found</div>;
  }

  // Direct render - no dynamic loading, all components loaded immediately
  return <Component />;
}

export default withAdminLayoutNext(EcommerceRoutesPage);

