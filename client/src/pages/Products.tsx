import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Star,
  Search,
  Filter,
  X,
  ChevronDown,
  Scale,
} from "lucide-react";
import { Link } from "wouter";
import { useComparison } from "@/contexts/ComparisonContext";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { addProduct, isInComparison } = useComparison();

  // Fetch categories and brands
  const { data: categories = [] } = trpc.products.categories.useQuery();
  const { data: brands = [] } = trpc.products.brands.useQuery();
  const { data: colors = [] } = trpc.products.colors.useQuery();
  const { data: sizes = [] } = trpc.products.sizes.useQuery();

  // Search and filter products
  const { data: searchResults = [], isLoading } = trpc.products.search.useQuery({
    query: searchQuery || undefined,
    minPrice,
    maxPrice,
    minRating,
    categories: selectedCategories.length > 0 ? selectedCategories : (undefined as any),
    brands: selectedBrands.length > 0 ? selectedBrands : (undefined as any),
    colors: selectedColors.length > 0 ? selectedColors : (undefined as any),
    sizes: selectedSizes.length > 0 ? selectedSizes : (undefined as any),
    limit: 50,
  });

  // Toggle category
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((item) => item !== brand) : [...prev, brand]
    );
  };

  const toggleValue = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    minRating !== undefined ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0;

  return (
    <div className="min-h-screen bg-[#F4F6FA]" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container py-4">
          <h1 className="text-3xl font-black text-gray-900 mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
            تصفح المنتجات
          </h1>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            />
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  الفلاتر
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    مسح الكل
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  نطاق السعر
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      السعر الأدنى (ر.س)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice || ""}
                      onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      السعر الأعلى (ر.س)
                    </label>
                    <input
                      type="number"
                      placeholder="10000"
                      value={maxPrice || ""}
                      onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  التقييم الأدنى
                </h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(minRating === rating ? undefined : rating)}
                      className={`w-full text-right text-sm py-2 px-3 rounded-lg transition-colors ${
                        minRating === rating
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{rating} نجوم فما فوق</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  البرندات
                </h3>
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => toggleBrand(brand.name)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                        selectedBrands.includes(brand.name)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {brand.logo ? <img src={brand.logo} alt="" className="h-5 w-5 rounded object-contain" /> : <span className="h-2 w-2 rounded-full bg-orange-500" />}
                        <span className="truncate">{brand.name}</span>
                      </span>
                      {selectedBrands.includes(brand.name) && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              {colors.length > 0 && (
                <div className="mb-6 border-b border-gray-100 pb-6">
                  <h3 className="mb-4 text-sm font-semibold text-gray-800" style={{ fontFamily: "'Cairo', sans-serif" }}>اللون</h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => toggleValue(color, setSelectedColors)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${selectedColors.includes(color) ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300"}`}
                        style={{ fontFamily: "'Cairo', sans-serif" }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {sizes.length > 0 && (
                <div className="mb-6 border-b border-gray-100 pb-6">
                  <h3 className="mb-4 text-sm font-semibold text-gray-800" style={{ fontFamily: "'Cairo', sans-serif" }}>المقاس</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleValue(size, setSelectedSizes)}
                        className={`min-w-10 rounded-lg border px-3 py-1.5 text-xs transition-colors ${selectedSizes.includes(size) ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300"}`}
                        style={{ fontFamily: "'Cairo', sans-serif" }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  الفئات
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`w-full text-right text-sm py-2 px-3 rounded-lg transition-colors ${
                        selectedCategories.includes(category)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6 flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                الفلاتر
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 font-semibold hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                  مسح
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-gray-600 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {isLoading ? "جاري البحث..." : `تم العثور على ${searchResults.length} منتج`}
              </p>
              {hasActiveFilters && !isLoading && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {selectedColors.length > 0 ? `${selectedColors.length} لون محدد` : selectedSizes.length > 0 ? `${selectedSizes.length} مقاس محدد` : selectedBrands.length > 0 ? `${selectedBrands.length} براند محدد` : "فلاتر مفعّلة"}
                </span>
              )}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse" />
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="text-gray-500 text-lg" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  لم نجد منتجات تطابق معايير البحث
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  مسح الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer">
                      {/* Image */}
                      <div className="relative h-52 bg-gray-50 overflow-hidden">
                        <img
                          src={product.image || ''}
                          alt={product.name}
                          className="w-full h-full object-contain bg-[#f8f8f8] p-2 group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.badge && (
                          <div className={`absolute top-3 right-3 ${product.badgeColor || 'bg-blue-600'} text-white text-xs font-bold px-2.5 py-1 rounded-lg`}>
                            {product.badge}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="text-xs text-blue-600 font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {product.brand}
                        </div>
                        <h3
                          className="font-bold text-gray-900 mb-2 leading-tight line-clamp-2"
                          style={{ fontFamily: "'Cairo', sans-serif" }}
                        >
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_, j) => (
                              <Star
                                key={j}
                                className={`w-3.5 h-3.5 ${
                                  j < Math.floor(parseFloat(product.rating as any))
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {product.rating} ({product.reviewCount})
                          </span>
                        </div>

                        {/* Price + CTA */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div
                              className="text-xl font-black text-blue-600"
                              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                              {parseFloat(product.price as any).toLocaleString()} ر.س
                            </div>
                            {product.oldPrice && (
                              <div
                                className="text-sm text-gray-400 line-through"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                              >
                                {parseFloat((product.oldPrice || '0') as any).toLocaleString()} ر.س
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
                              style={{ fontFamily: "'Cairo', sans-serif" }}
                            >
                              <ShoppingCart className="w-4 h-4 ml-1" />
                              أضف
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                addProduct({
                                  id: product.id,
                                  name: product.name,
                                  brand: product.brand,
                                  price: product.price,
                                  oldPrice: product.oldPrice ? String(product.oldPrice) : null,
                                  image: product.image || '',
                                  rating: String(product.rating),
                                  reviewCount: product.reviewCount || 0,
                                  category: product.category,
                                  description: product.description || '',
                                  stock: product.stock || 0,
                                });
                              }}
                              className={`${
                                isInComparison(product.id)
                                  ? "bg-orange-600 hover:bg-orange-700"
                                  : "bg-gray-200 hover:bg-gray-300"
                              } text-white rounded-xl transition-all active:scale-95`}
                              title="أضف للمقارنة"
                            >
                              <Scale className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
