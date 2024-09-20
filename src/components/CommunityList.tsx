import Image from 'next/image'
import { useRouter } from 'next/router'
import { useApp } from '@/contexts/app.context'
import { Users } from 'lucide-react'

export default function CommunityList() {
  const router = useRouter()
  const { communities } = useApp()

  const handleCommunityClick = (communityId: string) => {
    router.push(`/community/${communityId}`)
  }

  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden">
      <div className="bg-primary px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary-foreground">Your Communities</h2>
        <Users className="text-primary-foreground" size={24} />
      </div>
      <div className="p-4 h-[450px] overflow-y-auto">
        {communities.length > 0 ? (
          <ul className="space-y-4">
            {communities.map((community) => (
              <li
                key={community.id}
                className="flex items-center p-4 rounded-lg bg-background hover:bg-accent/50 transition duration-150 ease-in-out cursor-pointer"
                onClick={() => handleCommunityClick(community.id)}
              >
                <div className="flex items-center space-x-4 flex-grow min-w-0">
                  {community.pfp ? (
                    <Image
                      src={`https://cdn.discordapp.com/icons/${community.guild_id}/${community.pfp}.png`}
                      alt={`${community.name} icon`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full border-2 border-primary/20 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-primary">
                        {community.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-base font-medium text-foreground truncate">
                    {community.name}
                  </span>
                </div>
                {community.leaderboard !== null && (
                  <span className="text-sm font-semibold text-primary whitespace-nowrap ml-4">
                    Rank: #{community.leaderboard.rank}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic text-center mt-8">
            You are not a member of any communities yet.
          </p>
        )}
      </div>
    </div>
  )
}
