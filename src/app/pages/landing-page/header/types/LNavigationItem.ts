interface LNavigationItem {
  redirect_url: string;
  title: string;
}

export const nav_items: LNavigationItem[] = [
  {redirect_url: '/#discord-bot', title: 'Start'},
  {redirect_url: '/#discord-bot-features', title: 'Features'},
  {redirect_url: '/#discord-bot-wishlist', title: 'Wunschliste'},
  {redirect_url: '/#discord-bot-team', title: 'Bot-Team'},
]
