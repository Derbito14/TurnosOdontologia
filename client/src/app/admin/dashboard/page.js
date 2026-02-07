'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/authContext';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar as CalendarIcon, List } from 'lucide-react';

export default function AdminDashboard() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState([]);

    // Protect route
    useEffect(() => {
        if (!loading && !user) router.push('/admin/login');
    }, [user, loading, router]);

    useEffect(() => {
        if (user) fetchTurns();
    }, [user]);

    const fetchTurns = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/admin/turns', {
                headers: { 'x-auth-token': token }
            });

            const calendarEvents = res.data.map(t => ({
                id: t._id,
                title: `${t.pacienteNombre} (${t.estado})`,
                start: `${t.fecha.split('T')[0]}T${t.horaInicio}:00`,
                end: `${t.fecha.split('T')[0]}T${t.horaFin}:00`,
                color: getStatusColor(t.estado),
                extendedProps: { ...t }
            }));

            setEvents(calendarEvents);
        } catch (err) {
            console.error("Failed to load turns", err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmado': return '#10B981'; // Green
            case 'pendiente': return '#F59E0B'; // Orange / Yellow
            case 'cancelado': return '#EF4444'; // Red
            default: return '#3B82F6'; // Blue
        }
    };

    const handleEventClick = async (info) => {
        const turn = info.event.extendedProps;
        if (confirm(`Gestionar turno de ${turn.pacienteNombre}?\n\nEstado actual: ${turn.estado}`)) {
            const newStatus = prompt("Ingrese nuevo estado (confirmado, cancelado):", "confirmado");
            if (newStatus && ['confirmado', 'cancelado'].includes(newStatus)) {
                try {
                    const token = localStorage.getItem('token');
                    await api.put(`/admin/turns/${turn._id}`, { estado: newStatus }, {
                        headers: { 'x-auth-token': token }
                    });
                    fetchTurns(); // Refresh
                } catch (err) {
                    alert("Error al actualizar");
                }
            }
        }
    };

    if (loading || !user) return <div className="p-10 flex justify-center"><div className="animate-spin h-8 w-8 border-b-2 border-sky-500 rounded-full"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Simple */}
            <aside className="w-64 bg-white shadow-xl z-10 hidden md:block">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="text-sky-500" />
                        Agenda
                    </h2>
                </div>
                <nav className="px-4 space-y-2">
                    <button className="w-full text-left px-4 py-2 bg-sky-50 text-sky-700 rounded-lg font-medium">
                        Calendario
                    </button>
                    {/* Placeholder for future links */}
                    <button className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
                        Pacientes
                    </button>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t">
                    <button onClick={logout} className="flex items-center gap-2 text-red-500 hover:text-red-700 transition">
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        locale={esLocale}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        slotMinTime="08:00:00"
                        slotMaxTime="20:00:00"
                        allDaySlot={false}
                        events={events}
                        eventClick={handleEventClick}
                        height="auto"
                    />
                </div>
            </main>
        </div>
    );
}
