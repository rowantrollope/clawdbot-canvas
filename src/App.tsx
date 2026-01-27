function App() {
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '16px 24px',
        borderRadius: '16px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🤖</span>
          <span style={{ fontWeight: 600, color: '#1d1d1f' }}>Jarvis Canvas</span>
        </div>
      </header>

      {/* Task Progress */}
      <section style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '12px', 
          fontWeight: 600, 
          color: '#86868b', 
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          In Progress
        </h2>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#007AFF',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ fontWeight: 500, color: '#1d1d1f' }}>Canvas UI</span>
            </div>
            <span style={{ fontSize: '14px', color: '#86868b' }}>35%</span>
          </div>
          <div style={{
            height: '8px',
            backgroundColor: '#f5f5f7',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '35%',
              height: '100%',
              backgroundColor: '#007AFF',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </section>

      {/* Todo List */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: '#86868b', 
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Tasks
          </h2>
          <span style={{ fontSize: '12px', color: '#86868b' }}>1 of 4</span>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          {[
            { text: 'Set up Shadcn/UI + Tailwind', done: true },
            { text: 'Build ProgressBar widget', done: false },
            { text: 'Add WebSocket for runtime updates', done: false },
            { text: 'Connect to Clawdbot Gateway', done: false },
          ].map((item, i, arr) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 20px',
              borderBottom: i < arr.length - 1 ? '1px solid #f5f5f7' : 'none'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: item.done ? 'none' : '2px solid #d2d2d7',
                backgroundColor: item.done ? '#34c759' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.done && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{
                color: item.done ? '#86868b' : '#1d1d1f',
                textDecoration: item.done ? 'line-through' : 'none'
              }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default App
