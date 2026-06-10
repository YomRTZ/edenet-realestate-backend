import {
  Activity,
  //BellRing,
  Bookmark,
  CircleUser,
  ClipboardCheck,
  ClipboardList,
  FilePlus,
  Compass,
  //HeartHandshake,
  Building2,
  Home,
  House,
  //KeyRound,
  Receipt,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
  //UserCheck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

export interface DashboardNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface DashboardNavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  links: DashboardNavLink[];
}

export const dashboardHomeLink: DashboardNavLink = {
  href: '/',
  label: 'Home',
  icon: Home,
};

export const dashboardUserNavGroups: DashboardNavGroup[] = [
  {
    id: 'my-property',
    label: 'Portfolio',
    icon: House,
    links: [
      { href: '/properties', label: 'View marketplace', icon: Compass },
      { href: '/dashboard/saved', label: 'Saved listings', icon: Bookmark },
      { href: '/dashboard/my-properties', label: 'My properties', icon: Building2 },
      {
        href: '/dashboard/listings/create',
        label: 'Submit registration',
        icon: FilePlus,
      },
    ],
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Activity,
    links: [
      { href: '/dashboard/my-requests', label: 'My requests', icon: ClipboardList },
      { href: '/dashboard/transactions', label: 'On-chain activity', icon: Receipt },
    ],
  },
];

export const dashboardAdminNavLinks: DashboardNavLink[] = [
  { href: '/properties', label: 'View marketplace', icon: Compass },
  { href: '/dashboard/property-approvals', label: 'Admin dashboard', icon: ClipboardCheck },
  { href: '/dashboard/listings/create', label: 'Submit registration', icon: FilePlus },
  { href: '/dashboard/my-properties', label: 'My properties', icon: Building2 },
  { href: '/dashboard/my-requests', label: 'My requests', icon: ClipboardList },
  { href: '/dashboard/users', label: 'Users', icon: UsersRound },
  //{ href: '/dashboard/clients', label: 'Clients', icon: UserCheck },
];

export const dashboardAdminComingSoonLinks: DashboardNavLink[] = [
  { href: '#', label: 'Identity review', icon: ShieldCheck },
];  

export const dashboardAccountLinks: DashboardNavLink[] = [
  { href: '/dashboard/profile', label: 'Profile', icon: CircleUser },
  { href: '/dashboard/settings', label: 'Settings', icon: SlidersHorizontal },
  { href: '/dashboard/verification', label: 'KYC', icon: ShieldCheck },
];

export const dashboardSignOutIcon = LogOut;
