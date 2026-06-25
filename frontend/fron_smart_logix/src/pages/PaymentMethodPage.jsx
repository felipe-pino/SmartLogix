import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { LuCreditCard, LuArrowLeft, LuShieldCheck, LuUser, LuCalendar, LuLock } from "react-icons/lu";
import { addPaymentMethod } from "../services/paymentsService";
import "../App.css";

function PaymentMethodPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        cardHolder: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        type: "CREDIT",
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    function handleChange(e) {
        const { name, value } = e.target;

        if (name === "cardNumber") {
            const clean = value.replace(/\D/g, "").slice(0, 16);
            const formatted = clean.match(/.{1,4}/g)?.join(" ") || clean;
            setForm((prev) => ({ ...prev, cardNumber: formatted }));
            return;
        }

        if (name === "expiryDate") {
            const clean = value.replace(/\D/g, "").slice(0, 4);
            const formatted = clean.length >= 3 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
            setForm((prev) => ({ ...prev, expiryDate: formatted }));
            return;
        }

        if (name === "cvv") {
            const clean = value.replace(/\D/g, "").slice(0, 3);
            setForm((prev) => ({ ...prev, cvv: clean }));
            return;
        }

        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function validate() {
        const newErrors = {};
        const cleanNumber = form.cardNumber.replace(/\s/g, "");

        if (!form.cardHolder.trim()) newErrors.cardHolder = "El nombre del titular es obligatorio.";
        if (cleanNumber.length !== 16) newErrors.cardNumber = "El número de tarjeta debe tener 16 dígitos.";
        if (!/^\d{2}\/\d{2}$/.test(form.expiryDate)) newErrors.expiryDate = "Formato inválido. Use MM/AA.";
        if (form.cvv.length !== 3) newErrors.cvv = "El CVV debe tener 3 dígitos.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit() {
        if (!validate()) return;

        setLoading(true);
        setApiError(null);

        try {
            const cleanNumber = form.cardNumber.replace(/\s/g, "");
            await addPaymentMethod({
                cardHolder: form.cardHolder.trim().toUpperCase(),
                cardNumber: cleanNumber,
                expiryDate: form.expiryDate,
                cvv: form.cvv,
                type: form.type,
            });

            setSuccess(true);
            setTimeout(() => navigate("/profile"), 1500);
        } catch (err) {
            setApiError(err.message || "No se pudo guardar la tarjeta. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    }

    const cleanNumber = form.cardNumber.replace(/\s/g, "");
    const isVisa = cleanNumber.startsWith("4");
    const isMastercard = cleanNumber.startsWith("5");

    return (
        <div className="app-layout" style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: "400px", height: "400px", background: "rgba(59, 130, 246, 0.08)", borderRadius: "50%", top: "-100px", right: "-100px", filter: "blur(70px)", pointerEvents: "none" }}></div>
            <div style={{ position: "absolute", width: "300px", height: "300px", background: "rgba(147, 197, 253, 0.1)", borderRadius: "50%", bottom: "10%", left: "20%", filter: "blur(60px)", pointerEvents: "none" }}></div>

            <Navbar />

            <main className="main-content" style={{ flex: 1, padding: "40px 20px", zIndex: 1 }}>
                <div className="inventory-container anim-fade-up" style={{ maxWidth: "850px", margin: "0 auto" }}>

                    <header className="inventory-header" style={{ marginBottom: "32px", borderBottom: "1px solid #e2e8f0", paddingBottom: "20px" }}>
                        <h1 style={{ display: "flex", alignItems: "center", fontSize: "28px", color: "#1e293b", fontWeight: "700", margin: "0 0 8px 0" }}>
                            <LuCreditCard style={{ marginRight: "15px", color: "#3b82f6" }} />
                            Método de Pago Seguro
                        </h1>
                        <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>Los datos se tokenizan de extremo a extremo utilizando altos estándares criptográficos.</p>
                    </header>

                    {success ? (
                        <div className="profile-card" style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center", padding: "40px 30px", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", background: "#ffffff" }}>
                            <div style={{ width: "72px", height: "72px", background: "#ecfdf5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" }}>
                                <LuShieldCheck style={{ fontSize: "36px", color: "#10b981" }} />
                            </div>
                            <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a", margin: "0 0 8px 0" }}>¡Tarjeta Guardada!</h3>
                            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 24px 0" }}>Tu información se ha vinculado de manera exitosa y protegida.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>

                            {/* Preview de tarjeta */}
                            <div style={{
                                background: isVisa ? "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)" : isMastercard ? "linear-gradient(135deg, #1e293b 0%, #475569 100%)" : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                                borderRadius: "20px", padding: "30px", color: "#ffffff", minHeight: "220px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)", position: "relative", overflow: "hidden", maxWidth: "420px", width: "100%", margin: "0 auto"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 2 }}>
                                    <div style={{ width: "48px", height: "36px", background: "rgba(255,255,255,0.15)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)" }}></div>
                                    <span style={{ fontWeight: "800", fontStyle: "italic", fontSize: "20px", letterSpacing: "1px" }}>
                                        {isVisa ? "VISA" : isMastercard ? "mastercard" : "SMARTLOGIX"}
                                    </span>
                                </div>
                                <div style={{ fontSize: "22px", letterSpacing: "3px", textAlign: "center", margin: "30px 0", fontFamily: "monospace", zIndex: 2 }}>
                                    {form.cardNumber || "•••• •••• •••• ••••"}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", zIndex: 2 }}>
                                    <div>
                                        <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>Titular</div>
                                        <div style={{ fontSize: "14px", fontWeight: "600", textTransform: "uppercase" }}>{form.cardHolder || "Nombre Apellido"}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>Vence</div>
                                        <div style={{ fontSize: "14px", fontWeight: "600", fontFamily: "monospace" }}>{form.expiryDate || "MM/AA"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Formulario */}
                            <div className="profile-card" style={{ maxWidth: "500px", width: "100%", margin: "0 auto", background: "#ffffff", padding: "35px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>

                                {apiError && (
                                    <div className="auth-alert error" style={{ marginBottom: "20px" }}>{apiError}</div>
                                )}

                                <div className="profile-field" style={{ marginBottom: "20px" }}>
                                    <label className="auth-label" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Nombre del Titular</label>
                                    <div style={{ position: "relative" }}>
                                        <LuUser style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                        <input type="text" name="cardHolder" className="auth-input" placeholder="Ej: JASON MANCILLA" value={form.cardHolder} onChange={handleChange} autoComplete="off"
                                               style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "10px", border: errors.cardHolder ? "1px solid #ef4444" : "1px solid #cbd5e1", outline: "none", fontSize: "14px" }} />
                                    </div>
                                    {errors.cardHolder && <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "5px" }}>{errors.cardHolder}</span>}
                                </div>

                                <div className="profile-field" style={{ marginBottom: "20px" }}>
                                    <label className="auth-label" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Número de Tarjeta</label>
                                    <div style={{ position: "relative" }}>
                                        <LuCreditCard style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                        <input type="text" name="cardNumber" className="auth-input" placeholder="0000 0000 0000 0000" value={form.cardNumber} onChange={handleChange} autoComplete="off"
                                               style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "10px", border: errors.cardNumber ? "1px solid #ef4444" : "1px solid #cbd5e1", outline: "none", fontSize: "14px", fontFamily: "monospace" }} />
                                    </div>
                                    {errors.cardNumber && <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "5px" }}>{errors.cardNumber}</span>}
                                </div>

                                <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                                    <div className="profile-field" style={{ flex: 1 }}>
                                        <label className="auth-label" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Fecha de Vencimiento</label>
                                        <div style={{ position: "relative" }}>
                                            <LuCalendar style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                            <input type="text" name="expiryDate" className="auth-input" placeholder="MM/AA" value={form.expiryDate} onChange={handleChange}
                                                   style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "10px", border: errors.expiryDate ? "1px solid #ef4444" : "1px solid #cbd5e1", outline: "none", fontSize: "14px", fontFamily: "monospace" }} />
                                        </div>
                                        {errors.expiryDate && <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "5px" }}>{errors.expiryDate}</span>}
                                    </div>

                                    <div className="profile-field" style={{ flex: 1 }}>
                                        <label className="auth-label" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>CVV</label>
                                        <div style={{ position: "relative" }}>
                                            <LuLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                            <input type="password" name="cvv" className="auth-input" placeholder="•••" value={form.cvv} onChange={handleChange}
                                                   style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "10px", border: errors.cvv ? "1px solid #ef4444" : "1px solid #cbd5e1", outline: "none", fontSize: "14px" }} />
                                        </div>
                                        {errors.cvv && <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "5px" }}>{errors.cvv}</span>}
                                    </div>
                                </div>

                                <div className="profile-field" style={{ marginBottom: "24px" }}>
                                    <label className="auth-label" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Tipo de Tarjeta</label>
                                    <select name="type" value={form.type} onChange={handleChange}
                                            style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", background: "#fff" }}>
                                        <option value="CREDIT">Crédito</option>
                                        <option value="DEBIT">Débito</option>
                                    </select>
                                </div>

                                <button className="auth-submit-btn" onClick={handleSubmit} disabled={loading}
                                        style={{ width: "100%", padding: "14px", background: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1 }}>
                                    <LuShieldCheck /> {loading ? "Guardando..." : "Guardar Tarjeta Seguro"}
                                </button>

                                <button className="auth-link-btn" onClick={() => navigate("/profile")}
                                        style={{ marginTop: "16px", width: "100%", background: "none", border: "none", color: "#64748b", fontSize: "14px", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                    <LuArrowLeft /> Volver al Perfil
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default PaymentMethodPage;
