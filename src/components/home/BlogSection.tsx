'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Calendar } from 'lucide-react';
import { blogPosts } from '@/lib/mock-data';

export default function BlogSection() {
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">From Our Blog</h2>
            <p className="text-muted-foreground mt-2">Latest tips, trends, and insights</p>
          </div>
          
          <Link 
            href="/blog" 
            className="inline-flex items-center text-primary font-medium hover:underline mt-4 md:mt-0"
          >
            View All Articles
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="group">
              <article className="bg-card rounded-xl overflow-hidden border border-border group-hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-block bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs px-2.5 py-1 rounded">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center text-muted-foreground mb-3 text-sm">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span className="mx-2">•</span>
                    <span>By {post.author}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <div className="inline-flex items-center text-primary font-medium">
                    Read More
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        
        {/* Mobile View All Button */}
        <div className="flex justify-center mt-8 md:hidden">
          <Link 
            href="/blog" 
            className="bg-primary/10 text-primary px-6 py-2.5 rounded-lg font-medium hover:bg-primary/20 transition-colors"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
} 