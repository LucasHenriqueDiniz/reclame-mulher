"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Search, ChevronDown, Settings, MessageSquare, LogOut, Menu, CheckCircle, AlertCircle, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BoringAvatar from "boring-avatars";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { supabaseClient } from "@/lib/supabase/client";
import { usePreventScrollShift } from "@/hooks/use-prevent-scroll-shift";
import type { User } from "@supabase/supabase-js";

// Mock notifications data - substituir por dados reais
const mockNotifications = [
  { id: 0, title: "Bem-vindo ao ComunicaMulher!", message: "Estamos felizes em tê-lo aqui. Comece fazendo sua primeira reclamação!", time: "Agora", read: false, type: "info" },
  { id: 1, title: "Nova resposta", message: "Sua reclamação recebeu uma resposta", time: "2h", read: false, type: "info" },
  { id: 2, title: "Atualização", message: "Status da sua reclamação foi atualizado", time: "5h", read: false, type: "success" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ name: string; avatar_url?: string | null; email?: string; [key: string]: unknown } | null>(null);
  const [notificationCount] = useState(mockNotifications.length); // TODO: buscar do banco
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [textColorScrolled, setTextColorScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Detecta estados do header
  const isOnLandingPage = pathname === "/";
  const isLoggedIn = !!user;

  useEffect(() => {
    // Verifica sessão atual
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });

    // Escuta mudanças de autenticação
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isOnLandingPage) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Calcula progresso do scroll (0 a 25px = 0 a 1)
      const progress = Math.min(scrollPosition / 25, 1);
      setScrollProgress(progress);
      
      // Header muda para o topo após qualquer scroll
      setScrolled(scrollPosition > 0);
      // Texto muda de cor imediatamente (0px) para transição rápida
      setTextColorScrolled(scrollPosition > 0);
    };

    // Verifica posição inicial
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOnLandingPage]);

  // Previne deslocamento da página quando dropdowns/modais abrem (solução global)
  const hasOpenDropdown = userMenuOpen || notificationMenuOpen || mobileMenuOpen;
  usePreventScrollShift(hasOpenDropdown);

  // Close search when clicking outside
  useEffect(() => {
    if (!searchOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const searchForm = document.querySelector('form[class*="hidden md:flex"]');
      if (searchForm && !searchForm.contains(target)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  const loadProfile = async (userId: string) => {
    const { data } = await supabaseClient
      .from("profiles")
      .select("name, avatar_url, email")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    if (!isOnLandingPage) {
      router.push("/");
    }
  };

  const getUserInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(" ")
        .map((part: string) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  // Determina o estilo baseado nos 4 estados
  const getTextColor = () => {
    if (!isOnLandingPage) return "text-[var(--brand-purple-dark)]";
    return textColorScrolled ? "text-[var(--brand-purple-dark)]" : "text-white";
  };
  const getHomeUrl = () => isLoggedIn ? "/app" : "/";

  // Determina posição do header na landing page
  const getHeaderClasses = () => {
    if (!isOnLandingPage) {
      return "sticky top-0 bg-white";
    }
    
    if (scrolled) {
      return "bg-white";
    }
    
    // Posição inicial: transparente
    return "bg-transparent shadow-none";
  };

  // Calcula margin-top dinâmico baseado no scroll (hack para transição fluida)
  const getHeaderMarginTop = () => {
    if (!isOnLandingPage) return "0px";
    // Interpola entre 25px e 0px baseado no progresso do scroll
    const margin = 25 * (1 - scrollProgress);
    return `${margin}px`;
  };

  const handleSearchClick = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/companies?q=${encodeURIComponent(searchQuery.trim())}`);
      handleSearchClose();
    }
  };

  return (
    <>
      {/* Header wrapper para full width quando scrolled */}
      <div 
        data-header-wrapper
        className={
          isOnLandingPage && scrolled 
            ? "fixed top-0 left-0 right-0 w-full bg-white shadow-md z-50 h-[80px]" 
            : isOnLandingPage 
              ? "fixed top-0 left-0 right-0 w-full z-50 h-[80px]"
              : "sticky top-0 w-full z-50"
        }
        style={{
          marginTop: getHeaderMarginTop(),
          transition: "margin-top 0.3s ease-out, background-color 0.3s ease-out, box-shadow 0.3s ease-out",
        }}
      >
    <header
          className={`flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300 ease-out max-w-7xl mx-auto ${getHeaderClasses()}`}
    >
      {/* Logo */}
      <Link 
        href={getHomeUrl()}
        className="flex items-center space-x-3 group hover:opacity-80 transition whitespace-nowrap"
      >
        <Image
          src="/logo.webp"
          alt="ComunicaMulher"
          width={48}
          height={48}
          className="object-contain transition-transform group-hover:scale-110"
        />
        <span className={`font-heading text-xl sm:text-2xl font-bold transition-colors duration-150 ${getTextColor()}`}>
        ComunicaMulher
        </span>
      </Link>

      {/* Navigation Desktop */}
      <div className="hidden md:flex items-center flex-1 justify-center mx-4 lg:mx-6 min-h-[40px]">
        {!searchOpen ? (
      <nav
            className={`flex items-center space-x-3 lg:space-x-5 font-medium max-w-3xl ${getTextColor()} transition-colors duration-150`}
      >
        <Link
              href={getHomeUrl()}
          className="hover:opacity-70 transition whitespace-nowrap text-sm lg:text-base"
        >
          Home
        </Link>
        <Link
          href="/blog"
          className="hover:opacity-70 transition whitespace-nowrap text-sm lg:text-base"
        >
          Blog
        </Link>
        <Link
          href="/companies"
          className="hover:opacity-70 transition whitespace-nowrap text-sm lg:text-base"
        >
          Empresas
        </Link>
        <Button
          variant="ghost"
          size="icon"
              onClick={handleSearchClick}
              className={`hover:bg-transparent ml-2 transition-colors duration-150 ${getTextColor()}`}
          aria-label="Pesquisar"
        >
          <Search className="h-5 w-5" />
        </Button>
      </nav>
        ) : (
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center flex-1 justify-center transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-center w-full max-w-lg bg-gray-100 rounded-full px-5 py-2.5 border-2 border-[var(--brand-blue-light)] shadow-lg h-12">
              <Search className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Pesquisar empresas, reclamações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleSearchClose();
                  }
                }}
                autoFocus
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSearchClose}
                className="h-8 w-8 text-gray-500 hover:text-gray-700 ml-2 flex-shrink-0"
                aria-label="Fechar pesquisa"
              >
                ×
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={getTextColor()}
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-full p-0">
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-6 border-b">
                <div className="flex items-center space-x-3">
                  <Image
                    src="/logo.png"
                    alt="ComunicaMulher"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <SheetTitle className="font-heading text-xl font-bold text-[var(--brand-purple-dark)]">
                    ComunicaMulher
                  </SheetTitle>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <nav className="px-6 py-6 flex flex-col space-y-2">
                  <SheetClose asChild>
                    <Link
                      href={getHomeUrl()}
                      className="flex items-center px-4 py-3 text-base font-medium text-[var(--brand-purple-dark)] hover:bg-gray-50 rounded-lg transition"
                    >
                      Home
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/blog"
                      className="flex items-center px-4 py-3 text-base font-medium text-[var(--brand-purple-dark)] hover:bg-gray-50 rounded-lg transition"
                    >
                      Blog
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/companies"
                      className="flex items-center px-4 py-3 text-base font-medium text-[var(--brand-purple-dark)] hover:bg-gray-50 rounded-lg transition"
                    >
                      Empresas
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/app/complaints/new"
                      className="flex items-center px-4 py-3 text-base font-medium text-[var(--brand-purple-dark)] hover:bg-gray-50 rounded-lg transition"
                    >
                      Fazer Reclamação
                    </Link>
                  </SheetClose>
                  <div className="border-t pt-4 mt-4">
                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-4 flex items-center space-x-3 mb-4 bg-gray-50 rounded-lg">
                          {profile?.avatar_url ? (
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={profile.avatar_url}
                                alt={profile?.name || "Usuário"}
                              />
                              <AvatarFallback className="bg-[var(--brand-blue-light)] text-white text-sm">
                                {getUserInitials()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-12 w-12 rounded-full overflow-hidden">
                              <BoringAvatar
                                name={profile?.name || user?.email || "User"}
                                size={48}
                                variant="beam"
                                colors={["#3BA5FF", "#2A1B55", "#4C2D8F", "#2d8ddf", "#280F5E"]}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--brand-purple-dark)] truncate">
                              {profile?.name || user?.email}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        <SheetClose asChild>
                          <Link
                            href="/app/complaints"
                            className="flex items-center px-4 py-3 text-base font-medium text-[var(--brand-purple-dark)] hover:bg-gray-50 rounded-lg transition"
                          >
                            <MessageSquare className="mr-3 h-5 w-5" />
                            Reclamações
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/app/settings"
                            className="flex items-center px-4 py-3 text-base font-medium text-[var(--brand-purple-dark)] hover:bg-gray-50 rounded-lg transition"
                          >
                            <Settings className="mr-3 h-5 w-5" />
                            Configurações
                          </Link>
                        </SheetClose>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleSignOut();
                          }}
                          className="w-full flex items-center px-4 py-3 text-base font-medium text-red-500 hover:bg-red-50 rounded-lg transition mt-4"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          Sair
                        </button>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/onboarding/role"
                            className="block w-full text-center px-4 py-3 text-base font-heading font-medium text-[var(--brand-purple-dark)] border-2 border-[var(--brand-purple-dark)]/20 hover:border-[var(--brand-purple-dark)]/40 hover:bg-[var(--brand-purple-dark)]/5 rounded-full transition mb-3"
                          >
                            Cadastrar
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            onClick={() => router.push("/login")}
                            className="w-full bg-[var(--brand-blue-light)] hover:bg-[var(--brand-blue)] text-white rounded-full font-heading font-medium h-12 shadow-md hover:shadow-lg transition-all"
                          >
                            Entrar
                          </Button>
                        </SheetClose>
                      </>
                    )}
                  </div>
                </nav>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* User Section Desktop */}
      {isLoggedIn ? (
        <div className="hidden md:flex items-center space-x-3">
          {/* Fazer Reclamação Button */}
          <Button
            asChild
            className="bg-[var(--brand-blue-light)] hover:opacity-90 text-white rounded-full px-4"
          >
            <Link href="/app/complaints/new">
              Fazer Reclamação
            </Link>
          </Button>

          {/* Notifications Dropdown */}
          <DropdownMenu open={notificationMenuOpen} onOpenChange={setNotificationMenuOpen}>
            <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
                className={`relative hover:bg-gray-100 ${getTextColor()}`}
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                variant="default"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[var(--brand-blue-light)] text-white text-[10px] font-semibold rounded-full border-2 border-white"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-3 border-b">
                <h3 className="font-semibold text-[var(--brand-purple-dark)]">Notificações</h3>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-2">
                  {mockNotifications.length > 0 ? (
                    mockNotifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex items-start space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 mb-1"
                      >
                        <div className={`mt-0.5 ${
                          notification.type === "success" ? "text-green-500" :
                          notification.type === "info" ? "text-blue-500" :
                          "text-yellow-500"
                        }`}>
                          {notification.type === "success" ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : notification.type === "info" ? (
                            <Info className="h-5 w-5" />
                          ) : (
                            <AlertCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${notification.read ? "text-gray-600" : "text-[var(--brand-purple-dark)]"}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time} atrás</p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-[var(--brand-blue-light)] mt-2" />
                        )}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      Nenhuma notificação
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="px-4 py-2 border-t">
                <Button variant="ghost" className="w-full text-sm">
                  Ver todas
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 hover:opacity-80 transition focus:outline-none">
                {profile?.avatar_url ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={profile.avatar_url}
                      alt={profile?.name || "Usuário"}
                    />
                    <AvatarFallback className="bg-[var(--brand-blue-light)] text-white text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <BoringAvatar
                      name={profile?.name || user?.email || "User"}
                      size={40}
                      variant="beam"
                      colors={["#3BA5FF", "#2A1B55", "#4C2D8F", "#2d8ddf", "#280F5E"]}
                    />
                  </div>
                )}
                <ChevronDown className={`h-4 w-4 ${getTextColor()}`} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/app/settings" className="cursor-pointer flex items-center">
                  <Settings className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/complaints" className="cursor-pointer flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Reclamações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-500 focus:text-red-500 flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="hidden md:flex items-center space-x-3">
          <Link
            href="/onboarding/role"
            className={`font-heading font-medium text-sm transition-all duration-300 px-5 py-2.5 rounded-full border-2 ${
              isOnLandingPage && !scrolled
                ? "text-white border-white/30 hover:border-white/50 hover:bg-white/10"
                : isOnLandingPage && scrolled
                ? "text-[var(--brand-purple-dark)] border-[var(--brand-purple-dark)]/20 hover:border-[var(--brand-purple-dark)]/40 hover:bg-[var(--brand-purple-dark)]/5"
                : "text-[var(--brand-purple-dark)] border-[var(--brand-purple-dark)]/20 hover:border-[var(--brand-purple-dark)]/40 hover:bg-[var(--brand-purple-dark)]/5"
            }`}
          >
            Cadastrar
          </Link>
          <Button
            onClick={() => router.push("/login")}
            className={`font-heading font-medium text-sm px-6 py-2.5 rounded-full transition-all duration-300 ${
              isOnLandingPage && !scrolled
                ? "bg-white text-[var(--brand-blue-light)] hover:bg-white/90 shadow-lg hover:shadow-xl"
                : "bg-[var(--brand-blue-light)] hover:bg-[var(--brand-blue)] text-white shadow-md hover:shadow-lg"
            }`}
          >
            Entrar
          </Button>
        </div>
      )}
    </header>
      </div>
    </>
  );
}
