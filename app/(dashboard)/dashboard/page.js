import { getUser } from '@/lib/actions/auth-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Dashboard | HomeFix',
  description: 'Vaš HomeFix dashboard',
}

export default async function DashboardPage() {
  const user = await getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Dobrodošli natrag!
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">
          Ovo je vaš HomeFix dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Vaš Profil</CardTitle>
            <CardDescription>Informacije o vašem računu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Email:</span>{' '}
                <span className="text-slate-600 dark:text-slate-300">{user?.email}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium">ID:</span>{' '}
                <span className="text-slate-600 dark:text-slate-300 font-mono text-xs">
                  {user?.id}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brzi Pristup</CardTitle>
            <CardDescription>Često korištene funkcije</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ovdje će biti prikazane brze funkcije aplikacije
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistika</CardTitle>
            <CardDescription>Vaša aktivnost</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Statistika će biti prikazana ovdje
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
