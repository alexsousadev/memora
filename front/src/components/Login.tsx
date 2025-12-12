import { useState } from 'react';
import { client } from '@passwordless-id/webauthn';
import { useEffect } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const API_URL = import.meta.env.API_URL 
  ? '/api/auth' 
  : 'http://localhost:3000/api/auth';

export function Login({ onLoginSuccess }: LoginProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);

  useEffect(() => {
    const audio = new Audio('/entrar.wav');
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const handleLogin = async () => {
    setStatus('loading');
    setMessage('Identificando...');

    try {
        const loginOptionsResp = await fetch(`${API_URL}/login/options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ }), 
        });

        if (!loginOptionsResp.ok) throw new Error('Erro ao iniciar login');

        const { challenge } = await loginOptionsResp.json();
        
        let authentication;
        try {
            authentication = await client.authenticate({
                challenge,
                userVerification: 'required'
            });
        } catch (e) {
            console.error(e);
            setStatus('idle');
            setMessage('');
            return;
        }

        const verifyResp = await fetch(`${API_URL}/login/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authentication), 
        });

        const verifyJson = await verifyResp.json();

        if (verifyJson.verified) {
            setStatus('success');
            setTimeout(onLoginSuccess, 1000);
        } else {
            setStatus('error');
            setMessage('Não reconhecido.');
        }

    } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage('Erro ao entrar.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setStatus('loading');
    setMessage('Configurando...');

    try {
        const regOptionsResp = await fetch(`${API_URL}/register/options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });

        if (!regOptionsResp.ok) throw new Error('Erro ao iniciar registro');

        const { challenge, user } = await regOptionsResp.json();

        let registration;
        try {
            registration = await client.register({
                challenge,
                user,
                userVerification: 'required',
                discoverable: 'preferred'
            });
        } catch(e) {
            console.error(e);
            setStatus('idle');
            return;
        }

        const verifyResp = await fetch(`${API_URL}/register/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, ...registration }),
        });

        const verifyJson = await verifyResp.json();

        if (verifyJson.verified) {
            setStatus('success');
            setMessage('Configurado!');
            setTimeout(() => {
                setStatus('idle');
                setIsSetupMode(false);
                setUsername('');
                setMessage('');
            }, 1500);
        } else {
            setStatus('error');
            setMessage('Falha ao registrar.');
        }

    } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage('Erro no registro.');
    }
  };

  if (isSetupMode) {
      return (
        <div className="login-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f3f4f6',
            padding: '20px'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#374151' }}>Configuração Inicial</h2>
            <form onSubmit={handleRegister} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                width: '100%',
                maxWidth: '400px'
            }}>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nome do Usuário (ex: Maria)"
                    disabled={status === 'loading'}
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '1.2rem',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                    }}
                />
      
                <button
                    type="submit"
                    disabled={status === 'loading' || !username.trim()}
                    style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        fontSize: '1.2rem',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {status === 'loading' ? 'Registrando...' : 'Criar Acesso'}
                </button>
                
                <button 
                    type="button"
                    onClick={() => setIsSetupMode(false)}
                    style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    Voltar
                </button>
            </form>
            {message && <p style={{ marginTop: '20px', color: status === 'error' ? '#ef4444' : '#059669' }}>{message}</p>}
          </div>
      );
  }

  return (
    <div className="login-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f3f4f6',
      position: 'relative'
    }}>
      
      <button 
        onClick={() => setIsSetupMode(true)}
        style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '0.9rem'
        }}
        aria-label="Configurar"
      >
        <i className="bi bi-gear-fill"></i> Setup
      </button>

      <button
        onClick={handleLogin}
        disabled={status === 'loading'}
        style={{
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: status === 'error' ? '#ef4444' : status === 'success' ? '#22c55e' : '#3b82f6',
          color: 'white',
          fontSize: '6rem',
          cursor: 'pointer',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="Entrar"
      >
        {status === 'loading' ? (
           <i className="bi bi-hourglass-split animate-spin"></i>
        ) : status === 'success' ? (
            <i className="bi bi-check-lg"></i>
        ) : status === 'error' ? (
            <i className="bi bi-x-lg"></i>
        ) : (
            <i className="bi bi-fingerprint"></i>
        )}
      </button>
      
      <p style={{ marginTop: '30px', fontSize: '1.5rem', color: '#4b5563', fontWeight: 500 }}>
          {message || (status === 'idle' ? 'Tocar para Entrar' : '')}
      </p>
    </div>
  );
}
