import CommunityList from '@/components/CommunityList'
import Leaderboard from '@/components/Leaderboard'
import Layout from '@/components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CommunityList />
          <Leaderboard />
        </div>
      </div>
    </Layout>
  )
}
