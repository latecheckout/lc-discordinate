import Layout from '@/components/Layout'
import { useApp } from '@/contexts/app.context'
import { useAuth } from '@/contexts/auth.context'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function Home() {
  const { user } = useAuth()
  const { communities } = useApp()
  const router = useRouter()

  const handleCommunityClick = (communityId: string) => {
    router.push(`/community/${communityId}`)
  }

  return (
    <Layout>
      <div className="bg-card shadow-xl rounded-lg overflow-hidden">
        <div className="bg-primary px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-primary-foreground">Welcome, {user?.email}</h1>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Communities</h2>
          {communities && communities.length > 0 ? (
            <ul className="divide-y divide-border">
              {communities.map((community, index) => (
                <li
                  key={index}
                  className="py-4 flex items-center hover:bg-accent transition duration-150 ease-in-out cursor-pointer px-4 rounded-lg"
                  onClick={() => handleCommunityClick(community.id)}
                >
                  <div className="flex items-center">
                    {community.pfp ? (
                      <Image
                        src={`https://cdn.discordapp.com/icons/${community.guild_id}/${community.pfp}.png`}
                        alt={`${community.name} icon`}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full mr-4 border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full mr-4 bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {community.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-base font-medium text-foreground">{community.name}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">
              You are not a member of any communities yet.
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}
