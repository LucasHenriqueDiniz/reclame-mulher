"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, Building2, ChevronDown, FileText, LogOut, Menu, MessageSquare, Settings, Shield, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuthState } from "@/hooks/use-auth-state";
import { usePreventScrollShift } from "@/hooks/use-prevent-scroll-shift";
import { MainNav } from "./header/MainNav";
import { SearchModal } from "./SearchModal";

const mockNotifications = [
  { id: 0, title: "Bem-vindo!", message: "Explore a plataforma", time: "Agora", read: false },
];

export function MainHeader() {
  const router = useRouter();
  const [notificationCount] = useState(mockNotifications.length);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, profile, isLoggedIn, isCompany, isAdmin, clear } = useAuthState();

  // Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  usePreventScrollShift(mobileMenuOpen);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clear();
    router.push("/");
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

  const getHomeUrl = () => {
    if (!isLoggedIn) return "/";
    if (isAdmin) return "/app/admin";
    if (isCompany) return "/app/company/dashboard";
    return "/app";
  };

  return (
    <div className="sticky top-0 w-full z-40 bg-white border-b border-gray-200 shadow-sm">
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
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
          <span className="font-heading text-xl sm:text-2xl font-bold text-[#2A3F54] font-['Poppins']">
            ComunicaMulher
          </span>
        </Link>

        {/* Navigation Desktop */}
        <div className="hidden md:flex items-center flex-1 justify-center mx-4 lg:mx-6">
          <MainNav />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#2A3F54]" aria-label="Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-full p-0">
              <div className="flex flex-col h-full">
                <SheetHeader className="px-6 py-6 border-b">
                  <div className="flex items-center space-x-3">
                    <Image src="/logo.webp" alt="ComunicaMulher" width={40} height={40} className="object-contain" />
                    <SheetTitle className="font-heading text-xl font-bold text-[#2A3F54] font-['Poppins']">
                      ComunicaMulher
                    </SheetTitle>
                  </div>
                </SheetHeader>
                <ScrollArea className="flex-1">
                  <nav className="px-6 py-6 flex flex-col space-y-2">
                    <SheetClose asChild>
                      <Link href="/" className="flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins']">Home</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/companies" className="flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins']">Empresas</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/blog" className="flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins']">Blog</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setSearchOpen(true);
                        }}
                        className="w-full flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins'] text-left"
                      >
                        Buscar
                      </button>
                    </SheetClose>
                    {!isCompany && !isAdmin && isLoggedIn && (
                      <SheetClose asChild>
                        <Link href="/app/complaints/new" className="flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins']">Fale aqui</Link>
                      </SheetClose>
                    )}
                    <div className="border-t pt-4 mt-4">
                      {isLoggedIn ? (
                        <>
                          <div className="px-4 py-4 flex items-center space-x-3 mb-4 bg-gray-50 rounded-lg">
                            {profile?.avatar_url ? (
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={profile.avatar_url} alt={profile?.name || "Usuário"} />
                                <AvatarFallback className="bg-[#1E88E5] text-white text-sm">{getUserInitials()}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-[#1E88E5] text-white text-sm">
                                  {getUserInitials()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#2A3F54] truncate font-['Poppins']">{profile?.name || user?.email}</p>
                              <p className="text-xs text-gray-500 truncate font-['Poppins']">{user?.email}</p>
                            </div>
                          </div>
                          {isAdmin ? (
                            <>
                              <SheetClose asChild>
                                <Link href="/app/admin" className="flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins']">
                                  <Shield className="mr-3 h-5 w-5" />
                                  Painel admin
                                </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                <Link href="/app/admin/blog" className="flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins']">
                                  <FileText className="mr-3 h-5 w-5" />
                                  Gerenciar blog
                                </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                <Link href="/app/admin/companies" className="flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins']">
                                  <Building2 className="mr-3 h-5 w-5" />
                                  Empresas
                                </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                <Link href="/app/admin/audit" className="flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins']">
                                  <Wrench className="mr-3 h-5 w-5" />
                                  Auditoria
                                </Link>
                              </SheetClose>
                            </>
                          ) : isCompany ? (
                            <SheetClose asChild>
                              <Link href="/app/company/complaints" className="flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins']">
                                <MessageSquare className="mr-3 h-5 w-5" />
                                Ver relatos
                              </Link>
                            </SheetClose>
                          ) : (
                            <SheetClose asChild>
                              <Link href="/app/complaints" className="flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins']">
                                <MessageSquare className="mr-3 h-5 w-5" />
                                Meus relatos
                              </Link>
                            </SheetClose>
                          )}
                          {!isAdmin && (
                            <SheetClose asChild>
                              <Link href="/app/settings" className="flex items-center px-4 py-3 text-base font-medium text-[#2A3F54] hover:bg-gray-50 rounded-lg transition font-['Poppins']">
                                <Settings className="mr-3 h-5 w-5" />
                                Configurações
                              </Link>
                            </SheetClose>
                          )}
                          <button
                            onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                            className="w-full flex items-center px-4 py-3 text-base font-medium text-red-500 hover:bg-red-50 rounded-lg transition mt-4 font-['Poppins']"
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
                              className="block w-full text-center px-4 py-3 text-base font-heading font-medium text-[#2A3F54] border-2 border-[#2A3F54]/20 hover:border-[#2A3F54]/40 hover:bg-[#2A3F54]/5 rounded-full transition mb-3 font-['Poppins']"
                            >
                              Cadastrar
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Button
                              onClick={() => router.push("/login")}
                              className="w-full bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-full font-heading font-medium h-12 shadow-md hover:shadow-lg transition-all font-['Poppins']"
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
            {isAdmin ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-full px-4 font-['Poppins'] inline-flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Ferramentas
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/app/admin" className="cursor-pointer flex items-center font-['Poppins']">
                      <Shield className="mr-2 h-4 w-4 text-[#607D8B]" />
                      <span>Painel admin</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/admin/blog" className="cursor-pointer flex items-center font-['Poppins']">
                      <FileText className="mr-2 h-4 w-4 text-[#607D8B]" />
                      <span>Posts do blog</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/admin/companies" className="cursor-pointer flex items-center font-['Poppins']">
                      <Building2 className="mr-2 h-4 w-4 text-[#607D8B]" />
                      <span>Empresas</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/admin/audit" className="cursor-pointer flex items-center font-['Poppins']">
                      <Wrench className="mr-2 h-4 w-4 text-[#607D8B]" />
                      <span>Auditoria</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isCompany ? (
              <Button asChild className="bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-full px-4 font-['Poppins']">
                <Link href="/app/company/complaints">Ver relatos</Link>
              </Button>
            ) : (
              <Button asChild className="bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-full px-4 font-['Poppins']">
                <Link href="/app/complaints/new">Fale aqui</Link>
              </Button>
            )}

            <DropdownMenu modal={false} open={notificationMenuOpen} onOpenChange={setNotificationMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 text-[#2A3F54]" aria-label="Notificações">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#1E88E5] text-white text-[10px] font-semibold rounded-full border-2 border-white">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-4 py-3 border-b">
                  <h3 className="font-semibold text-[#2A3F54] font-['Poppins']">Notificações</h3>
                </div>
                <div className="p-4 text-center text-sm text-[#607D8B] font-['Poppins']">
                  Nenhuma notificação nova
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu modal={false} open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button aria-label="Menu de usuário" className="flex items-center space-x-2 hover:opacity-80 transition focus:outline-none">
                  {profile?.avatar_url ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url} alt={profile?.name || "Usuário"} />
                      <AvatarFallback className="bg-[#1E88E5] text-white text-sm">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[#1E88E5] text-white text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <ChevronDown aria-hidden="true" className="h-4 w-4 text-[#2A3F54]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* User Info Header */}
                <div className="px-3 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar_url} alt={profile?.name || "Usuário"} />
                        <AvatarFallback className="bg-[#1E88E5] text-white text-sm">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="bg-[#1E88E5] text-white text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-['Poppins'] font-semibold text-sm text-[#2A3F54] truncate">
                        {profile?.name || "Usuário"}
                      </p>
                      <p className="font-['Poppins'] text-xs text-[#607D8B] truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {isAdmin ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/app/admin" className="cursor-pointer flex items-center font-['Poppins'] px-3 py-2">
                          <Shield className="mr-3 h-4 w-4 text-[#607D8B]" />
                          <span>Painel admin</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/app/admin/blog" className="cursor-pointer flex items-center font-['Poppins'] px-3 py-2">
                          <FileText className="mr-3 h-4 w-4 text-[#607D8B]" />
                          <span>Gerenciar blog</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/app/admin/companies" className="cursor-pointer flex items-center font-['Poppins'] px-3 py-2">
                          <Building2 className="mr-3 h-4 w-4 text-[#607D8B]" />
                          <span>Empresas</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/app/admin/audit" className="cursor-pointer flex items-center font-['Poppins'] px-3 py-2">
                          <Wrench className="mr-3 h-4 w-4 text-[#607D8B]" />
                          <span>Auditoria</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/app/settings" className="cursor-pointer flex items-center font-['Poppins'] px-3 py-2">
                        <Settings className="mr-3 h-4 w-4 text-[#607D8B]" />
                        <span>Configurações</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isCompany ? (
                    <DropdownMenuItem asChild>
                      <Link href="/app/company/complaints" className="cursor-pointer flex items-center font-['Poppins'] px-3 py-2">
                        <MessageSquare className="mr-3 h-4 w-4 text-[#607D8B]" />
                        <span>Ver relatos</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : !isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link href="/app/complaints" className="cursor-pointer flex items-center font-['Poppins'] px-3 py-2">
                        <MessageSquare className="mr-3 h-4 w-4 text-[#607D8B]" />
                        <span>Meus relatos</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                </div>

                <DropdownMenuSeparator />

                {/* Logout */}
                <div className="py-1">
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer flex items-center font-['Poppins'] px-3 py-2"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/onboarding/role"
              className="font-heading font-medium text-sm hover:text-[#1E88E5] transition whitespace-nowrap text-[#2A3F54] font-['Poppins']"
            >
              Cadastrar
            </Link>
            <Button
              onClick={() => router.push("/login")}
              className="bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-full font-heading font-medium shadow-md hover:shadow-lg transition-all px-6 font-['Poppins']"
            >
              Entrar
            </Button>
          </div>
        )}
      </header>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
