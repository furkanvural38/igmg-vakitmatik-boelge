// src/app/routes.tsx
import { createBrowserRouter, createHashRouter, redirect } from "react-router-dom";
import { CityProvider } from "./CityProvider";
import App from "./App";

function CityAppWrapper() {
    return (
        <CityProvider>
            <App />
        </CityProvider>
    );
}

// ---- Router-Factory: BrowserRouter (default) + optional Hash-Fallback ----
const useHash = import.meta.env.VITE_LEGACY_ROUTER === "hash";
const basename = import.meta.env.BASE_URL; // dev: "/", pages: "/igmg-vakitmatik-website/"

const routes = [
    {
        path: "/:cityKey",
        element: <CityAppWrapper />,
        errorElement: (
            <div style={{
                color: "white", backgroundColor: "black", height: "100vh",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", textAlign: "center", padding: "2rem"
            }}>
                Fehler beim Routen. Bitte eine gültige Stadt-URL aufrufen.
            </div>
        ),
    },
    {
        path: "/",
        loader: () => redirect("/hannover"), // Default direkt auf Hannover (oder entfernen)
    },
    // optional: Catch-all → Hinweis
    {
        path: "*",
        element: (
            <div style={{
                color: "white", backgroundColor: "black", height: "100vh",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", flexDirection: "column", textAlign: "center"
            }}>
                <div>Bitte Stadt-URL aufrufen, z.&nbsp;B.</div>
                <div className="font-mono mt-4 text-green-400">/hannover</div>
                <div className="font-mono text-green-400">/braunschweig</div>
            </div>
        ),
    },
];

export const router = (useHash
        ? createHashRouter(routes)
        : createBrowserRouter(routes, { basename })
);
