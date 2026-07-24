import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Secara otomatis mengarahkan user dari /dashboard ke /dashboard/ai (atau inbox)
  redirect('/dashboard/ai');
}
