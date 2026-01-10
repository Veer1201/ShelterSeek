import { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

function AdminDashboard() {
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "shelters"), (snapshot) => {
      const shelterList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShelters(shelterList.sort((a, b) => a.name.localeCompare(b.name)));
    });
    return unsubscribe;
  }, []);

  const updateBeds = async (id, currentBeds, change) => {
    const newCount = currentBeds + change;
    if (newCount < 0) return; 

    const shelterRef = doc(db, "shelters", id);
    await updateDoc(shelterRef, {
      beds: newCount,
      status: newCount === 0 ? "FULL" : "OPEN"
    });
  };

  // --- STYLES ---
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '40px 20px',
      color: '#333'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
    },
    title: {
      fontSize: '2.5rem',
      color: '#1a365d',
      fontWeight: '800',
      margin: '0',
      letterSpacing: '-1px'
    },
    subtitle: {
      color: '#718096',
      fontSize: '1.1rem',
      marginTop: '10px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '25px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '25px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      border: '1px solid #e2e8f0'
    },
    cardHeader: {
      marginBottom: '20px',
      borderBottom: '1px solid #edf2f7',
      paddingBottom: '15px'
    },
    shelterName: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#2d3748',
      margin: 0
    },
    statusBadge: (isOpen) => ({
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginTop: '8px',
      backgroundColor: isOpen ? '#def7ec' : '#fde8e8',
      color: isOpen ? '#03543f' : '#9b1c1c'
    }),
    bedCountSection: {
      textAlign: 'center',
      margin: '20px 0'
    },
    bigNumber: {
      fontSize: '3.5rem',
      fontWeight: '800',
      color: '#2d3748',
      lineHeight: '1'
    },
    label: {
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontSize: '0.75rem',
      color: '#718096',
      fontWeight: '600',
      marginTop: '5px'
    },
    buttonGroup: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginTop: 'auto'
    },
    btn: (type) => ({
      padding: '12px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
      backgroundColor: type === 'in' ? '#e53e3e' : '#38a169',
      color: 'white',
      fontSize: '0.9rem'
    })
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🏥 ShelterSeek Control</h1>
        <p style={styles.subtitle}>Real-time Capacity Management System</p>
      </header>

      <div style={styles.grid}>
        {shelters.map(shelter => {
          const isOpen = shelter.beds > 0;
          
          return (
            <div key={shelter.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.shelterName}>{shelter.name}</h2>
                <span style={styles.statusBadge(isOpen)}>
                  {isOpen ? '● ACCEPTING' : '● FULL'}
                </span>
              </div>

              <div style={styles.bedCountSection}>
                <div style={styles.bigNumber}>{shelter.beds}</div>
                <div style={styles.label}>Available Beds</div>
              </div>

              <div style={styles.buttonGroup}>
                <button 
                  style={styles.btn('in')}
                  onClick={() => updateBeds(shelter.id, shelter.beds, -1)}
                >
                  Check In (-1)
                </button>
                <button 
                  style={styles.btn('out')}
                  onClick={() => updateBeds(shelter.id, shelter.beds, 1)}
                >
                  Release (+1)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminDashboard;