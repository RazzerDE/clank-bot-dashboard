import {Component} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {DataHolderService} from "../../services/data/data-holder.service";
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {
  faBan, faBirthdayCake,
  faComments, faEarthEurope, faFilter, faGift,
  faHouse, faImage,
  faPenToSquare, faScrewdriverWrench, faScroll, faServer, faShieldHalved,
  faStar, faTableColumns, faTicket,
  faTruckMedical, faUserGroup, faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    FaIconComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  navigation = [
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
      description: "Ticket-Tool für das Anliegen der User",
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
      description: "Schütze deinen Server vor Raids & Griefs",
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

  constructor(protected authService: AuthService, private dataService: DataHolderService) {
    this.dataService.isLoading = false;

    this.authService.discordLogin();
  }

}
