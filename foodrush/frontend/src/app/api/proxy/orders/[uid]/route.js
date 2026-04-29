export async function GET(request, { params }) {
  try {
    const { uid } = params
    const url = `${process.env.ORDER_SERVICE_URL || 'http://order-service:8003'}/api/orders/user/${uid}`
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data)
  } catch {
    return Response.json([])
  }
}
