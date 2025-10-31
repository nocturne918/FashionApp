import React from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

interface ProfileHoverCardProps {
  user: User;
  onLogout: () => void;
}

const ProfileHoverCard: React.FC<ProfileHoverCardProps> = ({ user, onLogout }) => {
  return (
    <div className="profile-hover-card">
      <div className="profile-hover-header">
        <img src={user.avatar || `https://avatar.vercel.sh/${user.email}.png`} alt="User Avatar" className="profile-hover-avatar" />
        <div className="profile-hover-info">
          <span className="profile-hover-name">{user.name || 'User'}</span>
          <span className="profile-hover-email">{user.email}</span>
        </div>
      </div>
      <div className="profile-hover-actions">
        <Link to="/profile" className="profile-hover-btn view-profile-btn">View Profile</Link>
        <button onClick={onLogout} className="profile-hover-btn logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default ProfileHoverCard;
