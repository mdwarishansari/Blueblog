import '@testing-library/jest-dom'

process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-key-min-32-chars-long'
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-min-32-chars-long'
process.env['NEXT_PUBLIC_SITE_NAME'] = 'BlueBlog'
process.env['NEXT_PUBLIC_SITE_URL'] = 'http://localhost:3000'
process.env['NEXT_PUBLIC_SITE_DESCRIPTION'] = 'SEO optimized blogging platform'
process.env['NEXT_PUBLIC_DEFAULT_OG_IMAGE'] = '/og-default.png'
process.env['NEXT_PUBLIC_TWITTER_HANDLE'] = '@blueblog'
