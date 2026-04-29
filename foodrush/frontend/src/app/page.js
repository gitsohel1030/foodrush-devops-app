'use client'
import { useState, useEffect } from 'react'

const API = {
  restaurants: '/api/proxy/restaurants',
  menu: (id) => `/api/proxy/menu/${id}`,
  order: '/api/proxy/order',
  orders: (uid) => `/api/proxy/orders/${uid}`,
  register: '/api/proxy/register',
  login: '/api/proxy/login',
}

export default function Home() {
  const [page, setPage] = useState('home')
  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [menu, setMenu] = useState([])
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [orderPlaced, setOrderPlaced] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchRestaurants()
    const saved = localStorage.getItem('foodrush_user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const fetchRestaurants = async () => {
    try {
      const res = await fetch(API.restaurants)
      const data = await res.json()
      setRestaurants(data)
    } catch { setRestaurants(mockRestaurants) }
  }

  const fetchMenu = async (restaurant) => {
    setSelectedRestaurant(restaurant)
    setLoading(true)
    try {
      const res = await fetch(API.menu(restaurant.id))
      const data = await res.json()
      setMenu(data)
    } catch { setMenu(mockMenu[restaurant.id] || []) }
    setLoading(false)
    setPage('menu')
  }

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
    showToast(`${item.emoji} ${item.name} added to cart!`)
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  const placeOrder = async () => {
    if (!user) { showToast('Login first bestie 😅', 'error'); setPage('auth'); return }
    if (cart.length === 0) { showToast('Your cart is empty!', 'error'); return }
    setLoading(true)
    try {
      const res = await fetch(API.order, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          restaurant_id: selectedRestaurant.id,
          restaurant_name: selectedRestaurant.name,
          items: cart,
          delivery_address: '123 Main Street'
        })
      })
      const data = await res.json()
      setOrderPlaced(data)
      setCart([])
      setPage('confirmation')
      showToast('Order placed! You\'re gonna eat good 🔥')
    } catch {
      showToast('Order placed! (demo mode) 🎉')
      setOrderPlaced({ order_id: Math.floor(Math.random()*9000)+1000, status: 'placed', total: cartTotal.toFixed(2), estimated_delivery: '30-40 min' })
      setCart([])
      setPage('confirmation')
    }
    setLoading(false)
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const endpoint = authMode === 'login' ? API.login : API.register
      const body = authMode === 'login' ? { email: form.email, password: form.password } : form
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (res.ok) {
        const u = { id: data.id, name: data.name, email: data.email }
        setUser(u)
        localStorage.setItem('foodrush_user', JSON.stringify(u))
        showToast(`Welcome ${data.name}! Let's eat 🍽️`)
        setPage('home')
      } else {
        showToast(data.detail || 'Something went wrong', 'error')
      }
    } catch {
      // demo mode
      const u = { id: 1, name: form.name || 'Demo User', email: form.email }
      setUser(u)
      localStorage.setItem('foodrush_user', JSON.stringify(u))
      showToast('Logged in (demo mode) 🎉')
      setPage('home')
    }
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('foodrush_user')
    setPage('home')
    showToast('See ya! 👋')
  }

  const fetchOrders = async () => {
    if (!user) { setPage('auth'); return }
    setLoading(true)
    try {
      const res = await fetch(API.orders(user.id))
      const data = await res.json()
      setOrders(data)
    } catch { setOrders([]) }
    setLoading(false)
    setPage('orders')
  }

  const statusColor = { placed: '#f59e0b', confirmed: '#3b82f6', preparing: '#8b5cf6', out_for_delivery: '#f97316', delivered: '#10b981' }
  const statusEmoji = { placed: '📋', confirmed: '✅', preparing: '👨‍🍳', out_for_delivery: '🛵', delivered: '🎉' }

  return (
    <div style={styles.root}>
      {/* Background */}
      <div style={styles.bg} />
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.bgOrb3} />

      {/* Toast */}
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === 'error' ? '#ef4444' : '#10b981' }}>
          {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <button onClick={() => setPage('home')} style={styles.logo}>
            🍔 <span style={styles.logoText}>FoodRush</span>
          </button>
          <div style={styles.navLinks}>
            {user ? (
              <>
                <button onClick={fetchOrders} style={styles.navBtn}>📦 Orders</button>
                <span style={styles.userChip}>👋 {user.name.split(' ')[0]}</span>
                <button onClick={logout} style={styles.navBtnOutline}>Logout</button>
              </>
            ) : (
              <button onClick={() => setPage('auth')} style={styles.navBtnPrimary}>Login / Sign Up</button>
            )}
            {cartCount > 0 && (
              <button onClick={() => setPage('cart')} style={styles.cartBtn}>
                🛒 <span style={styles.cartBadge}>{cartCount}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main style={styles.main}>

        {/* HOME PAGE */}
        {page === 'home' && (
          <div>
            <div style={styles.hero}>
              <div style={styles.heroTag}>✨ 30-min delivery guaranteed</div>
              <h1 style={styles.heroTitle}>
                Food that <span style={styles.heroAccent}>hits different</span> 🔥
              </h1>
              <p style={styles.heroSub}>No cap, the freshest eats delivered straight to your door. Order up bestie.</p>
              <div style={styles.heroBadges}>
                <span style={styles.badge}>🚀 Super Fast</span>
                <span style={styles.badge}>💯 Top Rated</span>
                <span style={styles.badge}>🔥 Trending</span>
              </div>
            </div>

            <h2 style={styles.sectionTitle}>What's poppin' today</h2>
            <div style={styles.grid}>
              {restaurants.map(r => (
                <div key={r.id} style={styles.card} onClick={() => fetchMenu(r)}>
                  <div style={styles.cardImgWrap}>
                    <img src={r.image_url} alt={r.name} style={styles.cardImg} />
                    <div style={styles.cardRating}>⭐ {r.rating}</div>
                    {r.is_open ? <div style={styles.cardOpen}>OPEN</div> : <div style={{...styles.cardOpen, background:'#ef4444'}}>CLOSED</div>}
                  </div>
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{r.name}</h3>
                    <p style={styles.cardCuisine}>{r.cuisine} • {r.delivery_time}</p>
                    <p style={styles.cardDesc}>{r.description}</p>
                    <button style={styles.cardBtn}>Order Now →</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.statsRow}>
              <div style={styles.statCard}><div style={styles.statNum}>4+</div><div style={styles.statLabel}>Restaurants</div></div>
              <div style={styles.statCard}><div style={styles.statNum}>30min</div><div style={styles.statLabel}>Avg Delivery</div></div>
              <div style={styles.statCard}><div style={styles.statNum}>4.8⭐</div><div style={styles.statLabel}>Avg Rating</div></div>
            </div>
          </div>
        )}

        {/* MENU PAGE */}
        {page === 'menu' && selectedRestaurant && (
          <div>
            <button onClick={() => setPage('home')} style={styles.backBtn}>← Back</button>
            <div style={styles.menuHeader}>
              <img src={selectedRestaurant.image_url} alt={selectedRestaurant.name} style={styles.menuHeroImg} />
              <div style={styles.menuHeaderOverlay}>
                <h2 style={styles.menuTitle}>{selectedRestaurant.name}</h2>
                <p style={styles.menuSub}>⭐ {selectedRestaurant.rating} • {selectedRestaurant.delivery_time} • {selectedRestaurant.cuisine}</p>
                <p style={styles.menuDesc}>{selectedRestaurant.description}</p>
              </div>
            </div>

            {loading ? <div style={styles.loader}>Loading menu... 🍽️</div> : (
              <div style={styles.menuGrid}>
                {menu.map(item => (
                  <div key={item.id} style={styles.menuCard}>
                    <div style={styles.menuEmoji}>{item.emoji}</div>
                    <div style={styles.menuInfo}>
                      <div style={styles.menuItemName}>{item.name}</div>
                      <div style={styles.menuItemDesc}>{item.description}</div>
                      <div style={styles.menuItemCategory}>{item.category}</div>
                    </div>
                    <div style={styles.menuRight}>
                      <div style={styles.menuPrice}>${item.price}</div>
                      <button style={styles.addBtn} onClick={() => addToCart(item)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div style={styles.floatingCart} onClick={() => setPage('cart')}>
                🛒 View Cart ({cartCount} items) · ${cartTotal.toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* CART PAGE */}
        {page === 'cart' && (
          <div style={styles.cartPage}>
            <button onClick={() => setPage(selectedRestaurant ? 'menu' : 'home')} style={styles.backBtn}>← Back</button>
            <h2 style={styles.sectionTitle}>Your Cart 🛒</h2>
            {cart.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 64 }}>🛒</div>
                <p style={{ color: '#94a3b8', marginTop: 16 }}>Your cart is empty bestie</p>
                <button onClick={() => setPage('home')} style={styles.navBtnPrimary}>Browse Restaurants</button>
              </div>
            ) : (
              <>
                <div style={styles.cartList}>
                  {cart.map(item => (
                    <div key={item.id} style={styles.cartItem}>
                      <span style={{ fontSize: 28 }}>{item.emoji}</span>
                      <div style={{ flex: 1, marginLeft: 12 }}>
                        <div style={{ color: '#f1f5f9', fontWeight: 700 }}>{item.name}</div>
                        <div style={{ color: '#94a3b8', fontSize: 14 }}>x{item.quantity} · ${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={styles.removeBtn}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={styles.cartSummary}>
                  <div style={styles.cartTotal}>Total: <span style={{ color: '#f97316' }}>${cartTotal.toFixed(2)}</span></div>
                  <div style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>+ delivery fee • Estimated 30-45 min</div>
                  <button onClick={placeOrder} style={styles.orderBtn} disabled={loading}>
                    {loading ? 'Placing Order...' : '🚀 Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* CONFIRMATION PAGE */}
        {page === 'confirmation' && orderPlaced && (
          <div style={styles.confirmPage}>
            <div style={styles.confirmCard}>
              <div style={styles.confirmEmoji}>🎉</div>
              <h2 style={styles.confirmTitle}>Order Placed!</h2>
              <p style={styles.confirmSub}>Your food is on the way bestie</p>
              <div style={styles.confirmDetails}>
                <div style={styles.confirmRow}><span>Order ID</span><span style={{ color: '#f97316' }}>#{orderPlaced.order_id}</span></div>
                <div style={styles.confirmRow}><span>Total</span><span style={{ color: '#10b981' }}>${orderPlaced.total}</span></div>
                <div style={styles.confirmRow}><span>ETA</span><span style={{ color: '#3b82f6' }}>⏱ {orderPlaced.estimated_delivery}</span></div>
                <div style={styles.confirmRow}><span>Status</span><span style={{ color: '#f59e0b' }}>📋 {orderPlaced.status}</span></div>
              </div>
              <div style={styles.trackingBar}>
                {['placed','confirmed','preparing','out_for_delivery','delivered'].map((s, i) => (
                  <div key={s} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20 }}>{statusEmoji[s]}</div>
                    <div style={{ fontSize: 10, color: orderPlaced.status === s ? '#f97316' : '#475569', marginTop: 4 }}>{s.replace('_',' ')}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setPage('home')} style={styles.orderBtn}>Back to Home 🏠</button>
            </div>
          </div>
        )}

        {/* ORDERS PAGE */}
        {page === 'orders' && (
          <div>
            <button onClick={() => setPage('home')} style={styles.backBtn}>← Back</button>
            <h2 style={styles.sectionTitle}>Your Orders 📦</h2>
            {loading ? <div style={styles.loader}>Loading... ⏳</div> : orders.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 64 }}>📭</div>
                <p style={{ color: '#94a3b8', marginTop: 16 }}>No orders yet — go get some food!</p>
                <button onClick={() => setPage('home')} style={styles.navBtnPrimary}>Order Now</button>
              </div>
            ) : (
              <div style={styles.ordersList}>
                {orders.map(o => (
                  <div key={o.id} style={styles.orderCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18 }}>{o.restaurant_name}</div>
                        <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Order #{o.id}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#f97316', fontWeight: 700, fontSize: 20 }}>${o.total_amount}</div>
                        <div style={{ ...styles.statusPill, background: statusColor[o.status] || '#64748b' }}>
                          {statusEmoji[o.status]} {o.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUTH PAGE */}
        {page === 'auth' && (
          <div style={styles.authPage}>
            <div style={styles.authCard}>
              <div style={{ fontSize: 48, textAlign: 'center' }}>🍔</div>
              <h2 style={styles.authTitle}>{authMode === 'login' ? 'Welcome back!' : 'Join FoodRush'}</h2>
              <p style={styles.authSub}>{authMode === 'login' ? 'Login to order your faves' : 'Create your account to start eating'}</p>
              <form onSubmit={handleAuth} style={styles.authForm}>
                {authMode === 'register' && (
                  <>
                    <input style={styles.input} placeholder="Your name 😊" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    <input style={styles.input} placeholder="Phone number 📱" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </>
                )}
                <input style={styles.input} type="email" placeholder="Email address 📧" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                <input style={styles.input} type="password" placeholder="Password 🔒" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                <button type="submit" style={styles.orderBtn} disabled={loading}>
                  {loading ? 'Loading...' : authMode === 'login' ? '🚀 Login' : '✨ Create Account'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 16, color: '#64748b' }}>
                {authMode === 'login' ? "No account? " : "Have an account? "}
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  {authMode === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

// Mock data for demo/offline mode
const mockRestaurants = [
  { id: 1, name: "Burger Bae", cuisine: "American", rating: 4.8, delivery_time: "20-30 min", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", description: "Juicy smash burgers that slap different 🔥", is_open: 1 },
  { id: 2, name: "Sushi Sensei", cuisine: "Japanese", rating: 4.9, delivery_time: "35-45 min", image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400", description: "No cap, the freshest sushi in town 🍣", is_open: 1 },
  { id: 3, name: "Pizza Gang", cuisine: "Italian", rating: 4.7, delivery_time: "25-35 min", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", description: "Wood-fired pizzas bussin fr fr 🍕", is_open: 1 },
  { id: 4, name: "Taco Tribe", cuisine: "Mexican", rating: 4.6, delivery_time: "15-25 min", image_url: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400", description: "Street tacos that hit different every time 🌮", is_open: 1 },
]
const mockMenu = {
  1: [{ id: 1, name: "Smash Burger", price: 12.99, category: "Burgers", emoji: "🍔", description: "Double smash patty, cheddar, special sauce" }, { id: 2, name: "Truffle Fries", price: 5.99, category: "Sides", emoji: "🍟", description: "Shoestring fries with truffle oil" }],
  2: [{ id: 5, name: "Dragon Roll", price: 16.99, category: "Rolls", emoji: "🍣", description: "Shrimp tempura, avocado, topped with eel" }, { id: 6, name: "Miso Ramen", price: 14.99, category: "Hot", emoji: "🍜", description: "Rich miso broth with chashu pork" }],
  3: [{ id: 9, name: "Margherita OG", price: 13.99, category: "Pizza", emoji: "🍕", description: "San Marzano tomato, fresh mozzarella" }, { id: 10, name: "Pepperoni Storm", price: 15.99, category: "Pizza", emoji: "🔥", description: "Cup & char pepperoni, triple cheese" }],
  4: [{ id: 12, name: "Al Pastor Tacos x3", price: 10.99, category: "Tacos", emoji: "🌮", description: "Marinated pork, pineapple, cilantro" }, { id: 13, name: "Loaded Nachos", price: 9.99, category: "Sharing", emoji: "🧀", description: "Tortilla chips loaded with all the goods" }],
}

const styles = {
  root: { minHeight: '100vh', background: '#0a0f1e', fontFamily: "'Segoe UI', system-ui, sans-serif", position: 'relative', overflow: 'hidden' },
  bg: { position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, #1a0533 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #0d1f3c 0%, transparent 60%)', zIndex: 0 },
  bgOrb1: { position: 'fixed', top: '-20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' },
  bgOrb2: { position: 'fixed', bottom: '-20%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' },
  bgOrb3: { position: 'fixed', top: '40%', left: '40%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' },
  toast: { position: 'fixed', top: 80, right: 20, color: '#fff', padding: '12px 20px', borderRadius: 12, fontWeight: 700, zIndex: 9999, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backdropFilter: 'blur(20px)', background: 'rgba(10,15,30,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  navInner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 22 },
  logoText: { fontWeight: 900, background: 'linear-gradient(135deg, #f97316, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 22 },
  navLinks: { display: 'flex', alignItems: 'center', gap: 12 },
  navBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 14, transition: 'all 0.2s' },
  navBtnOutline: { background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 14 },
  navBtnPrimary: { background: 'linear-gradient(135deg, #f97316, #ec4899)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: 14 },
  userChip: { background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 600 },
  cartBtn: { position: 'relative', background: 'linear-gradient(135deg, #f97316, #ec4899)', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: 16 },
  cartBadge: { background: '#fff', color: '#f97316', borderRadius: '50%', padding: '2px 7px', fontSize: 12, fontWeight: 900, marginLeft: 6 },
  main: { maxWidth: 1200, margin: '0 auto', padding: '80px 24px 40px', position: 'relative', zIndex: 1 },
  hero: { textAlign: 'center', padding: '60px 0 40px' },
  heroTag: { display: 'inline-block', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20 },
  heroTitle: { fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1, margin: '0 0 16px' },
  heroAccent: { background: 'linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { color: '#64748b', fontSize: 18, maxWidth: 500, margin: '0 auto 24px' },
  heroBadges: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  badge: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '8px 18px', borderRadius: 20, fontSize: 14, fontWeight: 600 },
  sectionTitle: { color: '#f1f5f9', fontSize: 28, fontWeight: 900, margin: '40px 0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' },
  cardImgWrap: { position: 'relative', height: 180, overflow: 'hidden' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardRating: { position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', color: '#f1f5f9', padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700 },
  cardOpen: { position: 'absolute', top: 12, right: 12, background: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 1 },
  cardBody: { padding: 20 },
  cardTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: 800, margin: '0 0 4px' },
  cardCuisine: { color: '#f97316', fontSize: 13, fontWeight: 600, margin: '0 0 8px' },
  cardDesc: { color: '#64748b', fontSize: 14, margin: '0 0 16px', lineHeight: 1.5 },
  cardBtn: { background: 'linear-gradient(135deg, #f97316, #ec4899)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, width: '100%' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, margin: '40px 0' },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '28px', textAlign: 'center' },
  statNum: { fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg, #f97316, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statLabel: { color: '#64748b', fontSize: 14, marginTop: 6 },
  backBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontSize: 14, marginBottom: 24 },
  menuHeader: { position: 'relative', height: 240, borderRadius: 20, overflow: 'hidden', marginBottom: 32 },
  menuHeroImg: { width: '100%', height: '100%', objectFit: 'cover' },
  menuHeaderOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,15,30,0.95) 0%, transparent 50%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 24 },
  menuTitle: { color: '#f1f5f9', fontSize: 32, fontWeight: 900, margin: '0 0 4px' },
  menuSub: { color: '#f97316', fontSize: 14, fontWeight: 600, margin: '0 0 6px' },
  menuDesc: { color: '#94a3b8', fontSize: 14, margin: 0 },
  menuGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
  menuCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 16 },
  menuEmoji: { fontSize: 36, width: 48, textAlign: 'center' },
  menuInfo: { flex: 1 },
  menuItemName: { color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginBottom: 4 },
  menuItemDesc: { color: '#64748b', fontSize: 13, marginBottom: 4 },
  menuItemCategory: { color: '#8b5cf6', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  menuRight: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  menuPrice: { color: '#f97316', fontWeight: 800, fontSize: 18 },
  addBtn: { background: 'linear-gradient(135deg, #f97316, #ec4899)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: 10, cursor: 'pointer', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  floatingCart: { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f97316, #ec4899)', color: '#fff', padding: '16px 32px', borderRadius: 30, cursor: 'pointer', fontWeight: 800, fontSize: 16, boxShadow: '0 8px 32px rgba(249,115,22,0.4)', zIndex: 50, whiteSpace: 'nowrap' },
  loader: { textAlign: 'center', color: '#64748b', fontSize: 20, padding: 60 },
  cartPage: { maxWidth: 600, margin: '0 auto' },
  cartList: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 },
  cartItem: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 },
  removeBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  cartSummary: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 },
  cartTotal: { color: '#f1f5f9', fontSize: 24, fontWeight: 900, marginBottom: 8 },
  orderBtn: { background: 'linear-gradient(135deg, #f97316, #ec4899)', border: 'none', color: '#fff', padding: '16px 32px', borderRadius: 16, cursor: 'pointer', fontWeight: 800, fontSize: 18, width: '100%' },
  emptyState: { textAlign: 'center', padding: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  confirmPage: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 40 },
  confirmCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 40, maxWidth: 500, width: '100%', textAlign: 'center' },
  confirmEmoji: { fontSize: 72, marginBottom: 16 },
  confirmTitle: { color: '#f1f5f9', fontSize: 32, fontWeight: 900, margin: '0 0 8px' },
  confirmSub: { color: '#64748b', fontSize: 16, marginBottom: 32 },
  confirmDetails: { background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, marginBottom: 24, textAlign: 'left' },
  confirmRow: { display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 15, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  trackingBar: { display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '16px 20px', marginBottom: 24 },
  statusPill: { color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, marginTop: 4, display: 'inline-block' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: 16 },
  orderCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 },
  authPage: { display: 'flex', justifyContent: 'center', paddingTop: 40 },
  authCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 40, width: '100%', maxWidth: 420 },
  authTitle: { color: '#f1f5f9', fontSize: 28, fontWeight: 900, textAlign: 'center', margin: '12px 0 8px' },
  authSub: { color: '#64748b', textAlign: 'center', marginBottom: 28 },
  authForm: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: '#f1f5f9', fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box' },
}
