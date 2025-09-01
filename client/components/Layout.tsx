import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

import { useAuth } from "@/hooks/useSupabase";
export default function Layout({ children, heroContent }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, session, signOut } = useAuth();

  // Close expanded sidebar when navigating to a new route
  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);


  const CollapsedSidebar = () => (
    <div
      className="flex h-full w-16 flex-col bg-white border-r border-gray-200 transition-all duration-300"
      onMouseEnter={() => setIsExpanded(true)}
    >
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-pink rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="px-2 pt-6 pb-4">
        <Link to="/criar-prova-5">
          <Button
            size="sm"
            className="w-full h-10 bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-0"
            title="Criar Nova Prova"
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
      <div className="p-2 border-t border-gray-200">
        {session ? (
          <div className="flex items-center justify-center p-2 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-100">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {(user?.email || "U")[0].toUpperCase()}
              </span>
            </div>
          </div>
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
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-pink rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-jakarta font-bold bg-gradient-to-l from-brand-purple to-brand-pink bg-clip-text text-transparent">
            ExamAI
          </span>
        </div>
      </div>
      <div className="px-4 pt-6 pb-4">
        <Link to="/criar-prova-5">
          <Button className="w-full bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Criar Nova Prova
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
              Crie provas inteligentes com IA
            </h2>
            <p className="text-xs text-gray-600 text-center mb-2">
              Gere provas personalizadas em segundos
            </p>
          </div>
        </div>
      )}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {(user?.email || "U")[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {user?.email?.split("@")[0] || "Usuário"}
              </p>
              <p className="text-xs text-gray-500">{user?.email || ""}</p>
            </div>
          </div>
          {session ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
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
            <div className="flex h-16 items-center justify-between px-4 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-pink rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-jakarta font-bold bg-gradient-to-l from-brand-purple to-brand-pink bg-clip-text text-transparent">
                  ExamAI
                </span>
              </div>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
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
          <div className="flex h-16 items-center px-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-pink rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-jakarta font-bold bg-gradient-to-l from-brand-purple to-brand-pink bg-clip-text text-transparent">
                ExamAI
              </span>
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
