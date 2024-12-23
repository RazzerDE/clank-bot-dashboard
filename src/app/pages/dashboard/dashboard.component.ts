import {Component} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {DataHolderService} from "../../services/data/data-holder.service";
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {
  faBan, faBirthdayCake,
  faChevronDown,
  faChevronRight,
  faComments, faEarthEurope, faFilter, faGift,
  faHouse, faImage,
  faPenToSquare, faScrewdriverWrench, faScroll, faServer, faShieldHalved,
  faStar, faTableColumns, faTicket,
  faTruckMedical, faUserGroup, faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    FaIconComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '86px',
        overflow: 'hidden',
        opacity: 1
      })),
      state('expanded', style({
        height: '*',
        overflow: 'hidden',
        opacity: 1
      })),
      transition('expanded => collapsed', [
        style({ height: '*' }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ height: '96px' })
        )
      ]),
      transition('collapsed => expanded', [
        style({ height: '96px' }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ height: '*' })
        )
      ])
    ]),
    trigger('rotateChevron', [
      state('down', style({ transform: 'rotate(0deg)' })),
      state('down', style({ transform: 'rotate(90deg)' })),
      transition('right <=> down', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
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

  expandedGroups: { [key: string]: boolean } = {};
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;

  toggleGroup(category: string) {
    console.log('Before toggle:', category, this.expandedGroups[category]);
    this.expandedGroups[category] = !this.expandedGroups[category];
    console.log('After toggle:', category, this.expandedGroups[category]);
  }

  constructor(protected authService: AuthService, private dataService: DataHolderService) {
    this.dataService.isLoading = false;

    this.authService.discordLogin();

    this.navigation.forEach(group => {
      this.expandedGroups[group.category] = false;
    });

    console.log('Initial state:', this.expandedGroups);
  }

}
