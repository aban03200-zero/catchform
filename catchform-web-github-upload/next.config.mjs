/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 이 폴더를 프로젝트 최상위로 고정한다. 상위 폴더에 다른 프로젝트(bun.lock)가 있어서
  // 고정하지 않으면 Next.js 가 최상위를 상위 폴더로 잡고 app 폴더를 찾지 못한다.
  turbopack: { root: import.meta.dirname },
}

export default nextConfig
