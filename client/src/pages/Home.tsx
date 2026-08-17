/**
 * أبو علي للاتصالات — Landing Page
 * Design: Bold Electric Blue
 * Primary: #0057FF | Accent: #FF6B00 | BG: #F4F6FA | Text: #0D1B2A
 * Fonts: Cairo (headings) + Tajawal (body) + Space Grotesk (numbers)
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// ─── Scroll Animation Hook ────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Star,
  Truck,
  Shield,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Zap,
  Award,
  RefreshCw,
  Smartphone,
  Laptop,
  Watch,
  Cpu,
  Cable,
  Wrench,
  ArrowLeft,
  CheckCircle,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  LogOut,
  User,
  ChevronDown,
  Search,
  Grid2X2,
} from "lucide-react";

// ─── Image URLs ───────────────────────────────────────────────────────────────
const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663786811951/JRcgdRnyZJ9kJAosaM5xmy/hero-phones-SGaT8CjQ2U74WdzKsdc8JZ.webp";
const LOGO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663786811951/JRcgdRnyZJ9kJAosaM5xmy/logo-icon-25Ymxw43M7XJ4ot9A6W2DR.webp";
const PRODUCTS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663786811951/JRcgdRnyZJ9kJAosaM5xmy/products-banner-Ah5DDtn8483e8hcfHe7qZB.webp";
const OFFER_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663786811951/JRcgdRnyZJ9kJAosaM5xmy/offer-banner-VDtaR2fGfBCPSCNWmhGF2H.webp";
const DELIVERY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663786811951/JRcgdRnyZJ9kJAosaM5xmy/delivery-icon-KTUVpFbdUR8S46stnPejGJ.webp";

// ─── Data ─────────────────────────────────────────────────────────────────────

const offers = [
  { title: "خصم 30% على الهواتف المجددة", sub: "عروض محدودة الوقت", color: "from-blue-700 to-blue-900" },
  { title: "اشترِ لابتوب واحصل على حقيبة مجاناً", sub: "لفترة محدودة", color: "from-orange-500 to-orange-700" },
  { title: "شحن مجاني على الطلبات فوق 500 ريال", sub: "لجميع المحافظات", color: "from-green-600 to-green-800" },
];

const stats = [
  { value: "50,000+", label: "عميل راضٍ" },
  { value: "10,000+", label: "منتج متوفر" },
  { value: "15+", label: "سنة خبرة" },
  { value: "4.9/5", label: "تقييم العملاء" },
];

const features = [
  {
    icon: Truck,
    title: "توصيل سريع",
    desc: "توصيل خلال 24-48 ساعة لجميع المحافظات مع تتبع فوري لشحنتك",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Shield,
    title: "ضمان أصالة المنتج",
    desc: "جميع منتجاتنا أصلية 100% مع ضمان رسمي من الشركة المصنعة",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: RefreshCw,
    title: "سياسة إرجاع مرنة",
    desc: "إرجاع مجاني خلال 14 يوماً من تاريخ الاستلام بدون شروط معقدة",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Headphones,
    title: "دعم فني 24/7",
    desc: "فريق متخصص لدعمك على مدار الساعة عبر الهاتف والواتساب والشات",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const paymentMethods = ["Visa", "Mastercard", "Apple Pay", "Google Pay", "مدى", "الدفع عند الاستلام", "تحويل بنكي"];


// ─── Components ───────────────────────────────────────────────────────────────

function Navbar({ selectedCategory, onCategoryChange }: { selectedCategory?: string; onCategoryChange: (value: string | undefined) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const { data: categories = [] } = trpc.products.categories.useQuery();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("تم تسجيل الخروج بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const handleShoppingCart = () => {
    if (loading) return;
    if (!user) {
      window.location.href = getLoginUrl();
    } else {
      navigate("/cart");
    }
  };

  const navLinks = [
    { label: "الرئيسية", href: "#hero" },
    { label: "المنتجات", href: "#products" },
    { label: "العروض", href: "#offers", isOfferLink: true },
    { label: "تواصل معنا", href: "#contact" },
  ];

  const handleCategorySelect = (category?: string) => {
    onCategoryChange(category);
    if (category) {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        "bg-white/95 backdrop-blur-xl shadow-lg shadow-blue-900/5"
      }`}
    >
      <div className="hidden bg-blue-600 text-white md:block">
        <div className="container flex items-center justify-between py-2 text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>
          <span>متجر أبو علي للاتصالات — تسوق بثقة</span>
          <div className="flex items-center gap-5"><span>واتساب: 050 000 0000</span><span>الدعم متاح يومياً</span></div>
        </div>
      </div>
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-600 flex items-center justify-center shadow-md group-hover:shadow-blue-500/30 transition-shadow">
              <img src={LOGO_IMG} alt="أبو علي للاتصالات" className="w-8 h-8 object-contain" />
            </div>
            <div className="leading-tight">
              <div
                className={`font-bold text-base md:text-lg leading-none font-cairo transition-colors ${
                  "text-gray-900"
                }`}
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                أبو علي للاتصالات
              </div>
              <div className={`text-xs transition-colors ${"text-blue-600"}`}>
                وجهتك الأولى للتقنية
              </div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.isOfferLink ? (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => {
                    onCategoryChange("العروض");
                    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-blue-600/10 hover:text-blue-600 ${
                    "text-gray-700 hover:text-blue-600"
                  }`}
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-blue-600/10 hover:text-blue-600 ${
                    "text-gray-700 hover:text-blue-600"
                  }`}
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+966500000000"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                "text-gray-700 hover:text-blue-600"
              }`}
            >
              <Phone className="w-4 h-4" />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>+966 50 000 0000</span>
            </a>
                      {user ? (
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none ${
"bg-blue-50 text-blue-700 hover:bg-blue-100"
                      }`}
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      <User className="w-4 h-4" />
                      أهلاً وسهلاً، {user.name || "عميل"}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-right">
                      {user.name ? `مرحباً ${user.name}` : "مرحباً بك"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => navigate("/cart")}
                      className="text-right"
                    >
                      <ShoppingCart className="w-4 h-4 ml-2" />
                      السلة
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={handleLogout}
                      className="text-right text-destructive"
                    >
                      <LogOut className="w-4 h-4 ml-2" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    if (!loading) window.location.href = getLoginUrl();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 active:scale-95"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                  disabled={loading}
                >
                  {loading ? "جارٍ التحقق..." : "تسجيل الدخول"}
                </Button>
                <Button
                  onClick={handleShoppingCart}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 active:scale-95"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  <ShoppingCart className="w-4 h-4 ml-2" />
                  السلة
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
              <a
                href="tel:+966500000000"
                className="flex items-center gap-2 px-4 py-3 text-gray-600"
              >
                <Phone className="w-4 h-4 text-blue-600" />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>+966 50 000 0000</span>
              </a>
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-50 text-blue-700">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      أهلاً وسهلاً، {user.name || "عميل"}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      handleShoppingCart();
                      setMenuOpen(false);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold w-full rounded-xl"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    <ShoppingCart className="w-4 h-4 ml-2" />
                    السلة
                  </Button>
                  <Button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full text-sm font-medium rounded-lg border-gray-300 hover:bg-gray-100"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    <LogOut className="w-4 h-4 ml-1" />
                    خروج
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      if (!loading) {
                        window.location.href = getLoginUrl();
                      }
                      setMenuOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full rounded-xl"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                    disabled={loading}
                  >
                    {loading ? "جارٍ التحقق..." : "تسجيل الدخول"}
                  </Button>
                  <Button
                    onClick={() => {
                      handleShoppingCart();
                      setMenuOpen(false);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold w-full rounded-xl"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    <ShoppingCart className="w-4 h-4 ml-2" />
                    السلة
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function CatalogHero({
  selectedCategory,
  onCategoryChange,
  onSearch,
  saleProducts,
}: {
  selectedCategory?: string;
  onCategoryChange: (value: string | undefined) => void;
  onSearch: (value: string) => void;
  saleProducts: any[];
}) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const brandMenuTimerRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  const { data: brands = [] } = trpc.products.brands.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  const liveQuery = query.trim();
  const featuredProduct = saleProducts[activeImageIndex] ?? saleProducts[0] ?? null;
  const heroImage = featuredProduct?.image || "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1600&q=80";
  const heroBrand = featuredProduct?.brand || "إلكترونيات";
  const heroCategory = featuredProduct?.category || "منتجات مميزة";
  const heroDescription = featuredProduct?.description || "اكتشف أحدث المنتجات والبرندات والفئات المتوفرة في متجرنا مع عروض حصرية ومواصفات قوية.";
  const heroPrice = featuredProduct?.price != null ? `${Number(featuredProduct.price).toLocaleString("ar-SA")} ر.س` : "السعر عند الطلب";

  useEffect(() => {
    if (saleProducts.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % saleProducts.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [saleProducts]);
  const { data: suggestions = [], isFetching: suggestionsLoading } = trpc.products.search.useQuery(
    { query: liveQuery, limit: 6 },
    { enabled: searchOpen && liveQuery.length >= 2 }
  );

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    onSearch(value);
    setSearchOpen(false);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!searchOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => searchInputRef.current?.focus(), 100);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const selectSuggestion = (product: { id: number }) => {
    setSearchOpen(false);
    navigate(`/product/${product.id}`);
  };

  const topBrands = useMemo(() => {
    const list = Array.from(
      new Set((brands ?? []).map((brand) => brand.name).filter(Boolean) as string[])
    );
    return list.length > 0 ? list : ["Apple", "Samsung", "Xiaomi", "Nike", "Sony", "LG", "Huawei", "Dell"];
  }, [brands]);

  const brandCategoryMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const product of products) {
      const brand = product.brand?.trim();
      const category = product.category?.trim();
      if (!brand || !category) continue;
      const current = map.get(brand) ?? [];
      if (!current.includes(category)) {
        current.push(category);
        map.set(brand, current);
      }
    }
    return map;
  }, [products]);

  const clearBrandMenuTimer = () => {
    if (brandMenuTimerRef.current) {
      window.clearTimeout(brandMenuTimerRef.current);
      brandMenuTimerRef.current = null;
    }
  };

  const openBrandMenu = (brand: string) => {
    clearBrandMenuTimer();
    setActiveBrand(brand);
  };

  const closeBrandMenu = (brand: string) => {
    clearBrandMenuTimer();
    brandMenuTimerRef.current = window.setTimeout(() => {
      setActiveBrand((current) => (current === brand ? null : current));
    }, 120);
  };

  return (
    <section id="hero" className="bg-[#f4f6fa] pb-10 pt-24 md:pt-28">
      <div className="container">
        <div className="relative z-20 mb-4 flex flex-wrap items-center justify-start gap-2 overflow-visible rounded-[18px] border border-slate-200 bg-white/90 px-2 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          {topBrands.map((brand) => {
            const brandCategories = brandCategoryMap.get(brand) ?? [];
            const isActive = activeBrand === brand;
            const shouldShowMenu = isActive && brandCategories.length > 0;

            return (
              <div
                key={brand}
                className="relative z-20"
                onMouseEnter={() => openBrandMenu(brand)}
                onMouseLeave={() => closeBrandMenu(brand)}
              >
                <button
                  type="button"
                  onFocus={() => openBrandMenu(brand)}
                  onClick={() => setActiveBrand((current) => (current === brand ? null : brand))}
                  className={`flex min-w-[120px] items-center justify-between gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${selectedCategory === brand ? "border-[#f97316] bg-[#fff7ed] text-[#f97316]" : "border-[#cbd5e1] bg-[#ffffff] text-[#1f2937] hover:border-[#93c5fd] hover:bg-[#f8fbff]"}`}
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  <span>{brand}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
                </button>

                {shouldShowMenu && (
                  <div
                    className="absolute left-1/2 top-full z-[90] mt-2 w-[180px] -translate-x-1/2 rounded-[16px] border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
                    onMouseEnter={() => openBrandMenu(brand)}
                    onMouseLeave={() => closeBrandMenu(brand)}
                  >
                    <div className="mb-1 px-2 pt-1 text-center text-[10px] font-bold text-slate-400" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      الفئات المرتبطة
                    </div>
                    {brandCategories.map((category) => (
                      <button
                        key={`${brand}-${category}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          onCategoryChange(category);
                          clearBrandMenuTimer();
                          setActiveBrand(null);
                          document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className={`block w-full rounded-xl px-2 py-2 text-center text-sm font-medium transition ${selectedCategory === category ? "bg-[#fff7ed] text-[#f97316]" : "text-slate-800 hover:bg-[#f8fafc] hover:text-[#0f172a]"}`}
                        style={{ fontFamily: "'Cairo', sans-serif" }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
          <img
            src={heroImage}
            alt={featuredProduct?.name || "عروض خاصة"}
            className="absolute inset-0 h-full object-cover transition-all duration-[1400ms] ease-in-out"
            style={{width:"35%"}}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#0b1220]/80 via-[#0b1220]/20 to-[#0b1220]/65" />

          <div className="relative z-10 px-4 py-5 md:px-8 md:py-8">
            {/* <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:bg-white/20"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                <Search className="h-4 w-4" />
                بحث سريع
              </button>
            </div> */}

            <div dir="rtl" className="grid w-full gap-6 md:min-h-[420px] md:grid-cols-2 md:items-end">
              <div className="rounded-[24px] border border-white/15 bg-slate-950/25 p-5 text-right backdrop-blur-sm md:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    العلامة التجارية
                  </span>
                  <span className="rounded-full bg-[#fbbf24]/15 px-3 py-1 text-sm font-bold text-[#fbbf24]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {heroBrand}
                  </span>
                </div>
                <p className="mb-2 text-xs font-semibold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  الفئة
                </p>
                <h1 className="text-3xl font-black leading-tight text-white md:text-4xl" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {heroCategory}
                </h1>
                <p className="mt-4 text-xs font-semibold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  اسم المنتج
                </p>
                <h2 className="mt-1 text-xl font-bold leading-relaxed text-[#dbeafe]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {featuredProduct?.name || "منتج مميز"}
                </h2>
                <p className="mt-4 text-xs font-semibold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  الوصف
                </p>
                <p className="mt-1 max-w-[440px] text-sm leading-7 text-slate-200 md:text-base" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  {heroDescription}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/15 pt-4">
                  <span className="text-xs font-semibold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    السعر
                  </span>
                  <span className="text-xl font-black text-[#fbbf24]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {heroPrice}
                  </span>
                </div>
              </div>

              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm md:min-h-[280px]">
                <p className="max-w-[420px] text-base font-semibold leading-8 text-white md:text-lg" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  اكتشف أحدث المنتجات والبرندات والفئات المتوفرة في متجرنا مع عروض حصرية ومواصفات قوية.
                </p>
                <button
                  type="button"
                  onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="mt-7 rounded-[18px] bg-[#f97316] px-8 py-3 text-lg font-black text-white shadow-lg shadow-orange-950/30 transition hover:bg-[#ea580c]"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  تسوق الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/55 px-4 pt-24 backdrop-blur-sm md:pt-32"
          role="dialog"
          aria-modal="true"
          aria-label="البحث عن المنتجات"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSearchOpen(false);
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-slate-950/25">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold text-[#f97316]" style={{ fontFamily: "'Cairo', sans-serif" }}>بحث سريع</p>
                <h2 className="mt-1 text-lg font-black text-slate-900" style={{ fontFamily: "'Cairo', sans-serif" }}>ما الذي تبحث عنه؟</h2>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="إغلاق البحث"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitSearch} className="p-5">
              <div className="flex min-h-14 items-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 focus-within:border-[#f97316] focus-within:bg-white">
                <Search className="mx-4 h-5 w-5 shrink-0 text-[#f97316]" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="اكتب اسم المنتج أو البراند..."
                  className="h-full min-w-0 flex-1 bg-transparent px-1 text-right text-sm text-slate-800 outline-none"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                  autoComplete="off"
                />
                <button type="submit" className="h-full bg-[#f97316] px-6 font-bold text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  بحث
                </button>
              </div>

              {liveQuery.length >= 2 && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70">
                  {suggestionsLoading ? (
                    <div className="space-y-2 p-3">
                      {[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-200/70" />)}
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {suggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => selectSuggestion(product)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-right transition hover:bg-white"
                        >
                          <img src={product.image || "https://via.placeholder.com/80x80?text=Product"} alt="" className="h-12 w-12 shrink-0 rounded-xl object-contain bg-[#f8f8f8] p-1" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-slate-800" style={{ fontFamily: "'Cairo', sans-serif" }}>{product.name}</span>
                            <span className="mt-1 block truncate text-xs text-[#f97316]" style={{ fontFamily: "'Tajawal', sans-serif" }}>{product.brand || "منتج متوفر"} · {Number(product.price).toLocaleString()} ر.س</span>
                          </span>
                          <ChevronLeft className="h-4 w-4 shrink-0 text-slate-300" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-5 text-center text-sm text-slate-400" style={{ fontFamily: "'Tajawal', sans-serif" }}>لم نعثر على منتجات مطابقة.</p>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function HeroSection({ saleProducts }: { saleProducts: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (saleProducts.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % saleProducts.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [saleProducts]);

  const featuredProduct = saleProducts[activeIndex] ?? saleProducts[0] ?? null;
  const image = featuredProduct?.image || HERO_IMG;
  const title = featuredProduct?.name || "أحدث العروض";
  const description = featuredProduct?.description || "اكتشف أفضل المنتجات والعروض المميزة من متجر أبو علي للاتصالات.";
  const price = featuredProduct ? `${Number(featuredProduct.price || 0).toLocaleString()} ر.س` : "خصم يصل إلى 50%";

  return (
    <section
      id="hero"
      className="relative min-h-[75vh] md:min-h-[82vh] flex items-center overflow-hidden bg-[#0D1B2A] shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
    >
      <div className="absolute inset-0">
        <img
          key={image}
          src={image}
          alt={title}
          className="h-full w-full object-contain opacity-60 transition-all duration-[1400ms] ease-in-out scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0d1b2a]/75 via-[#0d1b2a]/30 to-[#0d1b2a]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_30%)]" />
      </div>

      <div className="absolute top-1/4 left-1/4 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="container relative z-10 pb-16 pt-24">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-white/90" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {featuredProduct ? "أفضل عروض اليوم" : "أكثر من 10,000 منتج في المخزون"}
            </span>
          </div>

          <h1
            className="mb-6 text-4xl font-black leading-[1.1] text-white md:text-5xl lg:text-[5rem]"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            <span className="block text-white">{title}</span>
          </h1>

          <p
            className="mb-8 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {description}
          </p>

          <div className="mb-10 flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.2)] backdrop-blur-sm">
              <div className="text-xs text-white/70" style={{ fontFamily: "'Tajawal', sans-serif" }}>السعر</div>
              <div className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{price}</div>
            </div>
            <Button
              size="lg"
              className="rounded-2xl bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-orange-500/30 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-95"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <ShoppingCart className="ml-2 h-5 w-5" />
              تسوق الآن
            </Button>
          </div>

        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="h-8 w-px bg-gradient-to-b from-white/0 via-white/60 to-white/0" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
      </div>
    </section>
  );
}

function ProductsSection({
  selectedCategory,
  searchQuery,
  onCategoryChange,
}: {
  selectedCategory?: string;
  searchQuery: string;
  onCategoryChange: (value: string | undefined) => void;
}) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const searchResult = trpc.products.search.useQuery({ query: searchQuery || undefined, limit: 24 });
  const productList = trpc.products.list.useQuery(undefined, { enabled: !searchQuery });
  const products = searchQuery ? (searchResult.data ?? []) : (productList.data ?? []);
  const productsLoading = searchQuery ? searchResult.isLoading : productList.isLoading;
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "العروض") {
      return products.filter((product) => Boolean(product.isOnSale));
    }
    if (!selectedCategory) return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المنتج إلى السلة");
    },
    onError: () => {
      toast.error("يرجى تسجيل الدخول أولاً");
      window.location.href = getLoginUrl();
    },
  });

  const handleAddToCart = (productId: number) => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});

  const sidebarBrands = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const product of products) {
      const brand = product.brand?.trim();
      const category = product.category?.trim();
      if (!brand) continue;
      if (!map.has(brand)) map.set(brand, new Set());
      if (category) map.get(brand)?.add(category);
    }
    return Array.from(map.entries()).map(([brand, categories]) => ({ brand, categories: Array.from(categories) }));
  }, [products]);

  return (
    <section id="products" className="bg-[#f5f5f5] py-8 md:py-10">
      <div className="container">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#444] shadow-sm">
              <Grid2X2 className="h-4 w-4" />
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#444] shadow-sm">
              <Menu className="h-4 w-4" />
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-[#666]" style={{ fontFamily: "'Cairo', sans-serif" }}>تسوق حسب</span>
            <h2 className="text-2xl font-black text-[#111827]" style={{ fontFamily: "'Cairo', sans-serif" }}>أحدث المنتجات</h2>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-[18px] border border-[#e7e7e7] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-black text-[#111827]" style={{ fontFamily: "'Cairo', sans-serif" }}>الأقسام</div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff7ed] text-[#f97316]">+</div>
            </div>

            <div className="space-y-2">
              {sidebarBrands.map(({ brand, categories }) => {
                const isExpanded = Boolean(expandedBrands[brand]);
                return (
                  <div key={brand} className="rounded-xl border border-[#f3f4f6] bg-[#fafafa]">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isExpanded;
                        setExpandedBrands((prev) => ({ ...prev, [brand]: next }));
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-right text-sm font-medium text-[#333] transition hover:bg-[#f5f5f5]"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      <span>{brand}</span>
                      <span className="text-[#999]">{isExpanded ? "−" : "+"}</span>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-[#f3f4f6] px-2 py-2">
                        {categories.length > 0 ? categories.map((category) => (
                          <button
                            key={`${brand}-${category}`}
                            type="button"
                            onClick={() => {
                              onCategoryChange(category);
                              document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className={`block w-full rounded-lg px-2 py-2 text-right text-xs text-[#555] transition hover:bg-[#fff7ed] hover:text-[#f97316] ${selectedCategory === category ? "bg-[#fff7ed] text-[#f97316]" : ""}`}
                            style={{ fontFamily: "'Cairo', sans-serif" }}
                          >
                            {category}
                          </button>
                        )) : (
                          <div className="px-2 py-2 text-xs text-[#666]" style={{ fontFamily: "'Cairo', sans-serif" }}>لا توجد فئات مرتبطة</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button type="button" className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#555]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  الفرز: الافتراضي
                </button>
                <button type="button" className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#555]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  السعر
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#666]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                <span>{selectedCategory === "العروض" ? "عروض" : "عرض"}</span>
                <span className="rounded-lg bg-white px-2 py-1">{filteredProducts.length}</span>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {((productsLoading ? Array.from({ length: 6 }) : filteredProducts) as any[]).map((product: any, i: number) => {
                const isPlaceholder = productsLoading;
                const ratingValue = isPlaceholder ? 0 : Math.floor(Number(product.rating) || 0);
                return (
                  <div
                    key={isPlaceholder ? `loading-${i}` : product.id}
                    className="group overflow-hidden rounded-[18px] border border-[#ececec] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="relative h-52 overflow-hidden bg-[#f5f5f5]">
                      {isPlaceholder ? (
                        <div className="h-full w-full animate-pulse bg-gray-200" />
                      ) : (
                        <img src={product.image || "https://via.placeholder.com/400x300?text=Product"} alt={product.name} className="h-full w-full object-contain bg-[#f8f8f8] p-2 transition duration-500 group-hover:scale-105" />
                      )}
                      {!isPlaceholder && product.badge && (
                        <span className={`absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-bold text-white ${product.badgeColor || "bg-[#f97316]"}`}>{product.badge}</span>
                      )}
                      <button className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#444] shadow-sm">
                        <Star className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="mb-2 text-xs font-semibold text-[#8b5cf6]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {isPlaceholder ? "..." : product.brand}
                      </div>
                      {!isPlaceholder && product.description && (
                        <p className="mb-2 line-clamp-2 text-xs leading-5 text-[#666]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                          {product.description}
                        </p>
                      )}
                      <h3 className="mb-2 min-h-[48px] text-base font-bold leading-6 text-[#111827]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        {isPlaceholder ? "..." : product.name}
                      </h3>

                      <div className="mb-3 flex items-center gap-1.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={`h-3.5 w-3.5 ${j < ratingValue ? "fill-[#fbbf24] text-[#fbbf24]" : "text-[#d1d5db]"}`} />
                        ))}
                        <span className="text-xs text-[#666]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {isPlaceholder ? "..." : `${Number(product.rating || 0).toFixed(1)} (${product.reviewCount ?? 0})`}
                        </span>
                      </div>

                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <div className="text-xl font-black text-[#111827]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {isPlaceholder ? "..." : `${Number(product.price).toLocaleString()} ر.س`}
                          </div>
                          {!isPlaceholder && product.oldPrice && (
                            <div className="text-xs text-[#9ca3af] line-through" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {`${Number(product.oldPrice).toLocaleString()} ر.س`}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => !isPlaceholder && handleAddToCart(product.id)}
                          disabled={addToCartMutation.isPending || isPlaceholder}
                          className="rounded-xl bg-[#f97316] px-3 text-white hover:bg-[#ea580c] disabled:opacity-50"
                          style={{ fontFamily: "'Cairo', sans-serif" }}
                        >
                          <ShoppingCart className="ml-1 h-4 w-4" />
                          {addToCartMutation.isPending ? "..." : "أضف"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OffersSection() {
  return (
    <section id="offers" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={OFFER_BG} alt="" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-[#0D1B2A]/75" />
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-full px-4 py-1.5 text-sm font-medium mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
            <Zap className="w-4 h-4" />
            عروض حصرية
          </div>
          <h2
            className="text-3xl md:text-4xl font-black text-white"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            لا تفوّت هذه العروض!
          </h2>
          <p className="text-gray-400 mt-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            عروض محدودة الوقت — اغتنم الفرصة قبل انتهائها
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {offers.map((offer, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${offer.color} rounded-2xl p-6 border border-white/10 hover:scale-105 transition-transform duration-200 cursor-pointer animate-fade-in-up`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-white/70 text-sm mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {offer.sub}
              </div>
              <h3
                className="text-white font-black text-xl leading-tight"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {offer.title}
              </h3>
              <button
                className="mt-4 text-white/80 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                اكتشف العرض
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Products image */}
        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <img
            src={PRODUCTS_IMG}
            alt="منتجاتنا المميزة"
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-[#F4F6FA]">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
            <Award className="w-4 h-4" />
            لماذا أبو علي؟
          </div>
          <h2
            className="text-3xl md:text-4xl font-black text-gray-900"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            تجربة تسوق لا مثيل لها
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 animate-fade-in-up group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-12 h-12 ${feat.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${feat.color}`} />
                </div>
                <h3
                  className="font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {feat.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Delivery visual */}
        <div className="mt-16 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6 w-fit" style={{ fontFamily: "'Cairo', sans-serif" }}>
                <Truck className="w-4 h-4" />
                التوصيل السريع
              </div>
              <h3
                className="text-2xl md:text-3xl font-black text-gray-900 mb-4"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                توصيل لجميع المحافظات
                <br />
                <span className="text-blue-600">خلال 24-48 ساعة</span>
              </h3>
              <ul className="space-y-3 mb-8">
                {[
                  "تتبع فوري لشحنتك عبر الرسائل",
                  "شحن مجاني على الطلبات فوق 500 ر.س",
                  "التغليف الآمن لجميع الأجهزة",
                  "خيار الاستلام من المتجر متاح",
                ].map((item, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl w-fit shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                اطلب الآن
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-8">
              <img
                src={DELIVERY_IMG}
                alt="توصيل سريع"
                className="w-full max-w-sm object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PaymentSection() {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3
              className="text-lg font-bold text-gray-900 mb-1"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              وسائل الدفع المتاحة
            </h3>
            <p className="text-sm text-gray-500" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              ادفع بالطريقة التي تناسبك — آمن ومشفر 100%
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            {paymentMethods.map((method, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-700 via-blue-800 to-[#0D1B2A] relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-orange-500/20 blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container relative z-10 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
          <MessageCircle className="w-4 h-4" />
          تواصل معنا عبر واتساب
        </div>
        <h2
          className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          جاهز للتسوق؟
          <br />
          <span className="text-orange-400">نحن هنا لمساعدتك</span>
        </h2>
        <p
          className="text-gray-300 text-lg mb-10 max-w-xl mx-auto"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          فريقنا المتخصص يستقبل استفساراتك على مدار الساعة.
          احصل على أفضل عرض لما تحتاجه الآن.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white font-black text-base px-10 py-4 rounded-2xl shadow-xl shadow-green-500/30 btn-cta transition-all active:scale-95"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            <MessageCircle className="w-5 h-5 ml-2" />
            تواصل عبر واتساب
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 font-bold text-base px-10 py-4 rounded-2xl transition-all"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            <Phone className="w-5 h-5 ml-2" />
            اتصل بنا مباشرة
          </Button>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: "", phone: "", message: "" });
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-[#F4F6FA]">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
              <Phone className="w-4 h-4" />
              تواصل معنا
            </div>
            <h2
              className="text-3xl md:text-4xl font-black text-gray-900 mb-4"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              نحن دائماً
              <br />
              <span className="text-blue-600">في خدمتك</span>
            </h2>
            <p
              className="text-gray-500 mb-8 leading-relaxed"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              هل لديك استفسار؟ تريد معرفة سعر منتج معين؟ أو تحتاج مساعدة في اختيار الجهاز المناسب؟
              فريقنا جاهز لمساعدتك.
            </p>

            <div className="space-y-4">
              {[
                { icon: Phone, label: "الهاتف", value: "+966 50 000 0000", href: "tel:+966500000000" },
                { icon: MessageCircle, label: "واتساب", value: "+966 50 000 0000", href: "https://wa.me/966500000000" },
                { icon: Mail, label: "البريد الإلكتروني", value: "info@abuali-telecom.com", href: "mailto:info@abuali-telecom.com" },
                { icon: MapPin, label: "العنوان", value: "الرياض، المملكة العربية السعودية", href: "#" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <a
                    key={i}
                    href={item.href}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        {item.label}
                      </div>
                      <div className="font-semibold text-gray-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {item.value}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h3
              className="text-xl font-black text-gray-900 mb-6"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              أرسل لنا رسالة
            </h3>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  تم إرسال رسالتك بنجاح!
                </h4>
                <p className="text-gray-500 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  سنتواصل معك في أقرب وقت ممكن
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="أدخل اسمك الكامل"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 bg-gray-50"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    رقم الجوال
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+966 5X XXX XXXX"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 bg-gray-50"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr", textAlign: "right" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    رسالتك
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="اكتب استفسارك أو طلبك هنا..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 bg-gray-50 resize-none"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  إرسال الرسالة
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0D1B2A] text-white pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <img src={LOGO_IMG} alt="أبو علي للاتصالات" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <div className="font-black text-lg" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  أبو علي للاتصالات
                </div>
                <div className="text-xs text-blue-400">وجهتك الأولى للتقنية</div>
              </div>
            </div>
            <p
              className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              متجرك المتخصص في الهواتف الذكية، اللابتوبات، الإكسسوارات وقطع الغيار.
              خبرة تتجاوز 15 عاماً في خدمة عملائنا الكرام.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Youtube, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 bg-white/10 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4
              className="font-bold text-white mb-4"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              روابط سريعة
            </h4>
            <ul className="space-y-2">
              {["الصفحة الرئيسية", "المنتجات", "العروض والتخفيضات", "من نحن", "سياسة الخصوصية", "الشروط والأحكام"].map(
                (link, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-bold text-white mb-4"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              تواصل معنا
            </h4>
            <ul className="space-y-3">
              {[
                { icon: Phone, text: "+966 50 000 0000" },
                { icon: Mail, text: "info@abuali-telecom.com" },
                { icon: MapPin, text: "الرياض، المملكة العربية السعودية" },
              ].map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span
                    className="text-gray-400 text-sm"
                    style={{ fontFamily: i === 0 ? "'Space Grotesk', sans-serif" : "'Tajawal', sans-serif" }}
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-gray-500 text-sm"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            © 2024 أبو علي للاتصالات. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-gray-500 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              موقع آمن ومشفر بـ SSL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── WhatsApp Floating Button ─────────────────────────────────────────────────
function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <a
      href="https://wa.me/966500000000"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 left-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/40 transition-all duration-300 animate-pulse-ring ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
      }`}
      title="تواصل عبر واتساب"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function () {
  useScrollReveal();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products = [] } = trpc.products.list.useQuery();

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      <CatalogHero
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSearch={setSearchQuery}
        saleProducts={products.filter((product: any) => Boolean(product.isOnSale))}
      />
      <ProductsSection selectedCategory={selectedCategory} searchQuery={searchQuery} onCategoryChange={setSelectedCategory} />
      <PaymentSection />
      <CTASection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
