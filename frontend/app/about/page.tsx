import SEO from '@/components/seo/SEO'

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn more about our blog, mission, and what we publish"
        canonical="/about"
      />

      <div className="max-w-5xl px-4 mx-auto py-14">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">About This Blog</h1>
          <p className="mt-3 text-gray-600">
            Ideas, tutorials, and insights — written with clarity and purpose.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <p>
            This blog is built to share high-quality articles on technology,
            programming, and practical problem-solving. The goal is simple:
            <strong> publish content that is actually useful</strong>.
          </p>

          <p>
            We focus on clear explanations, real examples, and modern tools.
            Whether you are a beginner or an experienced developer, you’ll find
            articles that respect your time and intelligence.
          </p>

          <h2>What You’ll Find Here</h2>
          <ul>
            <li>Programming tutorials and guides</li>
            <li>Technology insights and best practices</li>
            <li>Real-world development tips</li>
            <li>Clean, distraction-free reading experience</li>
          </ul>

          <h2>Our Philosophy</h2>
          <p>
            No fluff. No copy-paste content. Every post is written with intent.
            If something is published here, it’s because it adds value.
          </p>

          <p>
            This platform is designed to grow over time, with content quality
            taking priority over quantity.
          </p>
        </div>
      </div>
    </>
  )
}
