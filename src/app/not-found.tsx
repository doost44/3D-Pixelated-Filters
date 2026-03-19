export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#000',
        color: '#00ff88',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ fontSize: '4rem' }}>404</div>
      <div style={{ fontSize: '1rem', marginTop: '1rem', opacity: 0.6 }}>
        PAGE NOT FOUND
      </div>
    </div>
  );
}
