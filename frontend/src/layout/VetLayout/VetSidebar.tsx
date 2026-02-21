import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { TbUsersGroup } from 'react-icons/tb';
import { MdOutlinePets } from 'react-icons/md';
import { IoSettingsOutline } from 'react-icons/io5';
import { ChevronDownIcon } from '../../icons';
import { useSidebar } from '../../context/SidebarContext';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

const vetNavItems: NavItem[] = [
  {
    icon: <RxDashboard />,
    name: 'Dashboard',
    path: '/vet/home',
  },
  {
    icon: <MdOutlinePets />,
    name: 'Veterinary',
    subItems: [
      { name: 'Veterinary Bookings', path: '/vet/bookings' },
      { name: 'Service List', path: '/vet/services' },
    ],
  },
  {
    icon: <TbUsersGroup />,
    name: 'Users',
    subItems: [
      // { name: 'Owners and Pets', path: '/vet/owners' },
      { name: 'Booking Reviews', path: '/vet/reviews' },
    ],
  },
  {
    icon: <IoSettingsOutline />,
    name: 'Availability',
    path: '/vet/availability',
  },
];

const VetSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  useEffect(() => {
    let submenuMatched = false;
    vetNavItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `vet-${openSubmenu}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevIndex) => (prevIndex === index ? null : index));
  };

  const renderMenuItems = () => (
    <ul className='flex flex-col gap-4'>
      {vetNavItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${
                openSubmenu === index
                  ? 'menu-item-active'
                  : 'menu-item-inactive'
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'lg:justify-start'
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu === index
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive'
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className='menu-item-text'>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu === index ? 'rotate-180 text-brand-500' : ''
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? 'menu-item-icon-active'
                      : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className='menu-item-text'>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`vet-${index}`] = el;
              }}
              className='overflow-hidden transition-all duration-300'
              style={{
                height:
                  openSubmenu === index
                    ? `${subMenuHeight[`vet-${index}`]}px`
                    : '0px',
              }}
            >
              <ul className='mt-2 space-y-1 ml-9'>
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? 'menu-dropdown-item-active'
                          : 'menu-dropdown-item-inactive'
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? 'w-[290px]'
            : isHovered
              ? 'w-[290px]'
              : 'w-[90px]'
        }
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
        }`}
      >
        <Link to='/vet/home'>
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className='dark:hidden w-full'
                src='/images/logo/logo.png'
                alt='Logo'
                width={150}
                height={40}
              />
              <img
                className='hidden dark:block'
                src='/images/logo/logo-dark.png'
                alt='Logo'
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src='/images/logo/logo-icon.png'
              alt='Logo'
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className='flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar'>
        <nav className='mb-6'>
          <div className='flex flex-col gap-4'>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? 'lg:justify-center'
                    : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? 'Menu' : '...'}
              </h2>
              {renderMenuItems()}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default VetSidebar;
