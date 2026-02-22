import { Cloud, Sun, CloudRain, Wind, Droplets, CloudLightning, CloudSnow } from 'lucide-react';

export default function WeatherCard({ data }) {
    if (!data || !data.location || !data.condition) return null;

    const { location, temp_c, condition, humidity, wind_kph } = data;

    // Simple icon mapper
    const getIcon = (cond) => {
        const c = cond.toLowerCase();
        if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="w-12 h-12 text-blue-400" />;
        if (c.includes("storm") || c.includes("thunder")) return <CloudLightning className="w-12 h-12 text-purple-400" />;
        if (c.includes("snow")) return <CloudSnow className="w-12 h-12 text-white" />;
        if (c.includes("cloud")) return <Cloud className="w-12 h-12 text-gray-300" />;
        return <Sun className="w-12 h-12 text-yellow-400" />;
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white">{location}</h2>
                    <p className="text-white/60 capitalize">{condition}</p>
                </div>
                {getIcon(condition)}
            </div>

            <div className="flex items-baseline mb-6">
                <span className="text-5xl font-black text-white tracking-tighter">{Math.round(temp_c)}°</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                    <Droplets className="w-5 h-5 text-blue-300" />
                    <div>
                        <p className="text-xs text-white/40">Humidity</p>
                        <p className="text-sm font-medium text-white">{humidity}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                    <Wind className="w-5 h-5 text-teal-300" />
                    <div>
                        <p className="text-xs text-white/40">Wind</p>
                        <p className="text-sm font-medium text-white">{Math.round(wind_kph)} km/h</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
