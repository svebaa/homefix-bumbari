"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"

export default function ChooseRolePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSelect(role) {
    try {
      setLoading(true)
      await updateRole(role)
    } catch (err) {
      setError("Došlo je do pogreške prilikom odabira uloge.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <CardTitle>Odaberite svoju ulogu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Odaberite kako ćete koristiti HomeFix:
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={() => handleSelect("majstor")} disabled={loading}>
            Majstor
          </Button>
          <Button onClick={() => handleSelect("stanar")} disabled={loading}>
            Stanar
          </Button>
          <Button onClick={() => handleSelect("predstavnik")} disabled={loading}>
            <Link href="/register/representative">Predstavnik stanara</Link>
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
      </CardContent>
    </Card>   
    </div>
  )
}