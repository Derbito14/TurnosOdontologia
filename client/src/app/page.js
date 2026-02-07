import BookingWizard from '../components/BookingWizard';
import { Smile } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-50 relative selection:bg-sky-200">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-sky-400 to-teal-400 rounded-b-[40px] md:rounded-b-[80px] z-0 shadow-lg"></div>

            <div className="relative z-10 container mx-auto px-4 py-12">
                {/* Header */}
                <header className="flex flex-col items-center mb-12 text-center text-white">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full mb-6 ring-4 ring-white/10 shadow-xl">
                        <Smile className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
                        Consultorio Odontológico
                    </h1>
                    <p className="text-lg md:text-xl text-sky-100 max-w-2xl font-medium">
                        Sonrisas sanas, vida saludable. Reserva tu turno online en simples pasos.
                    </p>
                </header>

                {/* Booking Wizard Integration */}
                <section className="mt-8 mb-20 fade-in">
                    <BookingWizard />
                </section>

                {/* Footer info */}
                <footer className="text-center text-slate-500 text-sm mt-12 pb-8">
                    <p>© {new Date().getFullYear()} Consultorio Odontológico Dr/a. Ejemplo</p>
                    <p className="mt-2">Av. Siempre Viva 742, Córdoba • Tel: (351) 123-4567</p>
                </footer>
            </div>
        </main>
    );
}
