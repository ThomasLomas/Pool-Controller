export interface NavItem {
  icon: string;
  title: string;
  link: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    icon: 'home',
    title: 'Home',
    link: '/'
  },
  {
    icon: 'schedule',
    title: 'Schedule',
    link: '/schedule'
  },
  // {
  //   icon: 'settings',
  //   title: 'Settings',
  //   link: '/settings'
  // },
];
