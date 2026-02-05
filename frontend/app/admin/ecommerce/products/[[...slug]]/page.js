'use client';

import withAdminLayout from '../../../../../src/layout/withAdminLayout';
import Product from '../../../../../src/container/ecommerce/product/Products';

// Direct import - no lazy loading for maximum performance
function ProductsRoutesPage() {
  return <Product />;
}

export default withAdminLayout(ProductsRoutesPage);

