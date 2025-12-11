import { Activity, Mic, Loader2 } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'ready' | 'recording' | 'processing';
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'recording':
        return { 
          color: 'bg-red-500 shadow-red-500/50', 
          icon: <Mic className="w-12 h-12 animate-pulse" /> 
        };
      case 'processing':
        return { 
          color: 'bg-yellow-400 shadow-yellow-400/50', 
          icon: <Loader2 className="w-12 h-12 animate-spin" /> 
        };
      default:
        return { 
          color: 'bg-emerald-500 shadow-emerald-500/50', 
          icon: <Activity className="w-12 h-12" /> 
        };
    }
  };

  const info = getStatusInfo();

  return (
    <div className={`
      flex items-center justify-center w-24 h-24 rounded-full 
      text-white shadow-xl transition-all duration-500 transform
      ${info.color}
      ${status === 'recording' ? 'scale-110' : 'scale-100'}
    `}>
      {info.icon}
    </div>
  );
}

