import {SupportTheme, TicketSnippet} from "./Tickets";
import {Role} from "./discord/Guilds";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {BlockedUser} from "./discord/User";
import {Giveaway} from "./Events";

export interface SelectItems {
  value: string;
  label: string;
}

export interface ColumnConfig {
  width: number; // Width of the column header in %
  name: string;
}

export interface ButtonConfig {
  color: string;
  icon: IconDefinition;
  size: 'lg' | 'xl';
  action: Function;
}

export interface TableConfig {
  type: 'SUPPORT_THEMES' | 'TEAMLIST' | 'SUPPORT_SNIPPETS' | 'BLOCKED_USERS' | 'EVENTS_VIEW';
  list_empty: string;
  dataLoading: boolean;

  columns: ColumnConfig[];
  rows: SupportTheme[] | Role[] | TicketSnippet[] | BlockedUser[] | Giveaway[];
  action_btn: ButtonConfig[];
  actions: Function[];
}

export interface EmbedConfig {
  color_code: string | number | null;       // Hex color code
  thumbnail_url: string | null;             // URL to the thumbnail image
  banner_url: string | null;                // URL to the banner image, can be null
  emoji_reaction: string | null;            // Emoji to be displayed, e.g., '<a:present:873708141085343764>'

  thumbnail_invalid?: boolean;              // Flag to indicate if the thumbnail is invalid
  banner_invalid?: boolean;                 // Flag to indicate if the banner is invalid
}

export const shuffle_configs: EmbedConfig[] = [
  {
    color_code: "#FF5733",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/9004/9004955.png",
    banner_url: "https://img.freepik.com/free-photo/digital-art-style-traditional-christmas-scene_23-2151064237.jpg",
    emoji_reaction: "<a:tadaa:812782333677404221>",
  },
  {
    color_code: "#33C1FF",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/4213/4213958.png",
    banner_url: null,
    emoji_reaction: "💎",
  },
  {
    color_code: "#A020F0",
    thumbnail_url: null,
    banner_url: "https://img.freepik.com/free-vector/glowing-neon-heart-purple-banner-with-giftbox-text-space_1017-42772.jpg",
    emoji_reaction: "<a:Diamond_pink:868999547882455090>",
  },
  {
    color_code: "#FFD700",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/9592/9592247.png",
    banner_url: "https://img.freepik.com/free-vector/cartoon-ui-mobile-game-ribbon-gift-box-icon-vector-design-mystery-present-package-set-level-reward-surprise-trophy-asset-with-bow-2d-casino-achievement-clipart-challenge-progress-loot_107791-21711.jpg",
    emoji_reaction: "🎁",
  },
  {
    color_code: "#FF69B4",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/3835/3835774.png",
    banner_url: null,
    emoji_reaction: "<a:Herz:753598312568979586>",
  },
  {
    color_code: "#00FF00",
    thumbnail_url: null,
    banner_url: "https://img.freepik.com/free-vector/gift-box-with-bonus-money-coins-bills-diamonds-mystery-present-with-question-sign-3d-objects-colorful-wrapping-paper-bows-game-draw-casino-award-isolated-cartoon-vector-icons-set_107791-8449.jpg",
    emoji_reaction: "🟢",
  },
  {
    color_code: "#FF0000",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/8307/8307731.png",
    banner_url: "https://img.freepik.com/free-photo/delicate-natural-floral-background-ai-generated-image_587448-1454.jpg",
    emoji_reaction: "<a:fire:812724570121306173>",
  },
  {
    color_code: "#0000FF",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/1910/1910660.png",
    banner_url: null,
    emoji_reaction: "💙",
  },
  {
    color_code: "#FFA500",
    thumbnail_url: null,
    banner_url: "https://img.freepik.com/free-vector/kids-birthday-party-decoration-outside_107791-2501.jpg",
    emoji_reaction: "🎉",
  },
  {
    color_code: "#008080",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/9519/9519382.png",
    banner_url: "https://img.freepik.com/free-photo/digital-art-style-traditional-christmas-scene_23-2151064237.jpg",
    emoji_reaction: "<a:check:730387138381873184>",
  },
  {
    color_code: "#C0C0C0",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/9004/9004969.png",
    banner_url: null,
    emoji_reaction: "✨",
  },
  {
    color_code: "#800000",
    thumbnail_url: null,
    banner_url: "https://img.freepik.com/free-vector/glowing-neon-heart-purple-banner-with-giftbox-text-space_1017-42772.jpg",
    emoji_reaction: "❤️",
  },
  {
    color_code: "#008000",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/10761/10761306.png",
    banner_url: "https://img.freepik.com/free-vector/cartoon-ui-mobile-game-ribbon-gift-box-icon-vector-design-mystery-present-package-set-level-reward-surprise-trophy-asset-with-bow-2d-casino-achievement-clipart-challenge-progress-loot_107791-21711.jpg",
    emoji_reaction: "<a:Diamond_pink:868999547882455090>",
  },
  {
    color_code: "#FFDAB9",
    thumbnail_url: null,
    banner_url: null,
    emoji_reaction: "🎈",
  },
  {
    color_code: "#4B0082",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/2743/2743237.png",
    banner_url: "https://img.freepik.com/free-photo/delicate-natural-floral-background-ai-generated-image_587448-1454.jpg",
    emoji_reaction: "<a:Herz:753598312568979586>",
  },
  {
    color_code: "#F5F5F5",
    thumbnail_url: null,
    banner_url: "https://img.freepik.com/free-vector/gift-box-with-bonus-money-coins-bills-diamonds-mystery-present-with-question-sign-3d-objects-colorful-wrapping-paper-bows-game-draw-casino-award-isolated-cartoon-vector-icons-set_107791-8449.jpg",
    emoji_reaction: "🎀",
  },
  {
    color_code: "#DC143C",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/9004/9004955.png",
    banner_url: null,
    emoji_reaction: "<a:fire:812724570121306173>",
  },
  {
    color_code: "#4682B4",
    thumbnail_url: null,
    banner_url: "https://img.freepik.com/free-photo/digital-art-style-traditional-christmas-scene_23-2151064237.jpg",
    emoji_reaction: "💠",
  },
  {
    color_code: "#B22222",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/4213/4213958.png",
    banner_url: "https://img.freepik.com/free-vector/kids-birthday-party-decoration-outside_107791-2501.jpg",
    emoji_reaction: "<a:tadaa:812782333677404221>",
  },
  {
    color_code: "#DAA520",
    thumbnail_url: null,
    banner_url: null,
    emoji_reaction: "🧡",
  },
  {
    color_code: "#7FFF00",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/9592/9592247.png",
    banner_url: "https://img.freepik.com/free-vector/glowing-neon-heart-purple-banner-with-giftbox-text-space_1017-42772.jpg",
    emoji_reaction: "💚",
  },
  {
    color_code: "#00CED1",
    thumbnail_url: null,
    banner_url: "https://img.freepik.com/free-vector/cartoon-ui-mobile-game-ribbon-gift-box-icon-vector-design-mystery-present-package-set-level-reward-surprise-trophy-asset-with-bow-2d-casino-achievement-clipart-challenge-progress-loot_107791-21711.jpg",
    emoji_reaction: "<a:check:730387138381873184>",
  },
  {
    color_code: "#FFB6C1",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/3835/3835774.png",
    banner_url: null,
    emoji_reaction: "💖",
  },
  {
    color_code: "#20B2AA",
    thumbnail_url: null,
    banner_url: "https://img.freepik.com/free-photo/delicate-natural-floral-background-ai-generated-image_587448-1454.jpg",
    emoji_reaction: "🦄",
  },
  {
    color_code: "#F08080",
    thumbnail_url: "https://cdn-icons-png.flaticon.com/512/8307/8307731.png",
    banner_url: "https://img.freepik.com/free-vector/gift-box-with-bonus-money-coins-bills-diamonds-mystery-present-with-question-sign-3d-objects-colorful-wrapping-paper-bows-game-draw-casino-award-isolated-cartoon-vector-icons-set_107791-8449.jpg",
    emoji_reaction: "<a:Diamond_pink:868999547882455090>",
  },
  {
    color_code: "#E6E6FA",
    thumbnail_url: null,
    banner_url: null,
    emoji_reaction: "🎊",
  }
];
