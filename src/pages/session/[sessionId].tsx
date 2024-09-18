import { useRouter } from 'next/router'

export default function SessionPage() {
  const { sessionId } = useRouter().query

  return <div>SessionPage {`#${sessionId}`}</div>
}
