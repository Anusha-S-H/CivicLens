import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, UserRole } from '@/lib/mockData';
import { Users as UsersIcon, Search, Mail, Shield, UserCircle } from 'lucide-react';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load users from localStorage
    const stored = localStorage.getItem('civiclens_users');
    if (stored) {
      try {
        setUsers(JSON.parse(stored) as User[]);
      } catch {
        setUsers([]);
      }
    }
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'officer':
        return 'bg-blue-100 text-blue-800';
      case 'citizen':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'officer':
        return <UsersIcon className="h-4 w-4" />;
      case 'citizen':
        return <UserCircle className="h-4 w-4" />;
      default:
        return <UserCircle className="h-4 w-4" />;
    }
  };

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    officers: users.filter(u => u.role === 'officer').length,
    citizens: users.filter(u => u.role === 'citizen').length,
  };

  // Redirect if not admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background bg-hero-pattern">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <GlassCard>
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You need admin privileges to view this page.
              </p>
            </div>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-hero-pattern">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-in-up">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">User Management</span>
          </h1>
          <p className="text-muted-foreground">
            View and manage all registered users in the system.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="animate-slide-in-up stagger-1">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">
                {userStats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
          </GlassCard>
          <GlassCard className="animate-slide-in-up stagger-2">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {userStats.admins}
              </div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
          </GlassCard>
          <GlassCard className="animate-slide-in-up stagger-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userStats.officers}
              </div>
              <div className="text-sm text-muted-foreground">Officers</div>
            </div>
          </GlassCard>
          <GlassCard className="animate-slide-in-up stagger-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userStats.citizens}
              </div>
              <div className="text-sm text-muted-foreground">Citizens</div>
            </div>
          </GlassCard>
        </div>

        {/* Users List */}
        <GlassCard className="animate-slide-in-up">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="space-y-3">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-slide-in-up stagger-${index + 1}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    <span className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? 'Try adjusting your search criteria'
                    : 'No users are registered in the system yet'}
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
