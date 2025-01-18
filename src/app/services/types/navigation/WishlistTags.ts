export interface Tag {
  id: number;
  name: string;
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

export let tags: Tag[] = [
  { id: 1, name: "WISHLIST_TAG_FEATURES", isActive: true },
  { id: 2, name: 'Support-Tool', isActive: false },
  { id: 3, name: 'Security-System', isActive: false },
  { id: 4, name: 'WISHLIST_TAG_GIVEAWAYS', isActive: false },
  { id: 5, name: 'WISHLIST_TAG_MODULES', isActive: false }
];

export let feature_list: Feature[] = [
  { id: 1, name: 'WISHLIST_FEATURE_NAME_1', icon_url: 'assets/img/icons/utility/star.png', tag_id: 5, votes: 0,
    dislikes: 0, enabled: true, created_at: '18.01.2025', desc: 'WISHLIST_FEATURE_DESC_1' },
  { id: 2, name: 'WISHLIST_FEATURE_NAME_2', icon_url: 'assets/img/icons/utility/sound.png', tag_id: 5, votes: 0,
    dislikes: 0, enabled: true, created_at: '18.01.2025', desc: 'WISHLIST_FEATURE_DESC_2' },
  { id: 3, name: 'WISHLIST_FEATURE_NAME_3', icon_url: 'assets/img/icons/utility/live.png', tag_id: 5, votes: 0,
    dislikes: 0, enabled: true, created_at: '18.01.2025', desc: 'WISHLIST_FEATURE_DESC_3' },
  { id: 4, name: 'WISHLIST_FEATURE_NAME_4', icon_url: 'assets/img/icons/utility/wave.png', tag_id: 5, votes: 0,
    dislikes: 0, enabled: true, created_at: '18.01.2025', desc: 'WISHLIST_FEATURE_DESC_4' },
  { id: 5, name: 'WISHLIST_FEATURE_NAME_5', icon_url: 'assets/img/icons/utility/music.png', tag_id: 5, votes: 0,
    dislikes: 0, enabled: true, created_at: '18.01.2025', desc: 'WISHLIST_FEATURE_DESC_5' },
]
