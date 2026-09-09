export const iso = (date) => { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const addDays = (date, n) => { const d = new Date(date+'T12:00:00'); d.setDate(d.getDate()+n); return iso(d); };
export const nightsBetween = (start, end) => Math.round((Date.parse(end+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000);
export const overlaps = (a,b,c,d) => a < d && b > c;
export const isAvailable = (roomId,start,end,bookings,excludeId) => !!start && !!end && start < end && !bookings.some(b => b.id !== excludeId && b.roomId === roomId && b.status !== 'Otkazana' && overlaps(start,end,b.start,b.end));
export const isOccupied = (roomId,day,bookings) => bookings.some(b => b.roomId === roomId && b.status !== 'Otkazana' && b.start <= day && day < b.end);
