'use client';

import Calendar from '../../../../../src/container/calendar/Calendar';
import withAdminLayoutNext from '../../../../../src/layout/withAdminLayoutNext';

// Direct import - no lazy loading for maximum performance
function CalendarRoutesPage() {
  return <Calendar />;
}

export default withAdminLayoutNext(CalendarRoutesPage);
