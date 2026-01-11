import { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

function AdminDashboard() {
  const [shelters, setShelters] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState({}); 

  useEffect(() => {
    const unsubShelters = onSnapshot(collection(db, "shelters"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShelters(list.sort((a, b) => a.name.localeCompare(b.name)));
    });
    const unsubWaitlist = onSnapshot(collection(db, "waitlist"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWaitlist(list.sort((a, b) => a.timestamp - b.timestamp)); 
    });
    return () => { unsubShelters(); unsubWaitlist(); };
  }, []);

  const handleRelease = async (shelter) => {
    const shelterRef = doc(db, "shelters", shelter.id);
    await updateDoc(shelterRef, {
      beds: shelter.beds + 1,
      status: "OPEN"
    });

    if (waitlist.length > 0) {
      try {
        await fetch('http://localhost:3000/api/notify-waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shelterName: shelter.name })
        });
        alert(`Bed released! First person on waitlist has been notified via SMS.`);
      } catch (err) {
        console.error("SMS Failed", err);
      }
    }
  };

  const updateBeds = async (id, currentBeds, change) => {

    if (currentBeds + change < 0) return;
    const shelterRef = doc(db, "shelters", id);
    await updateDoc(shelterRef, {
      beds: currentBeds + change,
      status: (currentBeds + change) === 0 ? "FULL" : "OPEN"
    });
  };

  const assignAndRemove = async (waitlistId, shelterId, currentBeds) => {
    if (!shelterId) return alert("Select a shelter!");
    const shelterRef = doc(db, "shelters", shelterId);
    await updateDoc(shelterRef, { beds: currentBeds - 1, status: (currentBeds - 1) === 0 ? "FULL" : "OPEN" });
    await deleteDoc(doc(db, "waitlist", waitlistId));
  };

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 20px', fontFamily: 'sans-serif' },
    title: { fontSize: '2.5rem', color: '#1a365d', fontWeight: '800', textAlign: 'center', marginBottom:'40px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto' },
    card: { backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    shelterName: { fontSize: '1.25rem', fontWeight: '700', color: '#2d3748', marginBottom: '10px' },
    bigNumber: { fontSize: '3.5rem', fontWeight: '800', color: '#2d3748', textAlign: 'center' },
    btnGroup: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' },
    btn: (bg) => ({ padding: '10px', border: 'none', borderRadius: '8px', background: bg, color: 'white', cursor: 'pointer', fontWeight: 'bold' }),
    waitlistContainer: { maxWidth: '800px', margin: '60px auto 0', background: 'white', padding: '30px', borderRadius: '16px' },
    wItem: { display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #eee', alignItems: 'center' },
    select: { padding: '8px', marginRight: '10px', border:'1px solid #ccc' },
    assignBtn: { background: '#2b6cb0', color: 'white', border:'none', padding:'8px 15px', cursor:'pointer', borderRadius:'4px' }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏥 ShelterSeek Control</h1>
      <div style={styles.grid}>
        {shelters.map(s => (
          <div key={s.id} style={styles.card}>
            <h2 style={styles.shelterName}>{s.name}</h2>
            <div style={{textAlign:'center', color: s.beds > 0 ? 'green' : 'red', fontWeight:'bold'}}>
              {s.beds > 0 ? '● OPEN' : '● FULL'}
            </div>
            <div style={styles.bigNumber}>{s.beds}</div>
            <div style={styles.btnGroup}>
              {/* Check In (-1) */}
              <button style={styles.btn('#e53e3e')} onClick={() => updateBeds(s.id, s.beds, -1)}>- Check In</button>
              
              {/* Release (+1) with Notification Logic */}
              <button style={styles.btn('#38a169')} onClick={() => handleRelease(s)}>+ Release</button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.waitlistContainer}>
        <h2 style={{color: '#c53030'}}>⏳ Priority Waitlist ({waitlist.length})</h2>
        {waitlist.length === 0 && <p>No one is waiting.</p>}
        
        {waitlist.map((user, index) => (
          <div key={user.id} style={styles.wItem}>
            <div><strong>Position #{index+1}</strong><br/>{user.phone}</div>
            <div>
              <select style={styles.select} onChange={(e) => {
                  const s = shelters.find(sh => sh.id === e.target.value);
                  setSelectedShelter({ ...selectedShelter, [user.id]: s });
              }}>
                <option value="">Assign Shelter...</option>
                {shelters.filter(s => s.beds > 0).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button style={styles.assignBtn} onClick={() => {
                   const s = selectedShelter[user.id];
                   if(s) assignAndRemove(user.id, s.id, s.beds);
              }}>Assign</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;