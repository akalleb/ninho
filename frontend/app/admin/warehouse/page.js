'use client';

import withAdminLayout from '../../../src/layout/withAdminLayout';
import Warehouse from '../../../src/container/ninho/warehouse/Warehouse';

function WarehousePage() {
  return <Warehouse />;
}

export default withAdminLayout(WarehousePage);

