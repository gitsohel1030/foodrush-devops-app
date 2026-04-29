export const metadata = {
  title: 'FoodRush 🍔 - Food that hits different',
  description: 'The freshest food delivery app. Order up bestie.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
