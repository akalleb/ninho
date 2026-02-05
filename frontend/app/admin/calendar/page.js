'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import Calendars from '../../../src/container/Calendar';

// Direct import - no lazy loading for maximum performance
function CalendarPage() {
  return <Calendars />;
}

export default withAdminLayoutNext(CalendarPage);

