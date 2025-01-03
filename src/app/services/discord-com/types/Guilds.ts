export interface Guild {
  id: string;
  name: string;
  icon: string;
  banner: string;
  features: string[];
  owner: boolean;
  permissions: string;
  approximate_member_count: number | string;
  approximate_presence_count: number | string;

  // properties added by us
  image_url?: string;
}

