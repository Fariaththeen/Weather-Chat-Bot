import { Cloud, Sun, CloudRain, Wind, Droplets, CloudLightning, CloudSnow, Calendar } from 'lucide-react';

export default function ForecastCard({ data }) {
    if (!data || !data.forecast) return null;

    const { location, forecast } = data;
    // Take next 8 items (approx 24 hours) for display
    const items = forecast.slice(0, 8);

    const getIcon = (cond) => {
        const c = cond.toLowerCase();
        if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="w-8 h-8 text-blue-400" />;
        if (c.includes("storm") || c.includes("thunder")) return <CloudLightning className="w-8 h-8 text-purple-400" />;
        if (c.includes("snow")) return <CloudSnow className="w-8 h-8 text-white" />;
        if (c.includes("cloud")) return <Cloud className="w-8 h-8 text-gray-300" />;
        return <Sun className="w-8 h-8 text-yellow-400" />;
    };

    const formatTime = (dt_txt) => {
        const date = new Date(dt_txt);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4 w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-teal-300" />
                <h3 className="text-lg font-bold text-white">Forecast for {location}</h3>
            </div>

            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
                {items.map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 flex flex-col items-center bg-white/5 rounded-xl p-4 min-w-[100px] border border-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-xs text-white/50 mb-2">{formatTime(item.dt_txt)}</span>
                        {getIcon(item.condition)}
                        <span className="text-xl font-bold text-white mt-2">{Math.round(item.temp_c)}°</span>

                        {item.rain_prob > 0 && (
                            <div className="flex items-center gap-1 mt-2 text-blue-300" title="Rain Probability">
                                <Droplets className="w-3 h-3" />
                                <span className="text-xs">{Math.round(item.rain_prob * 100)}%</span>
                            </div>
                        )}
                        <p className="text-xs text-white/40 mt-1 text-center truncate w-full">{item.condition}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
