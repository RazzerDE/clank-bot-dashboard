export interface Tag {
  id: number;
  name: string;
  isActive: boolean;
}

export interface Feature {
  name: string;
  icon_url: string;
  tag_id: number;
  votes: number;
  dislikes: number;
  created_at: string;
  desc: string;
}
