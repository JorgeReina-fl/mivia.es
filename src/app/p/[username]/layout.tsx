import { ReactNode } from 'react'

export default async function ProfileLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  return (
    <>
      <head>
        <link rel="icon" type="image/svg+xml" href={`/api/favicon/${username}`} />
      </head>
      {children}
    </>
  )
}
