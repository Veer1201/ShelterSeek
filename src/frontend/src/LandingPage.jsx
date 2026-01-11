function LandingPage({ onLogin }) {
    const styles = {
      container: {
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)', // Professional Blue/Grey Gradient
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      },
      title: {
        fontSize: '4.5rem',
        fontWeight: '800',
        marginBottom: '10px',
        letterSpacing: '-2px',
        textShadow: '0 4px 6px rgba(0,0,0,0.3)'
      },
      tagline: {
        fontSize: '1.5rem',
        color: '#cbd5e0',
        maxWidth: '700px',
        lineHeight: '1.6',
        marginBottom: '40px'
      },
      demoBox: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '30px 50px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.2)',
        marginBottom: '50px'
      },
      instruction: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#48bb78', // Green highlight
        marginBottom: '10px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      },
      phoneNumber: {
        fontSize: '3rem',
        fontWeight: '900',
        fontFamily: 'monospace',
        background: 'white',
        color: '#1a365d',
        padding: '10px 30px',
        borderRadius: '10px',
        display: 'inline-block'
      },
      loginButton: {
        background: 'transparent',
        border: '2px solid rgba(255,255,255,0.5)',
        color: 'white',
        padding: '15px 40px',
        fontSize: '1rem',
        borderRadius: '50px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontWeight: 'bold'
      }
    };
  
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>ShelterSeek</h1>
        <p style={styles.tagline}>
          Connecting the 500+ homeless individuals in Surrey to empty beds in real-time.
          <br />
          <strong>No data plan required. No smartphone needed.</strong>
        </p>
  
        <div style={styles.demoBox}>
          <p style={styles.instruction}>Try the Live Demo</p>
          <p>Text <strong>your need</strong> to:</p>
          <div style={styles.phoneNumber}>+1 (878) 879-5504</div> 
          {/* ^ UPDATE THIS WITH YOUR TWILIO NUMBER */}
        </div>
  
        <button 
          style={styles.loginButton} 
          onClick={onLogin}
          onMouseOver={(e) => {e.target.style.background = 'white'; e.target.style.color = '#1a365d'}}
          onMouseOut={(e) => {e.target.style.background = 'transparent'; e.target.style.color = 'white'}}
        >
          Admin Portal Login &rarr;
        </button>
      </div>
    );
  }
  
  export default LandingPage;