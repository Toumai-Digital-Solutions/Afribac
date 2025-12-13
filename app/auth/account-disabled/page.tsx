'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AccountDisabledPage() {
  const sp = useSearchParams()
  const status = sp.get('status') || 'suspended'

  const title = status === 'deleted' ? 'Compte supprimé' : 'Compte suspendu'
  const message =
    status === 'deleted'
      ? 'Ce compte a été supprimé. Contactez un administrateur si vous pensez qu’il s’agit d’une erreur.'
      : 'Ce compte est suspendu. Contactez un administrateur pour réactiver l’accès.'

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Link href="/auth/signin">
            <Button className="w-full">Retour à la connexion</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">Accueil</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}


