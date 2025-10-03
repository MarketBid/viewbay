import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Package, 
  CreditCard, 
  User, 
  Menu, 
  X, 
  LogOut,
  Users,
  Store,
  LifeBuoy,
  Settings
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import JoinOrder from '../pages/JoinOrder';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    // { name: 'Marketplace', href: '/marketplace', icon: Store },
    { name: 'My Orders', href: '/orders', icon: Package },
    { name: 'Join Order', href: '/orders/join', icon: Users },
    { name: 'Payments', href: '/accounts', icon: CreditCard },
    { name: 'Users', href: '/users', icon: Users },
  ];

  const secondaryNavigation = [
    { name: 'Support', href: '#', icon: LifeBuoy },
    { name: 'Settings', href: '/profile', icon: Settings },
  ]

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 shrink-0 items-center px-4">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tighter">Clarsix</h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                let isActive = false;
                if (item.href === '/orders') {
                  isActive = location.pathname === '/orders' || (location.pathname.startsWith('/orders/') && location.pathname !== '/orders/join');
                } else if (item.href === '/orders/join') {
                  isActive = location.pathname === '/orders/join';
                } else if (item.href === '/accounts' && location.pathname.startsWith('/payment/initiate-payment')) {
                  isActive = true;
                } else {
                  isActive = location.pathname.startsWith(item.href);
                }

                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
          <li>
            <div className="text-xs font-semibold leading-6 text-gray-400">Your account</div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-blue-600" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
          
          <li className="mt-auto">
            <div className="flex items-center gap-x-3 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-700 font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-gray-800">{user?.name}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-900/80 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} 
             onClick={() => setSidebarOpen(false)} />
        
        <div className={`fixed inset-y-0 left-0 flex w-64 flex-col bg-white transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-4">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 text-lg font-semibold leading-6 text-gray-900">
            {navigation.find(item => location.pathname.startsWith(item.href))?.name || 'Dashboard'}
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {location.pathname === '/orders/join' ? <JoinOrder /> : children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;