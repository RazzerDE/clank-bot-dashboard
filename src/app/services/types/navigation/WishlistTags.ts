export interface Tag {
  id: number;
  name: string;
  color?: string;
  isActive: boolean;
}

export interface Feature {
  id: number;
  name: string;
  icon_url: string;
  tag_id: number;
  votes: number;
  dislikes: number;
  created_at: string;
  desc: string;
  enabled?: boolean;
}

export interface FeatureVote {
  id: number;
  votes: number;
  dislikes: number;
}

export interface FeatureVotes {
  featureVotes: FeatureVote[];
}

export interface FeatureData {
  featureId: number;
  userId: string;
  vote: boolean;
}

export interface CooldownFeatures {
  featureId: number;
  onCooldown: boolean;
  isLoading: boolean;
}

export let tags: Tag[] = [
  { id: 1, name: "WISHLIST_TAG_FEATURES", isActive: true },
  { id: 2, name: 'Support-Tool', color: '#2980b9', isActive: false },
  { id: 3, name: 'Security-System', color: '#c0392b', isActive: false },
  { id: 4, name: 'WISHLIST_TAG_GIVEAWAYS', color: '#8e44ad', isActive: false },
  { id: 5, name: 'WISHLIST_TAG_MODULES', color: '#27ae60', isActive: false },
  { id: 6, name: 'WISHLIST_TAG_MISC', color: '#2c3e50', isActive: false }
];

export let feature_list: Feature[] = [
  { id: 1, name: 'WISHLIST_FEATURE_NAME_1', icon_url: 'assets/img/icons/utility/star.png', tag_id: 5, votes: 0,
    dislikes: 0, enabled: true, created_at: '18.01.2025', desc: 'WISHLIST_FEATURE_DESC_1' },
  { id: 2, name: 'WISHLIST_FEATURE_NAME_2', icon_url: 'assets/img/icons/utility/sound.png', tag_id: 5, votes: 0,
    dislikes: 0, enabled: true, created_at: '18.01.2025', desc: 'WISHLIST_FEATURE_DESC_2' },
  { id: 3, name: 'WISHLIST_FEATURE_NAME_3', icon_url: 'assets/img/icons/utility/live.png', tag_id: 6, votes: 0,
    dislikes: 0, enabled: true, created_at: '18.01.2025', desc: 'WISHLIST_FEATURE_DESC_3' },
  { id: 4, name: 'WISHLIST_FEATURE_NAME_4', icon_url: 'assets/img/icons/utility/wave.png', tag_id: 5, votes: 0,
    dislikes: 0, enabled: true, created_at: '18.01.2025', desc: 'WISHLIST_FEATURE_DESC_4' },
  { id: 5, name: 'WISHLIST_FEATURE_NAME_5', icon_url: 'assets/img/icons/utility/music.png', tag_id: 5, votes: 0,
    dislikes: 0, enabled: true, created_at: '18.01.2025', desc: 'WISHLIST_FEATURE_DESC_5' },
  { id: 6, name: 'WISHLIST_FEATURE_NAME_6', icon_url: 'assets/img/icons/utility/sleep.png', tag_id: 6, votes: 0,
    dislikes: 0, enabled: true, created_at: '18.01.2025', desc: 'WISHLIST_FEATURE_DESC_6' },
]
