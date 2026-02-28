import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      redirect('/dashboard');
    }
  } catch (e) {
    console.error('Session check failed:', e.message);
  }
  redirect('/login');
}
