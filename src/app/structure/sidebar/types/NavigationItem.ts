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
  icon: IconDefinition;
  redirect_url: string;
}

export interface NavigationItem {
  category: string;
  description: string;
  color: "purple" | "blue" | "orange" | "red" | "green";
  pages: NavigationPage[];
}

export const nav_items: NavigationItem[] = [
  {
    category: "Dashboard",
    color: "purple",
    description: "SIDEBAR_CATEGORY_1_DESC",
    pages: [
      { title: "SIDEBAR_PAGE_HOME", icon: faHouse, redirect_url: "/dashboard" },
      { title: "SIDEBAR_PAGE_WISHLIST", icon: faStar, redirect_url: "/contact" },
      { title: "SIDEBAR_PAGE_TEAM", icon: faTruckMedical, redirect_url: "/embed-builder" }
    ]
  },
  {
    category: "Support-System",
    color: "blue",
    description: "SIDEBAR_CATEGORY_2_DESC",
    pages: [
      { title: "SIDEBAR_PAGE_MODULE_SETUP", icon: faScrewdriverWrench, redirect_url: "/support/setup" },
      { title: "SIDEBAR_PAGE_TICKETS_OPEN", icon: faTicket, redirect_url: "/support/tickets" },
      { title: "SIDEBAR_PAGE_SUPPORT_THEMES", icon: faComments, redirect_url: "/support/themes" },
      { title: "SIDEBAR_PAGE_SUPPORT_PANELS", icon: faTableColumns, redirect_url: "/support/panels" },
      { title: "SIDEBAR_PAGE_TEXT_SNIPPETS", icon: faScroll, redirect_url: "/support/snippets" },
      { title: "SIDEBAR_PAGE_BLOCKED", icon: faBan, redirect_url: "/support/bans" },
    ]
  },
  {
    category: "SIDEBAR_CATEGORY_3_TITLE",
    color: "orange",
    description: "SIDEBAR_CATEGORY_3_DESC",
    pages: [
      { title: "SIDEBAR_PAGE_GIVEAWAYS", icon: faGift, redirect_url: "/events/create" },
      { title: "SIDEBAR_PAGE_EVENTS", icon: faBirthdayCake, redirect_url: "/events/view" },
      { title: "SIDEBAR_PAGE_MSG_DESIGN", icon: faImage, redirect_url: "/events/design" },
      { title: "SIDEBAR_PAGE_CHC_ROLES", icon: faWandMagicSparkles, redirect_url: "/events/channel-roles" }
    ]
  },
  {
    category: "SIDEBAR_CATEGORY_4_TITLE",
    color: "red",
    description: "SIDEBAR_CATEGORY_4_DESC",
    pages: [
      { title: "SIDEBAR_PAGE_MEMBERS", icon: faUserGroup, redirect_url: "/security/members" },
      { title: "SIDEBAR_PAGE_SHIELD", icon: faShieldHalved, redirect_url: "/security/shield" },
      { title: "SIDEBAR_PAGE_BACKUPS", icon: faServer, redirect_url: "/events/design" },
      { title: "SIDEBAR_PAGE_AUTOMOD", icon: faFilter, redirect_url: "/events/channel-roles" }
    ]
  },
  {
    category: "SIDEBAR_CATEGORY_5_TITLE",
    color: "green",
    description: "SIDEBAR_CATEGORY_5_DESC",
    pages: [
      { title: "Embed-Builder", icon: faPenToSquare, redirect_url: "/misc/embed-builder" },
      { title: "Global-Chat", icon: faEarthEurope, redirect_url: "/misc/global-chat" },
    ]
  },
];
