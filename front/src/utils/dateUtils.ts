export function normalizeTimePt(input: string): string {
    if (!input) return input;
    let text = String(input).toLowerCase().trim();
    
    const timeMatch = text.match(/(\d{1,2})\s*(?:horas?|h)\s*(?:e\s*(\d{1,2})\s*(?:minutos?|min))?/);
    if (timeMatch) {
        let hour = parseInt(timeMatch[1], 10);
        let minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        
        hour = Math.max(0, Math.min(23, hour));
        minute = Math.max(0, Math.min(59, minute));
        
        const hh = String(hour).padStart(2, '0');
        const mm = String(minute).padStart(2, '0');
        return `${hh}:${mm}`;
    }
    
    text = text
        .replace(/\s+/g, ' ')
        .replace(/da\s*manhã|da\s*manha/gi, 'manha')
        .replace(/da\s*noite/gi, 'noite')
        .replace(/da\s*tarde/gi, 'tarde')
        .trim();

    const match = text.match(/(\d{1,2})(?:[:h](\d{1,2}))?/);
    if (!match) return input;
    let hour = parseInt(match[1], 10);
    let minute = match[2] ? parseInt(match[2], 10) : 0;

    const hasManha = /manha/.test(text);
    const hasTarde = /tarde/.test(text);
    const hasNoite = /noite/.test(text);

    if (hasManha) {
        if (hour === 12) hour = 0;
        if (hour > 23) hour = hour % 24;
    } else if (hasTarde || hasNoite) {
        if (hour >= 1 && hour <= 11) hour += 12;
        if (hour > 23) hour = hour % 24;
    } else {
        if (hour > 23) hour = hour % 24;
    }

    const hh = String(Math.max(0, Math.min(23, hour))).padStart(2, '0');
    const mm = String(Math.max(0, Math.min(59, minute))).padStart(2, '0');
    return `${hh}:${mm}`;
}

export function normalizeDatePt(input: string): string | null {
    if (!input) return null;
    const text = String(input).toLowerCase().trim();
    const now = new Date();
    
    const monthMap: { [key: string]: number } = {
        'janeiro': 1, 'fevereiro': 2, 'março': 3, 'marco': 3, 'abril': 4, 'maio': 5, 'junho': 6,
        'julho': 7, 'agosto': 8, 'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
    };
    
    // Normalizar texto (remover acentos e caracteres especiais)
    const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Padrão melhorado: captura "4 de dezembro", "dia 4 de dezembro", "4 dezembro", etc.
    let dayMatch = normalizedText.match(/(?:dia\s*)?(\d{1,2})\s*de\s*(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/);
    
    if (!dayMatch) {
        dayMatch = normalizedText.match(/(?:dia\s*)?(\d{1,2})\s+(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/);
    }
    
    if (!dayMatch) {
        dayMatch = text.match(/(?:dia\s*)?(\d{1,2})\s*de\s*(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/);
    }
    
    if (!dayMatch) {
        dayMatch = text.match(/(?:dia\s*)?(\d{1,2})\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/);
    }
    
    if (dayMatch) {
        const day = parseInt(dayMatch[1], 10);
        const monthNameOriginal = dayMatch[2].toLowerCase();
        const monthName = monthNameOriginal.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const monthValue = monthMap[monthName] || monthMap[monthNameOriginal];
        
        if (monthValue === undefined || monthValue < 1 || monthValue > 12) {
            console.warn('Mês não reconhecido:', monthNameOriginal, monthName);
            return null;
        }
        
        const monthIndex = monthValue - 1;
        
        let year = now.getFullYear();
        let date = new Date(year, monthIndex, day);
        
        if (date < now && (monthIndex <= now.getMonth())) {
            date = new Date(year + 1, monthIndex, day);
            year = year + 1;
        }
        
        if (date.getDate() !== day || date.getMonth() !== monthIndex) {
            console.warn('Data inválida:', day, monthName);
            return null;
        }
        
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    
    if (text.includes('hoje')) {
        const d = new Date(now);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    
    if (text.includes('amanhã') || text.includes('amanha')) {
        const d = new Date(now);
        d.setDate(d.getDate() + 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    
    return null;
}

export function formatDateForSpeech(dateString?: string): string {
    if (!dateString || !dateString.match(/\d{4}-\d{2}-\d{2}/)) {
        return dateString || '';
    }
    
    const [, month, day] = dateString.split('-');
    const monthNames = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex] || month;
    const dayNum = parseInt(day, 10);
    
    return `dia ${dayNum} de ${monthName}`;
}

export function formatDateForDisplay(dateString?: string): string {
    if (!dateString || !dateString.match(/\d{4}-\d{2}-\d{2}/)) {
        return dateString || '';
    }
    
    const [, month, day] = dateString.split('-');
    const monthNames = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex] || month;
    const dayNum = parseInt(day, 10);
    
    return `${dayNum} de ${monthName}`;
}

export function translateWeekdaysToPt(daysString: string): string {
    if (!daysString) return '';
    
    const dayMap: { [key: string]: string } = {
        'monday': 'segunda-feira',
        'tuesday': 'terça-feira',
        'wednesday': 'quarta-feira',
        'thursday': 'quinta-feira',
        'friday': 'sexta-feira',
        'saturday': 'sábado',
        'sunday': 'domingo'
    };
    
    return daysString
        .split(',')
        .map(day => day.trim().toLowerCase())
        .map(day => dayMap[day] || day)
        .join(', ');
}

/**
 * Calcula a urgência do lembrete baseado na proximidade da data/hora
 * Retorna um valor de 0 a 1, onde 1 é muito urgente (muito próximo)
 */
export function calculateReminderUrgency(date: string, time: string): number {
    if (!date || !time) return 0;
    
    try {
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        
        const reminderDate = new Date(year, month - 1, day, hour, minute);
        const now = new Date();
        
        // Se o lembrete já passou, retorna 1 (máxima urgência)
        if (reminderDate < now) {
            return 1;
        }
        
        // Calcular diferença em horas
        const diffMs = reminderDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        // Se está a mais de 7 dias, urgência 0
        if (diffHours > 168) {
            return 0;
        }
        
        // Se está a menos de 1 hora, urgência máxima (1)
        if (diffHours < 1) {
            return 1;
        }
        
        // Interpolação linear: quanto mais perto, mais urgente
        // 1 hora = 1.0, 7 dias (168 horas) = 0.0
        const urgency = 1 - (diffHours / 168);
        return Math.max(0, Math.min(1, urgency));
    } catch (error) {
        console.error('Erro ao calcular urgência:', error);
        return 0;
    }
}

/**
 * Retorna uma cor baseada na urgência do lembrete
 * Branco (sem urgência) -> Rosa suave -> Vermelho suave (alta urgência)
 */
export function getUrgencyColor(urgency: number): string {
    if (urgency === 0) {
        return '#ffffff'; // Branco (sem urgência)
    }
    
    // Usar tons de rosa/vermelho suave
    // Base: rgb(255, 245, 245) (rosa muito claro) até rgb(255, 200, 200) (rosa/vermelho suave)
    const baseR = 255;
    const baseG = 245;
    const baseB = 245;
    
    const r = baseR;
    const g = Math.round(baseG - (baseG - 200) * urgency);
    const b = Math.round(baseB - (baseB - 200) * urgency);
    
    return `rgb(${r}, ${g}, ${b})`;
}

