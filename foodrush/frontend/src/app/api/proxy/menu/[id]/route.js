export async function GET(request, { params }) {
  try {
    const { id } = params
    const url = `${process.env.RESTAURANT_SERVICE_URL || 'http://restaurant-service:8002'}/api/restaurants/${id}/menu`
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data)
  } catch {
    return Response.json([])
  }
}
