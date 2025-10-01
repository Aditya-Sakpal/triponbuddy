import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { SignedIn, SignedOut, SignUpButton, SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";

export const AuthButtons = ({ size = 'lg', onClick }: { size?: 'sm' | 'lg', onClick?: () => void }) => {
  const { user } = useUser();

  return (
    <>
      <SignedOut>
        <SignUpButton mode="modal">
          <Button size={size} className={size === 'lg' ? 'text-white' : ''} onClick={onClick}>
            Sign Up
          </Button>
        </SignUpButton>
        <SignInButton mode="modal">
          <Button variant="outline" size={size} className={size === 'lg' ? 'border-bula' : ''} onClick={onClick}>
            Login
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link to="/profile" onClick={onClick}>
          <Button variant="ghost" size={size} className="flex items-center space-x-2">
            {user?.imageUrl && (
              <img
                src={user.imageUrl}
                alt={user?.firstName || 'User'}
                className={size === 'sm' ? 'w-4 h-4 rounded-full' : 'w-6 h-6 rounded-full'}
              />
            )}
            <span className={size === 'sm' ? 'text-sm' : ''}>{user?.firstName || 'Profile'}</span>
          </Button>
        </Link>
        <SignOutButton>
          <Button size={size} onClick={onClick} className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </SignOutButton>
      </SignedIn>
    </>
  );
};