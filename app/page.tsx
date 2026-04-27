import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts } from '@/lib/webflow/client';
import type { WebflowPost } from '@/lib/webflow/client';

export const revalidate = 3600;

function PostCard({ post }: { post: WebflowPost }) {
  const image = post.fieldData['main-image'];
  const summary = post.fieldData['post-summary'] ?? '';
  const publishedOn = post.fieldData['published-on'] ?? post.createdOn;

  return (
    <Link
      href={`/blog/${post.fieldData.slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {image?.url && (
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={image.url}
            alt={image.alt ?? post.fieldData.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1 gap-2">
        <p className="text-xs text-gray-400">
          {new Date(publishedOn).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2">
          {post.fieldData.name}
        </h3>
        {summary && <p className="text-sm text-gray-500 line-clamp-3">{summary}</p>}
      </div>
    </Link>
  );
}

export default async function HomePage() {
  let posts: WebflowPost[] = [];
  try {
    posts = await getBlogPosts();
  } catch {
    // Webflow not configured — show empty state
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight text-gray-900">
            The Last Shall Be First
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Blog
            </Link>
            <Link
              href="/login"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-brand-50 to-white py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              The Last Shall Be First
            </h1>
            <p className="text-xl text-gray-500">
              Insights, stories, and AI-powered tools for the journey ahead.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/login"
                className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="#posts"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Read the Blog
              </Link>
            </div>
          </div>
        </section>

        {/* CMS Posts */}
        {posts.length > 0 && (
          <section id="posts" className="max-w-5xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* App CTA */}
        <section className="bg-gray-900 text-white py-16 px-4">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold">AI-Powered Assistant</h2>
            <p className="text-gray-400">
              Sign in to access your personal AI assistant that learns from your notes and helps you think clearly.
            </p>
            <Link
              href="/login"
              className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Access the App
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8 px-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} The Last Shall Be First. All rights reserved.
      </footer>
    </div>
  );
}
