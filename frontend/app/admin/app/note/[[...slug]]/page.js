'use client';

import Note from '../../../../../src/container/note/Note';
import withAdminLayoutNext from '../../../../../src/layout/withAdminLayoutNext';

// Direct import - no lazy loading for maximum performance
function NoteRoutesPage() {
  return <Note />;
}

export default withAdminLayoutNext(NoteRoutesPage);
