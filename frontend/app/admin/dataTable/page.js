import { redirect } from 'next/navigation';

export default function LegacyDataTablePage() {
  redirect('/admin/collaborators');
}
