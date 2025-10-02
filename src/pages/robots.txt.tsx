import type { GetServerSideProps } from 'next';

const generateRobotsTxt = () => {
  return `
User-agent: *
Disallow: /admin
Disallow: /company
Disallow: /partner
Disallow: /tracking
Disallow: /qrcode

Sitemap: ${process.env.NEXT_PUBLIC_CANONICAL_URL}/sitemap.xml
`.trim();
};

function Robots() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const robotsTxt = generateRobotsTxt();

  res.setHeader('Content-Type', 'text/plain');
  res.write(robotsTxt);
  res.end();

  return {
    props: {},
  };
};

export default Robots;
