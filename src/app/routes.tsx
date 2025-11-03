// src/app/routes.tsx
import { createHashRouter, redirect } from "react-router-dom";
import { CityProvider } from "./CityProvider";
import App from "./App";

function CityAppWrapper() {
    return (
        <CityProvider>
            <App />
        </CityProvider>
    );
}

const routes = [
    {
        path: "/:cityKey",
        element: <CityAppWrapper />,
        errorElement: (
            <div
                style={{
                    color: "white",
                    backgroundColor: "black",
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    textAlign: "center",
                    padding: "2rem",
                }}
            >
                Fehler beim Routen. Bitte eine gültige Stadt-URL aufrufen.
            </div>
        ),
    },
    {
        path: "/",
        loader: () => redirect("/hannover"),
    },
    {
        path: "*",
        element: (
            <div
                style={{
                    color: "white",
                    backgroundColor: "black",
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    flexDirection: "column",
                    textAlign: "center",
                }}
            >
                <div>Bitte Stadt-URL aufrufen, z.&nbsp;B.</div>
                <div className="font-mono mt-4 text-green-400">/hannover</div>
                <div className="font-mono text-green-400">/braunschweig</div>
            </div>
        ),
    },
];

// Fester HashRouter für QtWebEngine/Anthias
export const router = createHashRouter(routes);
