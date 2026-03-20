import { useState } from 'react';
import styles from './OnlineModal.module.css';

export default function OnlineModal({ t, onClose, onCreate, onJoin }) {
  const [view, setView] = useState('menu'); // menu | create | join | waiting
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const code = await onCreate(name.trim());
    setRoomCode(code);
    setView('waiting');
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!name.trim() || !code.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onJoin(code.trim().toUpperCase(), name.trim());
      onClose();
    } catch (e) {
      setError('Room not found or full');
    }
    setLoading(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <div className={styles.ornament}>— ✦ —</div>
        <h2 className={styles.title}>Online Game</h2>

        {view === 'menu' && (
          <div className={styles.menu}>
            <button className={styles.menuBtn} onClick={() => setView('create')}>
              Create Room
            </button>
            <button className={styles.menuBtn} onClick={() => setView('join')}>
              Join Room
            </button>
          </div>
        )}

        {view === 'create' && (
          <div className={styles.form}>
            <input
              className={styles.input}
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <button className={styles.btn} onClick={handleCreate} disabled={loading}>
              {loading ? '...' : 'Create Room'}
            </button>
            <button className={styles.back} onClick={() => setView('menu')}>← Back</button>
          </div>
        )}

        {view === 'join' && (
          <div className={styles.form}>
            <input
              className={styles.input}
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
            <input
              className={styles.input}
              placeholder="Room code (e.g. ABC123)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={6}
            />
            {error && <div className={styles.error}>{error}</div>}
            <button className={styles.btn} onClick={handleJoin} disabled={loading}>
              {loading ? '...' : 'Join Room'}
            </button>
            <button className={styles.back} onClick={() => setView('menu')}>← Back</button>
          </div>
        )}

        {view === 'waiting' && (
          <div className={styles.waiting}>
            <div className={styles.waitingText}>Share this code with your opponent:</div>
            <div className={styles.roomCode}>{roomCode}</div>
            <div className={styles.waitingDots}>Waiting for opponent<span className={styles.dots}>...</span></div>
            <button className={styles.back} onClick={() => { onClose(); }}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}