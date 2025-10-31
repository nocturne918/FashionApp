import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Avatar from '@radix-ui/react-avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/authApi';
import { cn } from '../lib/utils';

export default function ProfileMenu() {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      clearAuth();
      setOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear auth even if API call fails
      clearAuth();
      setOpen(false);
      navigate('/');
    }
  };

  if (!user) {
    return null;
  }

  // Get user's initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "relative h-10 w-10 rounded-full overflow-hidden",
            "border-2 border-gray-300 hover:border-gray-400",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
            "cursor-pointer"
          )}
          aria-label="User menu"
        >
          <Avatar.Root className="w-full h-full">
            {user.avatar ? (
              <Avatar.Image
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : null}
            <Avatar.Fallback
              className={cn(
                "w-full h-full flex items-center justify-center",
                "bg-gray-200 text-gray-700 font-semibold",
                "text-sm"
              )}
            >
              {getInitials(user.name)}
            </Avatar.Fallback>
          </Avatar.Root>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={cn(
            "z-50 w-64 rounded-lg shadow-xl",
            "border border-gray-200",
            "transition-all duration-150 ease-out",
            "focus:outline-none",
            "p-4"
          )}
          style={{ 
            backgroundColor: '#ffffff', 
            opacity: 1,
            background: '#ffffff'
          }}
          sideOffset={8}
          align="end"
        >
          {/* User Info Section */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
            <Avatar.Root className="w-[13px] h-[13px] rounded-full overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <Avatar.Image
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : null}
              <Avatar.Fallback
                className={cn(
                  "w-full h-full flex items-center justify-center",
                  "bg-gray-200 text-gray-700 font-semibold",
                  "text-[8px]"
                )}
              >
                {getInitials(user.name)}
              </Avatar.Fallback>
            </Avatar.Root>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-black truncate">
                {user.name || 'User'}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {user.email}
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setOpen(false);
                navigate('/profile');
              }}
              className={cn(
                "flex-[2] px-4 py-2 rounded-lg text-sm font-medium",
                "bg-blue-600 text-white",
                "hover:bg-blue-700 transition-colors",
                "text-center cursor-pointer",
                "border-none"
              )}
            >
              View Profile
            </button>

            <button
              onClick={handleLogout}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-medium",
                "bg-red-600 text-white",
                "hover:bg-red-700 transition-colors",
                "text-center cursor-pointer",
                "border-none"
              )}
            >
              Logout
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

