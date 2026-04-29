export async function GET() {
  try {
    const url = `${process.env.RESTAURANT_SERVICE_URL || 'http://restaurant-service:8002'}/api/restaurants`
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data)
  } catch {
    return Response.json([
      { id: 1, name: "Burger Bae", cuisine: "American", rating: 4.8, delivery_time: "20-30 min", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", description: "Juicy smash burgers that slap different 🔥", is_open: 1 },
      { id: 2, name: "Sushi Sensei", cuisine: "Japanese", rating: 4.9, delivery_time: "35-45 min", image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400", description: "No cap, the freshest sushi in town 🍣", is_open: 1 },
      { id: 3, name: "Pizza Gang", cuisine: "Italian", rating: 4.7, delivery_time: "25-35 min", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", description: "Wood-fired pizzas bussin fr fr 🍕", is_open: 1 },
      { id: 4, name: "Taco Tribe", cuisine: "Mexican", rating: 4.6, delivery_time: "15-25 min", image_url: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400", description: "Street tacos that hit different every time 🌮", is_open: 1 },
    ])
  }
}
