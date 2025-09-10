import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Brain,
  Home,
  Library,
  Users,
  Settings,
  Menu,
  Sparkles,
  Zap,
  Plus,
  LogOut,
  FileText,
  BookOpen,
  User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface LayoutProps {
  children: React.ReactNode;
  heroContent?: {
    badge?: React.ReactNode;
    title: React.ReactNode;
    description: string;
    actionButton?: React.ReactNode;
  };
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Atividades", href: "/atividades", icon: BookOpen },
  { name: "Turmas", href: "/turmas", icon: Users },
  { name: "Materiais", href: "/materiais", icon: FileText },
];

import { useAuth } from "@/hooks/useSupabase";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export default function Layout({ children, heroContent }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, session, signOut } = useAuth();

  // Carregar perfil do usuário da tabela users
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Erro ao carregar perfil:', error);
            return;
          }

          if (data) {
            setUserProfile(data);
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        }
      }
    };

    loadUserProfile();
  }, [user?.id]);

  const CollapsedSidebar = () => (
    <div
      className="flex h-full w-16 flex-col bg-white border-r border-gray-200 transition-all duration-300"
      onMouseEnter={() => setIsExpanded(true)}
    >
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <div className="w-8 h-8 flex items-center justify-center">
          <img src="/logo_02.webp" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
      </div>
      <div className="px-2 pt-6 pb-4">
        <Link to="/criar-atividade-5">
          <Button
            size="sm"
            className="w-full h-10 bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-0"
            title="Criar Nova Atividade"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      <nav className="flex-1 px-2 pb-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center justify-center w-full h-10 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 text-brand-purple border border-purple-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              )}
              title={item.name}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-gray-200 space-y-2">
        {session ? (
          <>
            <Link to="/profile" className="block">
              <div className="flex items-center justify-center p-2 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-100 hover:from-purple-100/50 hover:to-pink-100/50 hover:border-purple-200 transition-all duration-200 cursor-pointer">
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={userProfile?.avatar_url || undefined} 
                    alt={userProfile?.full_name || userProfile?.email || "Avatar"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                    {(userProfile?.email || user?.email || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-10 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login");
              }}
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const ExpandedSidebar = ({ className }: { className?: string }) => (
    <div
      className={cn(
        "flex h-full w-64 flex-col bg-white border-r border-gray-200 transition-all duration-300",
        className,
      )}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center w-full">
          <img src="/logo_01.webp" alt="Logo" className="h-10 w-full object-contain" />
        </div>
      </div>
      <div className="px-4 pt-6 pb-4">
        <Link to="/criar-atividade-5">
          <Button className="w-full bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Criar Nova Atividade
          </Button>
        </Link>
      </div>
      <nav className="flex-1 px-4 pb-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 text-brand-purple border border-purple-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      {heroContent && (
        <div className="px-4 pb-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-100">
            <div className="flex items-center justify-center mb-2">
              <div className="inline-flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-100">
                <Zap className="w-3 h-3 text-brand-purple" />
                <span className="text-xs font-medium text-brand-purple">
                  Powered by AI
                </span>
              </div>
            </div>
            <h2 className="text-xs font-semibold text-gray-900 text-center mb-1">
              Crie atividades inteligentes com IA
            </h2>
            <p className="text-xs text-gray-600 text-center mb-2">
              Gere atividades personalizadas em segundos
            </p>
          </div>
        </div>
      )}
      <div className="p-4 border-t border-gray-200">
        <Link to="/profile" className="block">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-100 hover:from-purple-100/50 hover:to-pink-100/50 hover:border-purple-200 transition-all duration-200 cursor-pointer">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage 
                  src={userProfile?.avatar_url || undefined} 
                  alt={userProfile?.full_name || userProfile?.email || "Avatar"}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                  {(userProfile?.email || user?.email || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.full_name || userProfile?.email?.split("@")[0] || user?.email?.split("@")[0] || "Usuário"}
                </p>
                <p className="text-xs text-gray-500">{userProfile?.email || user?.email || ""}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </Link>
        <div className="mt-2 px-3">
          {session ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
              className="w-full justify-start h-8 text-xs hover:bg-red-50 hover:text-red-600"
              title="Logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          ) : (
            <Link to="/login">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-pink-50/50">
      {/* Desktop sidebar - only when logged in */}
      {session && (
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex">
          <CollapsedSidebar />
        </div>
      )}

      {/* Expanded sidebar overlay - only when logged in */}
      {session && isExpanded && (
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-[9999] lg:flex">
          <ExpandedSidebar className="shadow-xl" />
        </div>
      )}

      {/* Mobile sidebar - only when logged in */}
      {session ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <div className="lg:hidden">
            <div className="flex h-16 items-center justify-center px-4 bg-white border-b border-gray-200 relative">
              <div className="flex items-center space-x-2">
                <div className="w-24 h-24 flex items-center justify-center">
                  <img src="/logo_01.webp" alt="Logo" className="w-24 h-24 object-contain" />
                </div>
              </div>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="absolute left-4">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
            </div>
          </div>
          <SheetContent side="left" className="p-0 w-64">
            <ExpandedSidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <div className="lg:hidden">
          <div className="flex h-16 items-center justify-center px-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-24 h-24 flex items-center justify-center">
                <img src="/logo_01.webp" alt="Logo" className="w-24 h-24 object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={cn(session ? "lg:pl-16" : "")}>
        {session && (
          <header className="hidden lg:flex items-center justify-between bg-white/70 backdrop-blur-sm border-b border-gray-200/50">
            <div></div>
          </header>
        )}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
