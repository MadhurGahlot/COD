import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sliders,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import SculptureHero from '../../components/ui/liquid-sculpture-hero';
import { getHome } from '../../api/home';
import {
  updateHomeSettings,
  addHighlight,
  deleteHighlight,
  addHeroImage,
  deleteHeroImage,
} from '../../api/admin';
import { useTournament } from '../../context/TournamentContext';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminHome() {
  const { selectedYear } = useTournament();
  const queryClient = useQueryClient();

  // Settings form
  const [heroTitle, setHeroTitle] = useState('');
  const [headlineAccent, setHeadlineAccent] = useState('');
  const [eyebrow, setEyebrow] = useState('');
  const [brand, setBrand] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [primaryCtaText, setPrimaryCtaText] = useState('');
  const [primaryCtaLink, setPrimaryCtaLink] = useState('');
  const [secondaryCtaText, setSecondaryCtaText] = useState('');
  const [secondaryCtaLink, setSecondaryCtaLink] = useState('');
  const [backdropText, setBackdropText] = useState('');
  const [showNav, setShowNav] = useState(false);
  const [heroBgFile, setHeroBgFile] = useState(null);
  const [heroDarkBgFile, setHeroDarkBgFile] = useState(null);
  const [existingLightImg, setExistingLightImg] = useState('');
  const [existingDarkImg, setExistingDarkImg] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Highlight modal
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [hTitle, setHTitle] = useState('');
  const [hDesc, setHDesc] = useState('');
  const [hImage, setHImage] = useState(null);
  const [hError, setHError] = useState('');

  // Hero Image modal
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [heroCaption, setHeroCaption] = useState('');
  const [heroImgFile, setHeroImgFile] = useState(null);
  const [heroError, setHeroError] = useState('');

  const { data: homeData, isLoading, error, refetch } = useQuery({
    queryKey: ['adminHomeCMS', selectedYear],
    queryFn: async () => {
      const res = await getHome(selectedYear);
      return res.data;
    },
  });

  useEffect(() => {
    if (homeData?.settings) {
      const s = homeData.settings;
      setHeroTitle(s.hero_title || '');
      setHeadlineAccent(s.headline_accent || '');
      setEyebrow(s.eyebrow || '');
      setBrand(s.brand || '');
      setHeroSubtitle(s.hero_subtitle || '');
      setPrimaryCtaText(s.primary_cta_text || '');
      setPrimaryCtaLink(s.primary_cta_link || '');
      setSecondaryCtaText(s.secondary_cta_text || '');
      setSecondaryCtaLink(s.secondary_cta_link || '');
      setBackdropText(s.backdrop_text || '');
      setShowNav(Boolean(s.show_nav));
      setExistingLightImg(s.hero_background || '');
      setExistingDarkImg(s.hero_dark_image || '');
    }
  }, [homeData]);

  const settingsMutation = useMutation({
    mutationFn: (formData) => updateHomeSettings(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHomeCMS', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['home', selectedYear] });
      setSettingsSuccess('Liquid Sculpture Hero & Homepage settings saved successfully!');
      setTimeout(() => setSettingsSuccess(''), 4000);
    },
    onError: (err) => {
      setSettingsError(err.response?.data?.detail || 'Failed to update settings');
    },
  });

  const highlightMutation = useMutation({
    mutationFn: (formData) => addHighlight(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHomeCMS', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['home', selectedYear] });
      setIsHighlightModalOpen(false);
      setHTitle('');
      setHDesc('');
      setHImage(null);
    },
    onError: (err) => {
      setHError(err.response?.data?.detail || 'Failed to add highlight');
    },
  });

  const deleteHighlightMutation = useMutation({
    mutationFn: (id) => deleteHighlight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHomeCMS', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['home', selectedYear] });
    },
  });

  const heroImageMutation = useMutation({
    mutationFn: (formData) => addHeroImage(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHomeCMS', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['home', selectedYear] });
      setIsHeroModalOpen(false);
      setHeroCaption('');
      setHeroImgFile(null);
    },
    onError: (err) => {
      setHeroError(err.response?.data?.detail || 'Failed to upload hero image');
    },
  });

  const deleteHeroMutation = useMutation({
    mutationFn: (id) => deleteHeroImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHomeCMS', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['home', selectedYear] });
    },
  });

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    const fd = new FormData();
    fd.append('year', selectedYear.toString());
    fd.append('hero_title', heroTitle);
    fd.append('headline_accent', headlineAccent);
    fd.append('eyebrow', eyebrow);
    fd.append('brand', brand);
    fd.append('hero_subtitle', heroSubtitle);
    fd.append('primary_cta_text', primaryCtaText);
    fd.append('primary_cta_link', primaryCtaLink);
    fd.append('secondary_cta_text', secondaryCtaText);
    fd.append('secondary_cta_link', secondaryCtaLink);
    fd.append('backdrop_text', backdropText);
    fd.append('show_nav', showNav ? '1' : '0');

    if (heroBgFile) {
      fd.append('hero_background', heroBgFile);
    }
    if (heroDarkBgFile) {
      fd.append('hero_dark_image', heroDarkBgFile);
    }

    settingsMutation.mutate(fd);
  };

  const handleHighlightSubmit = (e) => {
    e.preventDefault();
    setHError('');

    const fd = new FormData();
    fd.append('year', selectedYear.toString());
    fd.append('title', hTitle);
    fd.append('description', hDesc);
    if (hImage) fd.append('image', hImage);

    highlightMutation.mutate(fd);
  };

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    setHeroError('');
    if (!heroImgFile) {
      setHeroError('Please select an image to upload');
      return;
    }

    const fd = new FormData();
    fd.append('year', selectedYear.toString());
    fd.append('image', heroImgFile);

    heroImageMutation.mutate(fd);
  };

  const highlights = homeData?.highlights || [];
  const heroImages = homeData?.hero_images || [];

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="border-b border-light-border dark:border-dark-border pb-5">
        <h2 className="text-xl font-bold font-display text-light-text dark:text-dark-text">
          Homepage Content Management (CMS)
        </h2>
        <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
          Customize the landing hero texts, visual banners, media carousel, and highlight reels
        </p>
      </div>

      {/* Liquid Sculpture Hero CMS Card */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-light-border dark:border-dark-border pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-base font-bold font-display text-light-text dark:text-dark-text">
                Liquid Sculpture Hero & CMS Configuration
              </h3>
              <p className="text-xs text-light-muted dark:text-dark-muted">
                Control the real-time WebGL2 particle sculpture hero, headlines, CTAs, and visual artwork
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface text-xs font-semibold text-light-text dark:text-dark-text hover:border-accent transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-accent" />
            <span>{showPreview ? 'Hide Interactive Preview' : 'Live Hero Preview'}</span>
          </button>
        </div>

        {/* Live Preview Panel inside Admin */}
        {showPreview && (
          <div className="rounded-2xl border border-accent/30 p-2 sm:p-4 bg-gray-50 dark:bg-dark-bg/60 space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Interactive Hero Preview (Live WebGL2 Simulation)
              </span>
              <span className="text-[11px] text-light-muted dark:text-dark-muted">
                Move cursor over sculpture to perturb particles
              </span>
            </div>
            <SculptureHero
              height="480px"
              brand={brand || 'GKV COD Tournament'}
              eyebrow={eyebrow || 'COMPETITIVE GAMING · GKV'}
              headline={heroTitle || 'The competition\nstarts here.'}
              headlineAccent={headlineAccent || 'starts here.'}
              body={heroSubtitle || 'Follow your teams, explore upcoming matches, track tournament standings, and celebrate the players shaping the competition.'}
              primaryCta={{
                label: primaryCtaText || 'Explore Tournament',
                href: primaryCtaLink || '/brackets',
              }}
              secondaryCta={{
                label: secondaryCtaText || 'View Leaderboard',
                href: secondaryCtaLink || '/leaderboard',
              }}
              backdropText={backdropText || 'GKV ESPORTS'}
              showNav={showNav}
              src={
                heroBgFile
                  ? URL.createObjectURL(heroBgFile)
                  : existingLightImg
                  ? (existingLightImg.startsWith('http') ? existingLightImg : `/static/${existingLightImg}`)
                  : undefined
              }
              darkSrc={
                heroDarkBgFile
                  ? URL.createObjectURL(heroDarkBgFile)
                  : existingDarkImg
                  ? (existingDarkImg.startsWith('http') ? existingDarkImg : `/static/${existingDarkImg}`)
                  : undefined
              }
            />
          </div>
        )}

        <form onSubmit={handleSettingsSubmit} className="space-y-5">
          {settingsSuccess && (
            <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 flex items-center gap-2 text-xs font-medium text-orange-600 dark:text-orange-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          {settingsError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{settingsError}</span>
            </div>
          )}

          {/* Grid of headline and eyebrow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Hero Eyebrow Text
              </label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder="e.g. COMPETITIVE GAMING · GKV"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Tournament Brand Name
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. GKV COD Tournament"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Hero Headline (use newline for line breaks)
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="e.g. The competition\nstarts here."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Headline Accent Word(s)
              </label>
              <input
                type="text"
                value={headlineAccent}
                onChange={(e) => setHeadlineAccent(e.target.value)}
                placeholder="e.g. starts here."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Hero Description / Body
            </label>
            <textarea
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="e.g. Follow your teams, explore upcoming matches, track tournament standings, and celebrate the players shaping the competition."
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>

          {/* Primary and Secondary CTA Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 space-y-3">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider block">
                Primary Call-To-Action (Button)
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={primaryCtaText}
                  onChange={(e) => setPrimaryCtaText(e.target.value)}
                  placeholder="Label: e.g. Explore Tournament"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  value={primaryCtaLink}
                  onChange={(e) => setPrimaryCtaLink(e.target.value)}
                  placeholder="Route: e.g. /brackets or /fixtures"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 space-y-3">
              <span className="text-[11px] font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider block">
                Secondary Call-To-Action (Link)
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={secondaryCtaText}
                  onChange={(e) => setSecondaryCtaText(e.target.value)}
                  placeholder="Label: e.g. View Leaderboard"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  value={secondaryCtaLink}
                  onChange={(e) => setSecondaryCtaLink(e.target.value)}
                  placeholder="Route: e.g. /leaderboard"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Watermark Backdrop & Sub-Nav Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Backdrop Watermark Word
              </label>
              <input
                type="text"
                value={backdropText}
                onChange={(e) => setBackdropText(e.target.value)}
                placeholder="e.g. GKV ESPORTS or COD"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
              <span className="text-[10px] text-light-muted dark:text-dark-muted">
                Large faint background typography behind the liquid particle sculpture
              </span>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNav}
                  onChange={(e) => setShowNav(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                <span className="ml-3 text-xs font-semibold text-light-text dark:text-dark-text">
                  Show Sub-Navigation Inside Hero Box
                </span>
              </label>
            </div>
          </div>

          {/* Artwork Upload (Light & Dark Variants) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5 p-4 rounded-xl border border-light-border dark:border-dark-border">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Sculpture Artwork (Light Mode)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert("File size exceeds 5 MB limit. Please select a smaller image.");
                    e.target.value = "";
                    setHeroBgFile(null);
                    return;
                  }
                  setHeroBgFile(file || null);
                }}
                className="w-full text-xs text-light-muted dark:text-dark-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
              />
              {existingLightImg && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Current file: {existingLightImg}
                </p>
              )}
            </div>

            <div className="space-y-1.5 p-4 rounded-xl border border-light-border dark:border-dark-border">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Sculpture Artwork (Dark Mode)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert("File size exceeds 5 MB limit. Please select a smaller image.");
                    e.target.value = "";
                    setHeroDarkBgFile(null);
                    return;
                  }
                  setHeroDarkBgFile(file || null);
                }}
                className="w-full text-xs text-light-muted dark:text-dark-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
              />
              {existingDarkImg && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Current file: {existingDarkImg}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-light-border dark:border-dark-border">
            <button
              type="submit"
              disabled={settingsMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-accent/25 transition-all flex items-center gap-2"
            >
              {settingsMutation.isPending ? 'Saving Settings...' : 'Save & Publish Hero Settings'}
            </button>
          </div>
        </form>
      </Card>

      {/* Highlights Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-light-text dark:text-dark-text">
              Tournament Highlights
            </h3>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              Card showcases featured on the public homepage
            </p>
          </div>

          <button
            onClick={() => setIsHighlightModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Highlight
          </button>
        </div>

        {highlights.length === 0 ? (
          <Card className="p-6 text-center text-xs text-light-muted dark:text-dark-muted">
            No highlights created yet. Click "Add Highlight" to showcase tournament photos or achievements.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highlights.map((h) => (
              <Card key={h.id} className="overflow-hidden">
                {h.image_url && (
                  <img
                    src={h.image_url.startsWith('http') ? h.image_url : `/static/${h.image_url}`}
                    alt={h.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-light-text dark:text-dark-text font-display">
                      {h.title}
                    </h4>
                    <button
                      onClick={() => deleteHighlightMutation.mutate(h.id)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      title="Delete highlight"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-light-muted dark:text-dark-muted line-clamp-2">
                    {h.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Hero Images & Sculpture Presets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-light-text dark:text-dark-text flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accent" />
              Tournament Hero & Sculpture Media Gallery
            </h3>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              Upload artwork and wallpapers, or click to apply them directly as the animated Liquid Sculpture Hero
            </p>
          </div>

          <button
            onClick={() => setIsHeroModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Hero Image
          </button>
        </div>

        {heroImages.length === 0 ? (
          <Card className="p-6 text-center text-xs text-light-muted dark:text-dark-muted">
            No gallery images uploaded yet for Season {selectedYear}. Upload wallpapers or logo artwork to use as fluid sculptures.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {heroImages.map((img) => {
              const srcUrl = img.image_url.startsWith('http') ? img.image_url : `/static/${img.image_url}`;
              const isLightActive = existingLightImg === img.image_url;
              const isDarkActive = existingDarkImg === img.image_url;

              return (
                <Card key={img.id} className="overflow-hidden group flex flex-col justify-between">
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <img
                      src={srcUrl}
                      alt="Hero media"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => deleteHeroMutation.mutate(img.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {isLightActive && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold">
                          Active Light
                        </span>
                      )}
                      {isDarkActive && (
                        <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/30 font-bold">
                          Active Dark
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setExistingLightImg(img.image_url);
                          setHeroBgFile(null);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                          isLightActive
                            ? 'bg-accent text-white border-accent'
                            : 'border-light-border dark:border-dark-border hover:border-accent'
                        }`}
                      >
                        Set as Light
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExistingDarkImg(img.image_url);
                          setHeroDarkBgFile(null);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                          isDarkActive
                            ? 'bg-accent text-white border-accent'
                            : 'border-light-border dark:border-dark-border hover:border-accent'
                        }`}
                      >
                        Set as Dark
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Upload Hero Image */}
      <Modal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
        title="Upload Tournament Hero Media"
      >
        <form onSubmit={handleHeroSubmit} className="space-y-4">
          {heroError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{heroError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Media Image File *
            </label>
            <input
              type="file"
              required
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.size > 5 * 1024 * 1024) {
                  alert("File size exceeds 5 MB limit. Please select a smaller image.");
                  e.target.value = "";
                  setHeroImgFile(null);
                  return;
                }
                setHeroImgFile(file || null);
              }}
              className="w-full text-xs text-light-muted dark:text-dark-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
            />
            <span className="text-[10px] text-light-muted dark:text-dark-muted block mt-1">
              Supports PNG with transparency or JPG banners. The system will convert pixels into GPU particles.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-light-border dark:border-dark-border">
            <button
              type="button"
              onClick={() => setIsHeroModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-light-border dark:border-dark-border text-xs font-semibold text-light-muted dark:text-dark-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={heroImageMutation.isPending}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-accent/20"
            >
              {heroImageMutation.isPending ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Highlight */}
      <Modal
        isOpen={isHighlightModalOpen}
        onClose={() => setIsHighlightModalOpen(false)}
        title="Add Tournament Highlight"
      >
        <form onSubmit={handleHighlightSubmit} className="space-y-4">
          {hError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{hError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Highlight Title *
            </label>
            <input
              type="text"
              required
              value={hTitle}
              onChange={(e) => setHTitle(e.target.value)}
              placeholder="e.g. Finals Trophy Unveiling"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={hDesc}
              onChange={(e) => setHDesc(e.target.value)}
              placeholder="Summary of the moment..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Highlight Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.size > 5 * 1024 * 1024) {
                  alert("File size exceeds 5 MB limit. Please select a smaller image.");
                  e.target.value = "";
                  setHImage(null);
                  return;
                }
                setHImage(file || null);
              }}
              className="w-full text-xs text-light-muted dark:text-dark-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-light-border dark:border-dark-border">
            <button
              type="button"
              onClick={() => setIsHighlightModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-light-border dark:border-dark-border text-xs font-semibold text-light-muted dark:text-dark-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={highlightMutation.isPending}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-accent/20"
            >
              Save Highlight
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
