// Mock products data
export const products = [
  {
    id: "1",
    title: "Premium Wireless Headphones",
    price: 149.99,
    originalPrice: 199.99,
    discountPercentage: 25,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000",
    vendorName: "AudioTech",
    category: "electronics",
    badges: ["New", "Top Rated"]
  },
  {
    id: "2",
    title: "Smart Fitness Tracker",
    price: 89.95,
    originalPrice: 99.99,
    discountPercentage: 10,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd962?q=80&w=1000",
    vendorName: "FitGear",
    category: "electronics"
  },
  {
    id: "3",
    title: "Organic Cotton T-Shirt",
    price: 29.99,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000",
    vendorName: "EcoWear",
    category: "clothing"
  },
  {
    id: "4",
    title: "Handcrafted Ceramic Mug Set",
    price: 34.50,
    originalPrice: 45.00,
    discountPercentage: 23,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000",
    vendorName: "ArtisanCrafts",
    category: "home",
    badges: ["Handmade"]
  },
  {
    id: "5",
    title: "Natural Skincare Gift Box",
    price: 65.00,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1000",
    vendorName: "PureGlow",
    category: "beauty",
    badges: ["Organic", "Bestseller"]
  },
  {
    id: "6",
    title: "Vintage Leather Messenger Bag",
    price: 129.00,
    originalPrice: 159.00,
    discountPercentage: 19,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1548863227-3af567fc3b27?q=80&w=1000",
    vendorName: "Heritage",
    category: "accessories"
  },
  {
    id: "7",
    title: "Smart Home Security Camera",
    price: 79.99,
    originalPrice: 119.99,
    discountPercentage: 33,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1558002038-1055e2e28ed1?q=80&w=1000",
    vendorName: "SecureTech",
    category: "electronics",
    badges: ["Sale"]
  },
  {
    id: "8",
    title: "Handmade Gold Plated Earrings",
    price: 45.50,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?q=80&w=1000",
    vendorName: "LuxeJewels",
    category: "jewelry"
  }
];

// Mock categories data
export const categories = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1000",
    description: "Latest gadgets and tech accessories",
    productCount: 143
  },
  {
    id: "2",
    name: "Clothing",
    slug: "clothing",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1000",
    description: "Fashion for all styles and occasions",
    productCount: 286
  },
  {
    id: "3",
    name: "Home & Living",
    slug: "home",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000",
    description: "Everything for your home and lifestyle",
    productCount: 197
  },
  {
    id: "4",
    name: "Beauty & Health",
    slug: "beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000",
    description: "Skincare, makeup and wellness products",
    productCount: 124
  },
  {
    id: "5",
    name: "Jewelry",
    slug: "jewelry",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000",
    description: "Stunning accessories and fine jewelry",
    productCount: 89
  },
  {
    id: "6",
    name: "Books & Stationery",
    slug: "books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
    description: "Books, journals and office supplies",
    productCount: 112
  }
];

// Mock vendors data
export const vendors = [
  {
    id: "1",
    name: "AudioTech",
    logo: "https://images.unsplash.com/photo-1560800655-140be02920aa?q=80&w=800",
    description: "Premium audio equipment and accessories",
    rating: 4.8,
    productCount: 45,
    featured: true
  },
  {
    id: "2",
    name: "EcoWear",
    logo: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=800",
    description: "Sustainable and eco-friendly clothing",
    rating: 4.6,
    productCount: 67,
    featured: true
  },
  {
    id: "3",
    name: "ArtisanCrafts",
    logo: "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?q=80&w=800",
    description: "Handcrafted home goods and decor",
    rating: 4.9,
    productCount: 32,
    featured: true
  }
];

// Mock flash sales data
export const flashSales = {
  endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  products: [
    {
      id: "fs1",
      title: "Limited Edition Smart Watch",
      price: 99.99,
      originalPrice: 249.99,
      discountPercentage: 60,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000",
      vendorName: "TechGadgets",
      category: "electronics",
      stockRemaining: 15,
      totalStock: 50,
      badges: ["Flash Sale", "Limited"]
    },
    {
      id: "fs2",
      title: "Designer Sunglasses",
      price: 59.99,
      originalPrice: 149.99,
      discountPercentage: 60,
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000",
      vendorName: "FashionFocus",
      category: "accessories",
      stockRemaining: 8,
      totalStock: 30,
      badges: ["Flash Sale"]
    },
    {
      id: "fs3",
      title: "Luxury Scented Candle Set",
      price: 24.99,
      originalPrice: 59.99,
      discountPercentage: 58,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1000",
      vendorName: "HomeComforts",
      category: "home",
      stockRemaining: 22,
      totalStock: 40,
      badges: ["Flash Sale"]
    }
  ]
};

// Mock blog posts data
export const blogPosts = [
  {
    id: "1",
    title: "10 Must-Have Tech Gadgets for 2023",
    excerpt: "Discover the latest innovations that are changing the way we live and work.",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1000",
    date: "2023-06-15",
    author: "Tech Team",
    category: "Technology"
  },
  {
    id: "2",
    title: "Sustainable Fashion: A Guide to Eco-Friendly Shopping",
    excerpt: "How to build a wardrobe that looks good and does good for the planet.",
    image: "https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?q=80&w=1000",
    date: "2023-05-22",
    author: "Style Editor",
    category: "Fashion"
  },
  {
    id: "3",
    title: "Home Office Setup: Boost Your Productivity",
    excerpt: "Essential tips and products to create the perfect work-from-home environment.",
    image: "https://images.unsplash.com/photo-1593476550610-87baa860004a?q=80&w=1000",
    date: "2023-04-10",
    author: "Workspace Guru",
    category: "Lifestyle"
  }
];

// Mock testimonials
export const testimonials = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5,
    comment: "I've been shopping here for years and have always had an amazing experience. The products are high quality and shipping is always fast!",
    date: "2023-05-15"
  },
  {
    id: "2",
    name: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 4,
    comment: "Great selection of unique items that you can't find anywhere else. Customer service is top notch too.",
    date: "2023-06-02"
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 5,
    comment: "I love that I can support small businesses while shopping for exactly what I need. The personalized recommendations are spot on!",
    date: "2023-06-10"
  }
]; 