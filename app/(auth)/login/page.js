import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Prijava | HomeFix',
  description: 'Prijavite se u svoj HomeFix račun',
}

export default async function LoginPage({searchParams}) {
  const SearchParams = await searchParams;
  const error = SearchParams.error || null;
  return <LoginForm initialError={error} />
}
