function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Jarvis Canvas
        </h1>
        <p style={{ opacity: 0.6, fontSize: '1.1rem', marginBottom: '2rem' }}>
          Your AI's visual workspace
        </p>
        <div style={{ 
          padding: '1rem 2rem', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ opacity: 0.8 }}>✨ Live editing enabled</p>
        </div>
      </div>
    </div>
  )
}

export default App
