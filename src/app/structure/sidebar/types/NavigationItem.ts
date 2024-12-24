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
    description: "Allgemeine Funktionen des Bots",
    pages: [
      { title: "Startseite", icon: faHouse, redirect_url: "/dashboard" },
      { title: "Wunschliste", icon: faStar, redirect_url: "/contact" },
      { title: "Teamliste verwalten", icon: faTruckMedical, redirect_url: "/embed-builder" }
    ]
  },
  {
    category: "Support-System",
    color: "blue",
    description: "Ticket-Tool für die Fragen der User",
    pages: [
      { title: "Modul-Einrichtung", icon: faScrewdriverWrench, redirect_url: "/support/setup" },
      { title: "Offene Tickets", icon: faTicket, redirect_url: "/support/tickets" },
      { title: "Support-Themen", icon: faComments, redirect_url: "/support/themes" },
      { title: "Nachricht Panels", icon: faTableColumns, redirect_url: "/support/panels" },
      { title: "Text-Snippets", icon: faScroll, redirect_url: "/support/snippets" },
      { title: "Geblockte User", icon: faBan, redirect_url: "/support/bans" },
    ]
  },
  {
    category: "Gewinnspiele & Events",
    color: "orange",
    description: "Erstelle blitzschnell hübsche Events",
    pages: [
      { title: "Gewinnspiel erstellen", icon: faGift, redirect_url: "/events/create" },
      { title: "Laufende Events", icon: faBirthdayCake, redirect_url: "/events/view" },
      { title: "Nachricht-Design", icon: faImage, redirect_url: "/events/design" },
      { title: "Kanal-& Rollen-Effekte", icon: faWandMagicSparkles, redirect_url: "/events/channel-roles" }
    ]
  },
  {
    category: "Server-Sicherheit",
    color: "red",
    description: "Schütze dich vor Raids & Griefs",
    pages: [
      { title: "Server-Mitglieder", icon: faUserGroup, redirect_url: "/security/members" },
      { title: "Aktive Schutzsysteme", icon: faShieldHalved, redirect_url: "/security/shield" },
      { title: "Backup-Status einsehen", icon: faServer, redirect_url: "/events/design" },
      { title: "AutoMod-Einstellungen", icon: faFilter, redirect_url: "/events/channel-roles" }
    ]
  },
  {
    category: "Sonstiges",
    color: "green",
    description: "Nützliche Tools und Funktionen",
    pages: [
      { title: "Embed-Builder", icon: faPenToSquare, redirect_url: "/misc/embed-builder" },
      { title: "Global-Chat", icon: faEarthEurope, redirect_url: "/misc/global-chat" },
    ]
  },
];
