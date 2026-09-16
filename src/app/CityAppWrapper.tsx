// src/app/CityAppWrapper.tsx
import { CityProvider } from "./CityProvider";
import { WeatherProvider } from "../features/weather/WeatherProvider";
import App from "./App";

/**
 * Provider-Stapel einer Stadt-Route. Eigene Datei, damit routes.tsx nur noch
 * den Router exportiert (React Fast Refresh verträgt keine gemischten Exporte).
 */
export function CityAppWrapper() {
    return (
        <CityProvider>
            <WeatherProvider>
                <App />
            </WeatherProvider>
        </CityProvider>
    );
}
