import Image from 'next/image'
import { useRouter } from 'next/router'
import { useApp } from '@/contexts/app.context'
import { Trophy } from 'lucide-react'

export default function Leaderboard() {
  const router = useRouter()
  const { leaderboardData } = useApp()

  const handleCommunityClick = (communityId: string) => {
    router.push(`/community/${communityId}`)
  }

  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden">
      <div className="bg-primary px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary-foreground">Global Leaderboard</h2>
        <Trophy className="text-primary-foreground" size={24} />
      </div>
      <div className="p-4 h-[450px] overflow-y-auto">
        {leaderboardData.length > 0 ? (
          <ul className="space-y-4">
            {leaderboardData.map((entry, index) => (
              <li
                key={entry.community_id}
                className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-accent/50 transition duration-150 ease-in-out cursor-pointer"
                onClick={() => handleCommunityClick(entry.community.id)}
              >
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-lg w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                    {index + 1}
                  </span>
                  {entry.community.pfp ? (
                    <Image
                      src={`https://cdn.discordapp.com/icons/${entry.community.guild_id}/${entry.community.pfp}.png`}
                      alt={`${entry.community.name} icon`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {entry.community.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-base font-medium text-foreground truncate max-w-[150px]">
                    {entry.community.name}
                  </span>
                </div>
                <span className="text-base font-semibold text-primary whitespace-nowrap">
                  {entry.all_time_high_score} pts
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic text-center mt-8">
            No leaderboard data available yet.
          </p>
        )}
      </div>
    </div>
  )
}
