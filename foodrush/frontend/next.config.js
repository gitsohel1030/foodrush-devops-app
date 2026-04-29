/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    USER_SERVICE_URL: process.env.USER_SERVICE_URL || 'http://user-service:8001',
    RESTAURANT_SERVICE_URL: process.env.RESTAURANT_SERVICE_URL || 'http://restaurant-service:8002',
    ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL || 'http://order-service:8003',
  }
}

module.exports = nextConfig
