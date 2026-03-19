"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { CompaniesDropdown } from "./CompaniesDropdown";
import { BlogDropdown } from "./BlogDropdown";
import { SearchModal } from "../SearchModal";

export function MainNav() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link
              href="/"
              className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-[#2A3F54] transition-colors hover:bg-gray-100 hover:text-[#1E88E5] focus:bg-gray-100 focus:text-[#1E88E5] focus:outline-none disabled:pointer-events-none disabled:opacity-50 font-['Poppins']"
            >
              Home
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="font-['Poppins'] text-[#2A3F54] hover:text-[#1E88E5]">
              Empresas
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <CompaniesDropdown />
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="font-['Poppins'] text-[#2A3F54] hover:text-[#1E88E5]">
              Blog
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <BlogDropdown />
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <button
              onClick={() => setSearchOpen(true)}
              className="group inline-flex h-10 w-max items-center justify-center gap-2 rounded-md bg-transparent px-4 py-2 text-sm font-medium text-[#2A3F54] transition-colors hover:bg-gray-100 hover:text-[#1E88E5] focus:bg-gray-100 focus:text-[#1E88E5] focus:outline-none disabled:pointer-events-none disabled:opacity-50 font-['Poppins']"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
