export interface FeatureListItem {
  icon_url: string;
  feature_name: string;
}

export interface FeatureItem {
  video_url: string;
  video_id: string;

  category: string;
  title: string;
  description: string;

  left_menu_items: FeatureListItem[];
  right_menu_items: FeatureListItem[];
}

export const feature_items: FeatureItem[] = [
  {
    video_url: 'assets/video/discord-bot-ticket-tool.mp4',
    video_id: 'discord-bot-ticket-tool',

    category: 'EIGENES SUPPORT-SYSTEM',
    title: '📬 ~ PROFESSIONELL & KINDERLEICHT',
    description: '› Mit unserem integrierten <strong>Support-Modul</strong> (Ticket Modmail-Tool) können User den Bot ' +
      'via Privatnachricht anschreiben, wodurch automatisch ein Ticket auf deinem Discord-Server in einem Forumkanal ' +
      'erstellt wird - dies garantiert eine benutzerfreundliche Erfahrung mit einer übersichtlichen Verwaltung.',
    left_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/star.png',
        feature_name: 'Support-Bewertung für Teamler'
      },
      {
        icon_url: 'assets/img/icons/checklist/robot.png',
        feature_name: 'Tickets automatisch beantworten'
      },
      {
        icon_url: 'assets/img/icons/checklist/sound.png',
        feature_name: 'Sprachkanal-Support unterstützt'
      }
    ],
    right_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/books.png',
        feature_name: 'Erstelle Panel & Support-Themen'
      },
      {
        icon_url: 'assets/img/icons/checklist/clock.png',
        feature_name: 'Feste Support-Zeiten für das Team'
      },
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'Integriertes Verwaltungs-Menü'
      }
    ]
  },
  {
    video_url: 'assets/video/discord-bot-ticket-tool.mp4',
    video_id: 'discord-bot-giveaways',

    category: 'EIGENE GEWINNSPIELE STARTEN',
    title: '🎁 ~ BLITZSCHNELL & WUNDERSCHÖN',
    description: '› Mithilfe des personalisierten <strong>Gewinnspiel-Moduls</strong> kannst du eigene Gewinnspiele, ' +
      'erstellen, bearbeiten und verwalten. Lege eigene Teilnahme-Bedingungen fest, verändere das Design der ' +
      'Gewinnspiel-Nachricht und tracke die Aktivität deiner Server-Mitglieder.',
    left_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/light-bulb.png',
        feature_name: 'Eigene Teilnahme-Bedingungen'
      },
      {
        icon_url: 'assets/img/icons/checklist/paint-brush.png',
        feature_name: 'Eigenes Embed-Design festlegen'
      },
      {
        icon_url: 'assets/img/icons/checklist/bar-chart.png',
        feature_name: 'Statistiken-Tracker (Invites & mehr)'
      }
    ],
    right_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/trophy.png',
        feature_name: 'Interessante Bestenlisten'
      },
      {
        icon_url: 'assets/img/icons/checklist/clock.png',
        feature_name: 'Gewinnspiele später planen'
      },
      {
        icon_url: 'assets/img/icons/checklist/heart.png',
        feature_name: 'Sponsor für Gewinnspiele festlegen'
      }
    ]
  },
  {
    video_url: 'assets/video/discord-bot-backup-system.mp4',
    video_id: 'discord-bot-backup-system',

    category: 'EIGENES BACKUP-SYSTEM',
    title: '🚨 ~ SCHÜTZE DEINEN SERVER',
    description: '› Unser automatisches & zuverlässiges Backup-System erstellt 2x pro Tag einen Screenshot deines Servers ' +
      'und <strong>speichert alle Kanäle & Rollen</strong> - sollte dein Server angegriffen werden, verliert der ' +
      'entsprechende User alle Rechte und die Änderungen werden zurückgesetzt.',
    left_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/server.png',
        feature_name: 'Regelmäßige Server-Backups'
      },
      {
        icon_url: 'assets/img/icons/checklist/rollback.png',
        feature_name: 'Kanäle & Rollen wiederherstellen'
      },
      {
        icon_url: 'assets/img/icons/checklist/police.png',
        feature_name: 'Automatischer Schutz, der eingreift'
      }
    ],
    right_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/stop.png',
        feature_name: 'Effektive Auto-Moderations-Regeln'
      },
      {
        icon_url: 'assets/img/icons/checklist/bot.png',
        feature_name: 'Bestrafe automatisch Fake-Accounts'
      },
      {
        icon_url: 'assets/img/icons/checklist/error.png',
        feature_name: 'Viele nützliche Anti-Raid Tools'
      }
    ]
  },
  {
    video_url: 'assets/video/discord-bot-log-system.mp4',
    video_id: 'discord-bot-log-system',

    category: 'EIGENES LOGGING-SYSTEM',
    title: '📂 ~ ZUVERLÄSSIG & AUTOMATISCH',
    description: '› Speichere wichtige Server-Änderungen, durchgeführte Bestrafungen, Server-Beitritte und noch viel ' +
      'mehr in einem übersichtlichen eigenem Forumkanal, wodurch du immer blitzschnell <strong>die wichtigsten ' +
      'Ereignisse</strong> auf deinem Discord-Server abrufen kannst - das Log-System umfasst:',
    left_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'User Entsperrungs-Anträge'
      },
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'Kritische Server-Änderungen'
      },
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'Server-Betritte & Leaves'
      }
    ],
    right_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'Wichtige Moderationsaktionen'
      },
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'Kanal-& Rollenänderungen'
      },
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'Nachricht & Emoji-Updates'
      }
    ]
  }
];
