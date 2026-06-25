import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LuUser, LuLogOut, LuShoppingBag, LuSparkles } from "react-icons/lu";

function NavbarCliente() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [profileHover, setProfileHover] = useState(false);
    const [logoutHover, setLogoutHover] = useState(false);

    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : { username: "Cliente" };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        if (window.confirm("¿Deseas cerrar la sesión de SmartLogix?")) {
            const savedCards = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("paymentMethod_")) {
                    savedCards[key] = localStorage.getItem(key);
                }
            }
            localStorage.clear();
            Object.entries(savedCards).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
            navigate("/");
        }
    };

    return (
        <>
            <style>{`
                @keyframes gradientShift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(99, 179, 237, 0); }
                    50%      { box-shadow: 0 0 12px 3px rgba(99, 179, 237, 0.25); }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .navbar-cliente-btn-profile {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    background: linear-gradient(135deg, #2b6cb0, #3182ce);
                    color: #ffffff;
                    border: none;
                    padding: 9px 18px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                    box-shadow: 0 2px 8px rgba(49, 130, 206, 0.35);
                }
                .navbar-cliente-btn-profile:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 18px rgba(49, 130, 206, 0.55);
                    background: linear-gradient(135deg, #3182ce, #4299e1);
                }
                .navbar-cliente-btn-logout {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    background: transparent;
                    color: #a0aec0;
                    border: 1px solid #2d3748;
                    padding: 9px 18px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
                }
                .navbar-cliente-btn-logout:hover {
                    transform: translateY(-2px);
                    border-color: #fc8181;
                    color: #fc8181;
                    box-shadow: 0 4px 14px rgba(252, 129, 129, 0.2);
                }
                .navbar-cliente-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #4299e1, #9f7aea);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 800;
                    color: #ffffff;
                    flex-shrink: 0;
                    animation: pulse-glow 3s ease-in-out infinite;
                }
                .navbar-cliente-logo-text {
                    background: linear-gradient(90deg, #63b3ed, #9f7aea, #63b3ed);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 3s linear infinite;
                }
                .navbar-cliente-divider {
                    width: 1px;
                    height: 28px;
                    background: linear-gradient(to bottom, transparent, #2d3748, transparent);
                    margin: 0 4px;
                }
            `}</style>

            <nav style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: "64px",
                background: scrolled
                    ? "rgba(10, 14, 20, 0.97)"
                    : "rgba(15, 20, 28, 0.85)",
                backdropFilter: "blur(16px)",
                borderBottom: scrolled
                    ? "1px solid rgba(99, 179, 237, 0.2)"
                    : "1px solid rgba(45, 55, 72, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 28px",
                zIndex: 997,
                transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.4)" : "none",
                animation: "fadeSlideDown 0.4s ease both",
            }}>

                {/* Línea de acento superior animada */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "linear-gradient(90deg, #3182ce, #9f7aea, #63b3ed, #9f7aea, #3182ce)",
                    backgroundSize: "300% 100%",
                    animation: "gradientShift 4s ease infinite",
                }} />

                {/* LOGO */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <LuSparkles style={{ color: "#9f7aea", fontSize: "18px" }} />
                        <span style={{ fontWeight: "900", fontSize: "20px", letterSpacing: "0.3px" }}>
                            <span className="navbar-cliente-logo-text">Smart</span>
                            <span style={{ color: "#ffffff", fontWeight: "800" }}>Logix</span>
                        </span>
                    </div>
                    <span style={{
                        fontSize: "10px",
                        background: "linear-gradient(135deg, #2b4a7a, #44337a)",
                        color: "#90cdf4",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontWeight: "700",
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                        border: "1px solid rgba(99, 179, 237, 0.2)",
                    }}>
                        Tienda
                    </span>
                </div>

                {/* DERECHA: usuario + acciones */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                    {/* Avatar + nombre */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "4px" }}>
                        <div className="navbar-cliente-avatar">
                            {user.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                            <span style={{ fontSize: "12px", color: "#718096", fontWeight: "500" }}>Bienvenido</span>
                            <span style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: "700" }}>{user.username}</span>
                        </div>
                    </div>

                    <div className="navbar-cliente-divider" />

                    <button
                        className="navbar-cliente-btn-profile"
                        onClick={() => navigate("/profile")}>
                        <LuUser size={15} />
                        Mi Perfil
                    </button>

                    <button
                        className="navbar-cliente-btn-logout"
                        onClick={handleLogout}>
                        <LuLogOut size={15} />
                        Salir
                    </button>
                </div>
            </nav>
        </>
    );
}

export default NavbarCliente;
