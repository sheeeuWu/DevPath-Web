const STATS_URL =
  process.env.NEXT_PUBLIC_GITHUB_STATS_URL ??
  'https://github-readme-stats-salesp07.vercel.app';
const STREAK_URL =
  process.env.NEXT_PUBLIC_GITHUB_STREAK_URL ??
  'https://github-readme-streak-stats-salesp07.vercel.app';
import Image from 'next/image';
import {
  BookOpen,
  Star,
  Users,
  GitMerge,
  Code2,
  Plus,
  Github,
} from 'lucide-react';
import { GIT_FALLBACK_STATS } from '@/lib/github';

export default function GithubStats({ user }: { user: any }) {
  if (!user.githubStats?.connected) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
        <Github className="text-primary" size={20} /> GitHub Activity
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="flex flex-col items-center p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
          <BookOpen className="mb-2 text-primary h-6 w-6" />
          <span className="text-2xl font-bold">
            {user.githubStats.repos || 0}
          </span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-center">
            Repositories
          </span>
        </div>
        <div className="flex flex-col items-center p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
          <Star className="mb-2 text-yellow-500 h-6 w-6" />
          <span className="text-2xl font-bold">
            {user.githubStats.totalStars || 0}
          </span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-center">
            Total Stars
          </span>
        </div>
        <div className="flex flex-col items-center p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
          <Users className="mb-2 text-blue-500 h-6 w-6" />
          <span className="text-2xl font-bold">
            {user.githubStats.followers || 0}
          </span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-center">
            Followers
          </span>
        </div>
        <div className="flex flex-col items-center p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
          <GitMerge className="mb-2 text-purple-500 h-6 w-6" />
          <span className="text-2xl font-bold">
            {user.githubStats.following || 0}
          </span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-center">
            Following
          </span>
        </div>
        <div className="flex flex-col items-center p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
          <Code2 className="mb-2 text-emerald-500 h-6 w-6" />
          <span className="text-2xl font-bold">
            {(
              user.githubStats.linesContributed ??
              GIT_FALLBACK_STATS[
                (user.githubStats.username || '').toLowerCase()
              ]?.additions ??
              0
            ).toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-center">
            Lines Contributed
          </span>
        </div>
        <div className="flex flex-col items-center p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
          <GitMerge className="mb-2 text-orange-500 h-6 w-6" />
          <span className="text-2xl font-bold">
            {user.githubStats.contributions ??
              GIT_FALLBACK_STATS[
                (user.githubStats.username || '').toLowerCase()
              ]?.commits ??
              0}
          </span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-center">
            Commits Contributed
          </span>
        </div>
      </div>

      {/* GitHub Readme Stats & Streak */}
      {user.githubStats.username && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <Image
              alt={`${user.githubStats.username} GitHub profile stats in dark theme`}
              src={`${STATS_URL}/api?username=${user.githubStats.username}&count_private=true&show_icons=true&title_color=00bfbf&icon_color=00bfbf&text_color=c9d1d9&bg_color=0d1117&rank_icon=github&border_radius=20&hide_border=true`}
              width={467}
              height={195}
              className="w-full h-auto hidden dark:block"
            />
            <Image
              alt={`${user.githubStats.username} GitHub profile stats in light theme`}
              src={`${STATS_URL}/api?username=${user.githubStats.username}&count_private=true&show_icons=true&title_color=000000&icon_color=000000&text_color=000000&bg_color=ffffff&rank_icon=github&border_radius=20&hide_border=true`}
              width={467}
              height={195}
              className="w-full h-auto dark:hidden"
            />
          </div>
          <div className="w-full">
            <Image
              alt={`${user.githubStats.username} GitHub contribution streak in dark theme`}
              src={`${STREAK_URL}/?user=${user.githubStats.username}&count_private=true&border_radius=20&ring=00bfbf&stroke=c9d1d9&background=0d1117&fire=00bfbf&currStreakNum=00bfbf&sideNums=00bfbf&datesside=00bfbf&Labelscurr=00bfbf&currStreakLabel=00bfbf&sideLabels=00bfbf&dates=c9d1d9&border=c9d1d9&hide_border=true`}
              width={467}
              height={195}
              className="w-full h-auto hidden dark:block"
            />
            <Image
              alt={`${user.githubStats.username} GitHub contribution streak in light theme`}
              src={`${STREAK_URL}/?user=${user.githubStats.username}&count_private=true&border_radius=20&ring=000000&stroke=000000&background=ffffff&fire=ff0000&currStreakNum=000000&sideNums=000000&datesside=000000&Labelscurr=000000&currStreakLabel=000000&sideLabels=000000&dates=000000&border=000000&hide_border=true`}
              width={467}
              height={195}
              className="w-full h-auto dark:hidden"
            />
          </div>
        </div>
      )}

      {/* Profile Details & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Details */}
        <div className="space-y-3 text-sm">
          {user.githubStats.bio && (
            <p className="text-muted-foreground italic">
              "{user.githubStats.bio}"
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            {user.githubStats.company && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users size={14} /> {user.githubStats.company}
              </div>
            )}
            {/* 
                            MapPin was used but we're going to keep it simple, wait, MapPin and Calendar weren't imported above. Let's make sure everything needed is exported or imported properly. Let's just import what's needed.
                        */}
          </div>
        </div>

        {/* Top Languages */}
        {user.githubStats.topLanguages &&
          user.githubStats.topLanguages.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Top Languages
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.githubStats.topLanguages.map((lang: any) => (
                  <div
                    key={lang.language}
                    className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-medium"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        lang.language === 'TypeScript'
                          ? 'bg-blue-500'
                          : lang.language === 'JavaScript'
                            ? 'bg-yellow-400'
                            : lang.language === 'Python'
                              ? 'bg-green-500'
                              : lang.language === 'HTML'
                                ? 'bg-orange-500'
                                : lang.language === 'CSS'
                                  ? 'bg-blue-400'
                                  : 'bg-gray-400'
                      }`}
                    ></span>
                    {lang.language}
                    <span className="text-muted-foreground ml-1">
                      ({lang.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {user.githubStats.recentActivity &&
        user.githubStats.recentActivity.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Recent Contributions
            </h4>
            <div className="space-y-3">
              {user.githubStats.recentActivity.map((event: any) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-1 min-w-[24px]">
                    {event.type === 'PushEvent' && (
                      <GitMerge size={16} className="text-blue-500" />
                    )}
                    {event.type === 'CreateEvent' && (
                      <Plus size={16} className="text-green-500" />
                    )}
                    {event.type === 'WatchEvent' && (
                      <Star size={16} className="text-yellow-500" />
                    )}
                    {event.type === 'PullRequestEvent' && (
                      <GitMerge size={16} className="text-purple-500" />
                    )}
                    {![
                      'PushEvent',
                      'CreateEvent',
                      'WatchEvent',
                      'PullRequestEvent',
                    ].includes(event.type) && (
                      <Github size={16} className="text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-foreground">
                      <span className="font-medium">
                        {event.type
                          .replace('Event', '')
                          .replace(/([A-Z])/g, ' $1')
                          .trim()}
                      </span>{' '}
                      on{' '}
                      <a
                        href={event.repo.url}
                        target="_blank"
                        className="text-primary hover:underline font-medium"
                      >
                        {event.repo.name}
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
            {user.githubStats.recentActivity && user.githubStats.recentActivity.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Recent Contributions</h4>
                    <div className="space-y-3">
                        {user.githubStats.recentActivity.map((event: any) => (
                            <div key={event.id} className="flex items-start gap-3 text-sm">
                                <div className="mt-1 min-w-[24px]">
                                    {event.type === 'PushEvent' && <GitMerge size={16} className="text-blue-500" />}
                                    {event.type === 'CreateEvent' && <Plus size={16} className="text-green-500" />}
                                    {event.type === 'WatchEvent' && <Star size={16} className="text-yellow-500" />}
                                    {event.type === 'PullRequestEvent' && <GitMerge size={16} className="text-purple-500" />}
                                    {!['PushEvent', 'CreateEvent', 'WatchEvent', 'PullRequestEvent'].includes(event.type) && <Github size={16} className="text-muted-foreground" />}
                                </div>
                                <div>
                                    <p className="text-foreground">
                                        <span className="font-medium">
                                            {event.type.replace('Event', '').replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        {' '}on{' '}
                                        <a href={event.repo.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                            {event.repo.name}
                                        </a>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(event.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
