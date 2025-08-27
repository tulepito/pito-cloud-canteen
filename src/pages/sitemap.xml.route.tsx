import type { GetServerSideProps } from 'next';

const generateSiteMap = () => {
  const baseUrl = process.env.NEXT_PUBLIC_CANONICAL_URL?.replace(/\/$/, '');
  const staticPaths = [''];

  const urls = staticPaths.map((path) => {
    const fullUrl = `${baseUrl}${path ? `/${path}` : ''}`;
    const priority = path === '' ? '1.0' : '0.8';

    return `
  <url>
    <loc>${fullUrl}</loc>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
};

function Sitemap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = generateSiteMap();

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
