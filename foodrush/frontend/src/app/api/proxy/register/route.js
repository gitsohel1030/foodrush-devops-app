export async function POST(request) {
  const body = await request.json()
  const url = `${process.env.USER_SERVICE_URL || 'http://user-service:8001'}/api/users/register`
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
