'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ThemeSwitcher } from './theme-switcher';
import { LanguageSwitcher } from './language-switcher';
import { Sparkles, User, LogIn, LogOut, History } from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const scrollToSection = (sectionId: string) => {
    // 如果不在首页，先跳转到首页
    if (pathname !== '/') {
      router.push(`/#${sectionId}`);
    } else {
      // 如果在首页，直接滚动到对应区域
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  // 处理退出登录确认
  const handleSignOut = () => {
    if (window.confirm('确定要退出登录吗？')) {
      signOut();
    }
  };

  // 处理移动端退出登录确认
  const handleMobileSignOut = () => {
    if (window.confirm('确定要退出登录吗？')) {
      signOut();
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className=" px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center w-64">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI语音克隆
              </span>
            </Link>
          </div>

          {/* Center - Navigation Menu */}
          <div className="hidden md:flex items-center justify-center space-x-8 flex-1 max-w-md">
            <button
              onClick={() => scrollToSection('studio')}
              className="text-foreground hover:text-primary   font-medium"
            >
              复刻
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-foreground hover:text-primary   font-medium"
            >
              定价
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-foreground hover:text-primary  font-medium"
            >
              常见问题
            </button>
            <Link
              href="/history"
              className="text-foreground hover:text-primary font-medium   "
            >
              生成历史
            </Link>
          </div>

          {/* Right side - Controls and User */}
          <div className="flex items-center justify-end gap-3 w-64">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-accent"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Language and Theme Switchers */}
            <div className="hidden sm:flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>

            {/* User Avatar/Login */}
            <div className="hidden sm:flex items-center">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm bg-muted/50 px-2 py-1.5 rounded-md border border-border">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-muted-foreground max-w-20 truncate text-xs">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1 text-sm px-2 py-1.5 rounded-md hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 transition-colors duration-200"
                    title="退出登录"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-md border border-border bg-background hover:bg-accent text-foreground transition-colors duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>登录</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Navigation Links */}
              <button
                onClick={() => scrollToSection('studio')}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors duration-200"
              >
                复刻
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors duration-200"
              >
                定价
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors duration-200"
              >
                常见问题
              </button>
              <Link
                href="/history"
                className="flex items-center gap-2 px-3 py-2 text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <History className="h-4 w-4" />
                生成历史
              </Link>

              {/* Mobile Controls */}
              <div className="border-t border-border pt-2 mt-2 space-y-2">
                {/* Language and Theme Switchers for Mobile */}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-muted-foreground">设置</span>
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                  </div>
                </div>

                {/* Mobile User Controls */}
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm bg-muted/50 rounded-md border border-border">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-foreground font-medium text-sm truncate">
                          {user.email?.split('@')[0]}
                        </span>
                        <span className="text-muted-foreground text-xs truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleMobileSignOut}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md border border-border bg-background hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/10 dark:hover:border-red-800 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>退出</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md border border-border bg-background hover:bg-accent text-foreground transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>登录</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 