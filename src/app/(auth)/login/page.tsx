import { LoginForm } from './LoginForm'

type Props = {
  searchParams: Promise<{ message?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { message } = await searchParams
  return <LoginForm message={message} />
}
