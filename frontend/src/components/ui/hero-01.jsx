import React from 'react';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '@/components/ui/hero-01-utils/hero';
import BrandSlider from '@/components/ui/hero-01-utils/brand-slider';
import { getTeams } from '@/api/teams';
import { getPlayers } from '@/api/players';

/**
 * AgencyHeroSection — COD Tournament Edition
 * Pulls real teams + top players from API for avatars & brand slider
 */
export default function AgencyHeroSection({ year, settings }) {
  const { data: teamsData } = useQuery({
    queryKey: ['teams-hero', year],
    queryFn: async () => {
      const res = await getTeams(year);
      return res.data?.teams || [];
    },
    staleTime: 60000,
  });

  const { data: playersData } = useQuery({
    queryKey: ['players-hero', year],
    queryFn: async () => {
      const res = await getPlayers(year);
      return res.data?.players || [];
    },
    staleTime: 60000,
  });

  const teams = Array.isArray(teamsData) ? teamsData : (teamsData?.teams || []);
  const players = Array.isArray(playersData) ? playersData : (playersData?.players || []);

  // Build avatar list from real top players
  const avatarList = players.slice(0, 5).map((p) => ({
    image: p.photo
      ? p.photo.startsWith('http')
        ? p.photo
        : `/static/player_photos/${p.photo}`
      : null,
    name: p.cod_name || p.player_name || 'Operative',
  }));

  // Build brand/team list from real teams
  const brandList = teams.map((t) => ({
    image: t.logo
      ? t.logo.startsWith('http')
        ? t.logo
        : `/static/${t.logo}`
      : null,
    lightimg: null,
    name: t.team_name || 'Squad',
  }));

  const heroTitle = settings?.hero_title || null;
  const heroSubtitle = settings?.hero_subtitle || null;

  return (
    <div className="relative">
      <main>
        <HeroSection
          avatarList={avatarList}
          title={heroTitle}
          subtitle={heroSubtitle}
          year={year}
        />
        {brandList.length > 0 && <BrandSlider brandList={brandList} />}
      </main>
    </div>
  );
}
