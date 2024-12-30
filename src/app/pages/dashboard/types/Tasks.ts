export interface SubTasks {
  name: string;
  finished: boolean;
  redirect_url: string;
}

export interface Tasks {
  position: number;
  finished: boolean | null; // null = in progress, false = not functional, true = finished
  title: string;
  subtasks: SubTasks[];
}

export const tasks: Tasks[] = [
  {
    position: 1,
    finished: true,
    title: 'Support-System eingerichtet & nutzbar für neue Tickets',
    subtasks: [
      { name: 'Discord Forumkanal erstellt & eingerichtet', finished: true, redirect_url: '/support/setup' },
      { name: 'Server-Team festgelegt für eine verbesserte Verwendung', finished: true, redirect_url: '/teamlist' },
      { name: 'Support-Themen erstellt die User bei Tickets auswählen können', finished: true, redirect_url: '/support/themes' },
      { name: 'Ticket-Erwähnungen festlegen, um sofort informiert zu werden', finished: true, redirect_url: '/support/themes' },
    ]
  },
  {
    position: 2,
    finished: null,
    title: 'Backup-Schutz & Sicherheitsmaßnahmen aktiv',
    subtasks: [
      { name: 'Log-System eingerichtet um über wichtige Ereignisse informiert zu werden', finished: false, redirect_url: '/security/automod' },
      { name: 'AutoModeration\'s Regeln für mehr Chatkontrolle eingerichtet', finished: true, redirect_url: '/security/automod' },
      { name: 'Entsperrungs-Methode festlegen, damit gesperrte User sich entschuldigen können', finished: false, redirect_url: '/security/shield' },
      { name: 'Nukeschutz aktiv & ein Backup wurde erstellt', finished: true, redirect_url: '/security/backups' }
    ],
  },
  {
    position: 3,
    finished: false,
    title: 'Global-Chat eingerichtet, um serverweit zu chatten',
    subtasks: [
      { name: 'Kanal für das globale Chatten festgelegt', finished: false, redirect_url: '/misc/global-chat' }
    ],
  },
];
