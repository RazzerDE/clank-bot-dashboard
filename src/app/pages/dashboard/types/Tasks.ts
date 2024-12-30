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
    title: 'SECTION_BOT_SETUP_TASK_SUPPORT',
    subtasks: [
      { name: 'SECTION_BOT_SETUP_TASK_SUPPORT_1', finished: true, redirect_url: '/support/setup' },
      { name: 'SECTION_BOT_SETUP_TASK_SUPPORT_2', finished: true, redirect_url: '/teamlist' },
      { name: 'SECTION_BOT_SETUP_TASK_SUPPORT_3', finished: true, redirect_url: '/support/themes' },
      { name: 'SECTION_BOT_SETUP_TASK_SUPPORT_4', finished: true, redirect_url: '/support/themes' },
    ]
  },
  {
    position: 2,
    finished: null,
    title: 'SECTION_BOT_SETUP_TASK_SECURITY',
    subtasks: [
      { name: 'SECTION_BOT_SETUP_TASK_SECURITY_1', finished: false, redirect_url: '/security/automod' },
      { name: 'SECTION_BOT_SETUP_TASK_SECURITY_2', finished: true, redirect_url: '/security/automod' },
      { name: 'SECTION_BOT_SETUP_TASK_SECURITY_3', finished: false, redirect_url: '/security/shield' },
      { name: 'SECTION_BOT_SETUP_TASK_SECURITY_4', finished: true, redirect_url: '/security/backups' }
    ],
  },
  {
    position: 3,
    finished: false,
    title: 'SECTION_BOT_SETUP_TASK_GLOBAL',
    subtasks: [
      { name: 'SECTION_BOT_SETUP_TASK_GLOBAL_1', finished: false, redirect_url: '/misc/global-chat' }
    ],
  },
];
