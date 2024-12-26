import {
  faBan, faBirthdayCake,
  faComments, faEarthEurope, faFilter, faGift,
  faHouse, faImage, faPenToSquare,
  faScrewdriverWrench, faScroll, faServer, faShieldHalved,
  faStar, faTableColumns,
  faTicket,
  faTruckMedical, faUserGroup, faWandMagicSparkles,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";

export interface NavigationPage {
  title: string;
  desc: string;
  icon: IconDefinition;
  redirect_url: string;
}

export interface NavigationItem {
  category: string;
  description: string;
  color: "purple" | "blue" | "orange" | "red" | "green";
  pages: NavigationPage[];
}

export interface FilteredNavigationItem {
  showPages: NavigationPage[];
  category: string;
  description: string;
  color: NavigationItem["color"];
  pages: NavigationPage[];
}

export const nav_items: NavigationItem[] = [
  {
    category: "Dashboard",
    color: "purple",
    description: "SIDEBAR_CATEGORY_1_DESC",
    pages: [
      { title: "SIDEBAR_PAGE_HOME", desc: "SIDEBAR_PAGE_HOME_DESC", icon: faHouse, redirect_url: "/dashboard" },
      { title: "SIDEBAR_PAGE_WISHLIST", desc: "SIDEBAR_PAGE_WISHLIST_DESC", icon: faStar, redirect_url: "/contact" },
      { title: "SIDEBAR_PAGE_TEAM", desc: "SIDEBAR_PAGE_TEAM_DESC", icon: faTruckMedical, redirect_url: "/teamlist" }
    ]
  },
  {
    category: "Support-System",
    color: "blue",
    description: "SIDEBAR_CATEGORY_2_DESC",
    pages: [
      { title: "SIDEBAR_PAGE_MODULE_SETUP", desc: "SIDEBAR_PAGE_MODULE_SETUP_DESC", icon: faScrewdriverWrench, redirect_url: "/support/setup" },
      { title: "SIDEBAR_PAGE_TICKETS_OPEN", desc: "SIDEBAR_PAGE_TICKETS_OPEN_DESC", icon: faTicket, redirect_url: "/support/tickets" },
      { title: "SIDEBAR_PAGE_SUPPORT_THEMES", desc: "SIDEBAR_PAGE_SUPPORT_THEMES_DESC", icon: faComments, redirect_url: "/support/themes" },
      { title: "SIDEBAR_PAGE_SUPPORT_PANELS", desc: "SIDEBAR_PAGE_SUPPORT_PANELS_DESC", icon: faTableColumns, redirect_url: "/support/panels" },
      { title: "SIDEBAR_PAGE_TEXT_SNIPPETS", desc: "SIDEBAR_PAGE_TEXT_SNIPPETS_DESC", icon: faScroll, redirect_url: "/support/snippets" },
      { title: "SIDEBAR_PAGE_BLOCKED", desc: "SIDEBAR_PAGE_BLOCKED_DESC", icon: faBan, redirect_url: "/support/bans" },
    ]
  },
  {
    category: "SIDEBAR_CATEGORY_3_TITLE",
    color: "orange",
    description: "SIDEBAR_CATEGORY_3_DESC",
    pages: [
      { title: "SIDEBAR_PAGE_GIVEAWAYS", desc: "SIDEBAR_PAGE_GIVEAWAYS_DESC", icon: faGift, redirect_url: "/events/create" },
      { title: "SIDEBAR_PAGE_EVENTS", desc: "SIDEBAR_PAGE_EVENTS_DESC", icon: faBirthdayCake, redirect_url: "/events/view" },
      { title: "SIDEBAR_PAGE_MSG_DESIGN", desc: "SIDEBAR_PAGE_MSG_DESIGN_DESC", icon: faImage, redirect_url: "/events/design" },
      { title: "SIDEBAR_PAGE_CHC_ROLES", desc: "SIDEBAR_PAGE_CHC_ROLES_DESC", icon: faWandMagicSparkles, redirect_url: "/events/channel-roles" }
    ]
  },
  {
    category: "SIDEBAR_CATEGORY_4_TITLE",
    color: "red",
    description: "SIDEBAR_CATEGORY_4_DESC",
    pages: [
      { title: "SIDEBAR_PAGE_MEMBERS", desc: "SIDEBAR_PAGE_MEMBERS_DESC", icon: faUserGroup, redirect_url: "/security/members" },
      { title: "SIDEBAR_PAGE_SHIELD", desc: "SIDEBAR_PAGE_SHIELD_DESC", icon: faShieldHalved, redirect_url: "/security/shield" },
      { title: "SIDEBAR_PAGE_BACKUPS", desc: "SIDEBAR_PAGE_BACKUPS_DESC", icon: faServer, redirect_url: "/security/backups" },
      { title: "SIDEBAR_PAGE_AUTOMOD", desc: "SIDEBAR_PAGE_AUTOMOD_DESC", icon: faFilter, redirect_url: "/security/automod" }
    ]
  },
  {
    category: "SIDEBAR_CATEGORY_5_TITLE",
    color: "green",
    description: "SIDEBAR_CATEGORY_5_DESC",
    pages: [
      { title: "Embed-Builder", desc: "SIDEBAR_PAGE_EMBED_BUILD_DESC", icon: faPenToSquare, redirect_url: "/misc/embed-builder" },
      { title: "Global-Chat", desc: "SIDEBAR_PAGE_GLOBAL_CHAT_DESC", icon: faEarthEurope, redirect_url: "/misc/global-chat" },
    ]
  },
];
