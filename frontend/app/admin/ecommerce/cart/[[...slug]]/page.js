'use client';

import withAdminLayout from '../../../../../src/layout/withAdminLayout';
import Cart from '../../../../../src/container/ecommerce/Cart';

// Direct import - no lazy loading for maximum performance
function CartRoutesPage() {
  return <Cart />;
}

export default withAdminLayout(CartRoutesPage);
