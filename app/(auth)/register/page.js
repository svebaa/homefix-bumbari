import { RegisterForm } from '@/components/auth/register-form'

export const metadata = {
  title: 'Registracija | HomeFix',
  description: 'Kreirajte novi HomeFix račun',
}

export default async function RegisterPage({searchParams}) {
  const SearchParams = await searchParams;
  const error = SearchParams.error || null;
  return <RegisterForm initialError={error} />
}
