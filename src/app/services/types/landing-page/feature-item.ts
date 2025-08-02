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

    category: 'SECTION_SHOWCASE_ITEM_1_SUBTITLE',
    title: 'SECTION_SHOWCASE_ITEM_1_TITLE',
    description: 'SECTION_SHOWCASE_ITEM_1_DESC',
    left_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/star.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_1_LIST_1'
      },
      {
        icon_url: 'assets/img/icons/checklist/robot.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_1_LIST_2'
      },
      {
        icon_url: 'assets/img/icons/checklist/sound.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_1_LIST_3'
      }
    ],
    right_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/books.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_1_LIST_4'
      },
      {
        icon_url: 'assets/img/icons/checklist/clock.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_1_LIST_5'
      },
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_1_LIST_6'
      }
    ]
  },
  {
    video_url: 'assets/video/discord-bot-giveaways.mp4',
    video_id: 'discord-bot-giveaways',

    category: 'SECTION_SHOWCASE_ITEM_2_SUBTITLE',
    title: 'SECTION_SHOWCASE_ITEM_2_TITLE',
    description: 'SECTION_SHOWCASE_ITEM_2_DESC',
    left_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/light-bulb.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_2_LIST_1'
      },
      {
        icon_url: 'assets/img/icons/checklist/paint-brush.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_2_LIST_2'
      },
      {
        icon_url: 'assets/img/icons/checklist/bar-chart.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_2_LIST_3'
      }
    ],
    right_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/trophy.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_2_LIST_4'
      },
      {
        icon_url: 'assets/img/icons/checklist/clock.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_2_LIST_5'
      },
      {
        icon_url: 'assets/img/icons/checklist/heart.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_2_LIST_6'
      }
    ]
  },
  {
    video_url: 'assets/video/discord-bot-backup-system.mp4',
    video_id: 'discord-bot-backup-system',

    category: 'SECTION_SHOWCASE_ITEM_3_SUBTITLE',
    title: 'SECTION_SHOWCASE_ITEM_3_TITLE',
    description: 'SECTION_SHOWCASE_ITEM_3_DESC',
    left_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/server.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_3_LIST_1'
      },
      {
        icon_url: 'assets/img/icons/checklist/rollback.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_3_LIST_2'
      },
      {
        icon_url: 'assets/img/icons/checklist/police.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_3_LIST_3'
      }
    ],
    right_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/stop.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_3_LIST_4'
      },
      {
        icon_url: 'assets/img/icons/checklist/bot.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_3_LIST_5'
      },
      {
        icon_url: 'assets/img/icons/checklist/error.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_3_LIST_6'
      }
    ]
  },
  {
    video_url: 'assets/video/discord-bot-log-system.mp4',
    video_id: 'discord-bot-log-system',

    category: 'SECTION_SHOWCASE_ITEM_4_SUBTITLE',
    title: 'SECTION_SHOWCASE_ITEM_4_TITLE',
    description: 'SECTION_SHOWCASE_ITEM_4_DESC',
    left_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_4_LIST_1'
      },
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_4_LIST_2'
      },
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_4_LIST_3'
      }
    ],
    right_menu_items: [
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_4_LIST_4'
      },
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_4_LIST_5'
      },
      {
        icon_url: 'assets/img/icons/checklist/checkmark.png',
        feature_name: 'SECTION_SHOWCASE_ITEM_4_LIST_6'
      }
    ]
  }
];
