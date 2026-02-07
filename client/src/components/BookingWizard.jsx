'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, User, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BookingWizard() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        edad: '',
        genero: 'Femenino',
        obraSocial: 'PARTICULAR',
        motivoConsulta: ''
    });

    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Fetch slots when date changes
    useEffect(() => {
        if (selectedDate) {
            fetchSlots(selectedDate);
        }
    }, [selectedDate]);

    const fetchSlots = async (date) => {
        setLoading(true);
        setAvailableSlots([]);
        try {
            const res = await api.get(`/public/availability?date=${date}`);
            setAvailableSlots(res.data.slots);
        } catch (error) {
            console.error("Error fetching slots", error);
            const errorMsg = error.response?.data?.error || error.message;
            alert(`Error al cargar horarios: ${errorMsg}\nURL intentada: ${api.defaults.baseURL}/public/availability`);
        } finally {
            setLoading(false);
        }
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setStep(2);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/public/turns', {
                ...formData,
                fecha: selectedDate,
                horaInicio: selectedSlot
            });
            setBookingSuccess(true);
            setStep(3);
        } catch (error) {
            console.error(error);
            alert("Hubo un error al reservar el turno. Verifique los datos.");
        } finally {
            setLoading(false);
        }
    };

    // Helper: Next/Prev Day
    const shiftDate = (days) => {
        // Use a 12:00:00 time to avoid timezone jumps at midnight
        const current = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date();
        current.setDate(current.getDate() + days);
        setSelectedDate(format(current, 'yyyy-MM-dd'));
    };

    // Initialization
    useEffect(() => {
        // Set today as default
        setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    }, []);

    if (step === 3 && bookingSuccess) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12 px-4">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="w-24 h-24 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">¡Turno Confirmado!</h2>
                <p className="text-lg text-slate-600 mb-8">
                    Te esperamos el día <strong>{format(new Date(selectedDate + 'T00:00:00'), "d 'de' MMMM", { locale: es })}</strong> a las <strong>{selectedSlot}</strong> hs.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn-primary"
                >
                    Volver al inicio
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col md:flex-row">
            {/* Sidebar / Progress */}
            <div className="bg-sky-500 p-8 text-white md:w-1/3 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-6">Reservar Turno</h2>
                    <div className="space-y-6">
                        <div className={`flex items-center space-x-3 ${step === 1 ? 'opacity-100' : 'opacity-60'}`}>
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span>Seleccionar Horario</span>
                        </div>
                        <div className={`flex items-center space-x-3 ${step === 2 ? 'opacity-100' : 'opacity-60'}`}>
                            <div className="bg-white/20 p-2 rounded-lg">
                                <User className="w-6 h-6" />
                            </div>
                            <span>Mis Datos</span>
                        </div>
                        <div className={`flex items-center space-x-3 ${step === 3 ? 'opacity-100' : 'opacity-60'}`}>
                            <div className="bg-white/20 p-2 rounded-lg">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <span>Confirmación</span>
                        </div>
                    </div>
                </div>

                {selectedDate && selectedSlot && (
                    <div className="bg-white/10 p-4 rounded-xl mt-8">
                        <p className="text-sm opacity-80 mb-1">Tu selección:</p>
                        <p className="font-bold text-lg">{format(new Date(selectedDate + 'T00:00:00'), "EEEE d 'of' MMMM", { locale: es })}</p>
                        <p className="font-bold text-2xl">{selectedSlot} hs</p>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="p-8 md:w-2/3 overflow-y-auto">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-sky-500" />
                            Disponibilidad
                        </h3>

                        {/* Date Navigation */}
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl mb-6">
                            <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-slate-200 rounded-full transition">
                                <ChevronLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div className="text-center">
                                <p className="font-medium text-slate-900 capitalize">
                                    {selectedDate ? format(new Date(selectedDate + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es }) : 'Seleccione fecha'}
                                </p>
                                <input
                                    type="date"
                                    className="sr-only"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    id="date-picker-trigger"
                                />
                                <label htmlFor="date-picker-trigger" className="text-xs text-sky-600 font-medium cursor-pointer hover:underline">
                                    Cambiar fecha
                                </label>
                            </div>
                            <button onClick={() => shiftDate(1)} className="p-2 hover:bg-slate-200 rounded-full transition">
                                <ChevronRight className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {/* Slots */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                            </div>
                        ) : (
                            <div>
                                {availableSlots.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p>No hay turnos disponibles para esta fecha.</p>
                                        <p className="text-sm mt-2">Intenta buscar en otro día.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        {availableSlots.map((slot) => (
                                            <button
                                                key={slot}
                                                onClick={() => handleSlotSelect(slot)}
                                                className="py-3 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 transition font-medium text-center focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center mb-6">
                            <button onClick={() => setStep(1)} className="mr-4 text-slate-400 hover:text-slate-600 transition">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <h3 className="text-xl font-bold text-slate-800">Tus Datos</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                    <input required name="nombre" value={formData.nombre} onChange={handleInputChange} className="input-field" placeholder="Juan" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                                    <input required name="apellido" value={formData.apellido} onChange={handleInputChange} className="input-field" placeholder="Pérez" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                                    <input required name="dni" value={formData.dni} onChange={handleInputChange} className="input-field" placeholder="12345678" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                    <input required name="telefono" value={formData.telefono} onChange={handleInputChange} className="input-field" placeholder="11 1234 5678" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" placeholder="juan@ejemplo.com" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Edad</label>
                                    <input required type="number" name="edad" value={formData.edad} onChange={handleInputChange} className="input-field" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Obra Social</label>
                                    <select name="obraSocial" value={formData.obraSocial} onChange={handleInputChange} className="input-field bg-white">
                                        <option value="PARTICULAR">Particular</option>
                                        <option value="OSDE">OSDE</option>
                                        <option value="OMINT">OMINT</option>
                                        <option value="APROSS">APROSS</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de Consulta (Opcional)</label>
                                <textarea name="motivoConsulta" value={formData.motivoConsulta} onChange={handleInputChange} className="input-field" rows="2" placeholder="Dolor de muela, limpieza..."></textarea>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary disabled:opacity-70 flex justify-center items-center"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : 'Confirmar Turno'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
