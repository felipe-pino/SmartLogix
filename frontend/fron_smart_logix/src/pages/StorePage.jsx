import { useEffect, useState } from "react";
import NavbarCliente from "../components/NavbarCliente";
import LoadingSpinner from "../components/LoadingSpinner";
import { getInventory } from "../services/inventoryService";
import { createOrder } from "../services/ordersService";
import { getPaymentMethods } from "../services/paymentsService";
import { normalizeSearchTerm } from "../utils/formatters";
import { LuSearch, LuShoppingBag, LuPlus, LuMinus, LuTrash2, LuPackage2, LuCreditCard } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

function StorePage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("TODOS");
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [cardToken, setCardToken] = useState(null);
    const [noCardError, setNoCardError] = useState(false);

    // Leer datos del usuario logueado
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : {};

    useEffect(() => {
        async function loadStoreProducts() {
            try {
                const [data, methods] = await Promise.all([
                    getInventory(),
                    getPaymentMethods(),
                ]);
                setProducts(data || []);
                if (Array.isArray(methods) && methods.length > 0) {
                    setCardToken(methods[0].token);
                }
            } catch (error) {
                console.error("Error cargando productos:", error);
            } finally {
                setLoading(false);
            }
        }
        loadStoreProducts();
    }, []);

    const filteredProducts = products.filter((product) => {
        const term = normalizeSearchTerm(searchTerm);
        const matchesSearch =
            product.productName?.toLowerCase().includes(term) ||
            product.sku?.toLowerCase().includes(term);
        const matchesCategory =
            selectedCategory === "TODOS" ||
            product.category?.toUpperCase() === selectedCategory.toUpperCase();
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product) => {
        if (product.availableQuantity <= 0) return;
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.sku === product.sku);
            if (existingItem) {
                if (existingItem.quantity >= product.availableQuantity) return prevCart;
                return prevCart.map((item) =>
                    item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (sku) => {
        setCart((prevCart) => prevCart.filter((item) => item.sku !== sku));
    };

    const updateQuantity = (sku, delta) => {
        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.sku === sku) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return item;
                    if (newQty > item.availableQuantity) return item;
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    // El precio que se manda al backend es el price del inventario
    // El backend aplica su propia lógica de precios dinámicos (descuento estocada, recargo escasez)
    // El total real lo devuelve el backend en la respuesta
    const cartSubtotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
    const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleCheckout = async () => {
        if (cart.length === 0 || isProcessingOrder) return;

        // Verificar que el usuario tiene tarjeta registrada
        if (!cardToken) {
            setNoCardError(true);
            return;
        }
        setNoCardError(false);

        // Construir el DTO exacto que espera el backend
        const orderData = {
            customerName: user.username || "Cliente SmartLogix",
            customerEmail: user.email || `${user.username || "cliente"}@smartlogix.com`,
            shippingAddress: "Dirección de entrega por defecto",
            lines: cart.map((item) => ({
                sku: item.sku,
                quantity: item.quantity,
                // unitPrice viene del inventario — el backend lo recibe como base
                // y aplica su propia lógica dinámica encima
                unitPrice: item.price || 0,
            })),
        };

        try {
            setIsProcessingOrder(true);
            const createdOrder = await createOrder(orderData);

            // Mostrar el total REAL que calculó el backend (con precios dinámicos)
            setOrderSuccess({
                orderNumber: createdOrder.orderNumber,
                totalAmount: createdOrder.totalAmount,
                status: createdOrder.status,
            });

            setCart([]);
            setIsCartOpen(false);
        } catch (error) {
            console.error("Error al procesar la orden:", error);
            alert("Ocurrió un error al enviar el pedido. Por favor, inténtalo de nuevo.");
        } finally {
            setIsProcessingOrder(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Preparando la tienda..." />;
    }

    return (
        <div className="app-layout" style={{ background: "#0f141c", minHeight: "100vh", color: "#ffffff", position: "relative" }}>
            <NavbarCliente />

            <main className="main-content" style={{ padding: "0", paddingTop: "60px" }}>
                <div className="store-container" style={{ padding: "30px", maxWidth: "1400px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

                    {/* Banner sin tarjeta registrada */}
                    {noCardError && (
                        <div style={{ background: "#3a1a1a", border: "1px solid #fc8181", borderRadius: "12px", padding: "16px 24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <LuCreditCard style={{ color: "#fc8181", fontSize: "22px", flexShrink: 0 }} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: "700", color: "#fc8181", fontSize: "15px" }}>No tienes una tarjeta registrada</p>
                                    <p style={{ margin: "3px 0 0 0", color: "#a0aec0", fontSize: "13px" }}>Debes agregar un método de pago antes de confirmar un pedido.</p>
                                </div>
                            </div>
                            <button onClick={() => navigate("/payment-method")}
                                    style={{ background: "#fc8181", color: "#1a202c", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap", marginLeft: "16px" }}>
                                Agregar Tarjeta
                            </button>
                        </div>
                    )}

                    {/* Banner de orden exitosa */}
                    {orderSuccess && (
                        <div style={{ background: "#1a3a2a", border: "1px solid #48bb78", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: "700", color: "#48bb78", fontSize: "16px" }}>¡Orden creada exitosamente!</p>
                                <p style={{ margin: "4px 0 0 0", color: "#a0aec0", fontSize: "13px" }}>
                                    N° {orderSuccess.orderNumber} — Estado: {orderSuccess.status} — Total cobrado por el sistema: <strong style={{ color: "#48bb78" }}>${Number(orderSuccess.totalAmount).toFixed(2)}</strong>
                                </p>
                                <p style={{ margin: "4px 0 0 0", color: "#718096", fontSize: "12px" }}>
                                    El total puede diferir del subtotal estimado por descuentos o recargos de precio dinámico aplicados por el servidor.
                                </p>
                            </div>
                            <button onClick={() => setOrderSuccess(null)}
                                    style={{ background: "none", border: "none", color: "#a0aec0", fontSize: "22px", cursor: "pointer" }}>
                                &times;
                            </button>
                        </div>
                    )}

                    {/* ENCABEZADO */}
                    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid #2d3748", paddingBottom: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ textTransform: "uppercase", fontSize: "11px", letterSpacing: "1.5px", color: "#63b3ed", fontWeight: "bold" }}>Nuestra Tienda</span>
                            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#f7fafc" }}>Catálogo de Productos</h1>
                            <p style={{ margin: 0, fontSize: "14px", color: "#a0aec0" }}>Encuentra la mejor tecnología al mejor precio.</p>
                        </div>

                        <button
                            style={{ display: "flex", alignItems: "center", gap: "12px", background: cartItemsCount > 0 ? "#3182ce" : "#2d3748", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", transition: "0.2s" }}
                            onClick={() => setIsCartOpen(true)}
                        >
                            <LuShoppingBag style={{ fontSize: "20px" }} />
                            <div style={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "13px", fontWeight: "700" }}>Mi Carrito</span>
                                <span style={{ fontSize: "11px", opacity: 0.8 }}>~${cartSubtotal.toFixed(2)}</span>
                            </div>
                            {cartItemsCount > 0 && (
                                <span style={{ background: "#e53e3e", color: "white", borderRadius: "50%", padding: "2px 7px", fontSize: "11px", fontWeight: "bold" }}>{cartItemsCount}</span>
                            )}
                        </button>
                    </header>

                    {/* FILTROS */}
                    <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "35px", flexWrap: "wrap" }}>
                        <div style={{ position: "relative", flex: "1", minWidth: "300px" }}>
                            <LuSearch style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#718096", fontSize: "18px" }} />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: "100%", padding: "14px 14px 14px 45px", background: "#1a202c", border: "1px solid #4a5568", borderRadius: "12px", color: "#ffffff", outline: "none", boxSizing: "border-box" }}
                            />
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            {["TODOS", "HARDWARE", "PERIFÉRICOS", "AUDIO"].map((cat) => (
                                <button key={cat}
                                        style={{ padding: "8px 16px", background: selectedCategory === cat ? "#4299e1" : "#2d3748", color: "#ffffff", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "0.2s" }}
                                        onClick={() => setSelectedCategory(cat)}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* GRILLA DE PRODUCTOS */}
                    <section>
                        {filteredProducts.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#718096" }}>
                                <LuPackage2 style={{ fontSize: "45px", marginBottom: "10px" }} />
                                <h3>No se encontraron productos</h3>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "25px" }}>
                                {filteredProducts.map((product) => {
                                    const hasStock = product.availableQuantity > 0;
                                    const cartItem = cart.find((item) => item.sku === product.sku);
                                    const qtyInCart = cartItem ? cartItem.quantity : 0;
                                    const fallbackUrl = `https://placehold.co/400x250/2d3748/ffffff?text=${encodeURIComponent(product.productName?.substring(0, 15) || "Sin Imagen")}`;
                                    const finalImageUrl = product.productImage || product.imageUrl || fallbackUrl;
                                    const price = product.price || 0;

                                    return (
                                        <div key={product.sku}
                                             style={{ background: "#1a202c", border: "1px solid #2d3748", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", opacity: hasStock ? 1 : 0.55, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" }}>
                                            <div style={{ width: "100%", height: "180px", background: "#141923", overflow: "hidden", position: "relative", borderBottom: "1px solid #2d3748" }}>
                                                <img src={finalImageUrl} alt={product.productName}
                                                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                     onError={(e) => { e.target.onerror = null; e.target.src = fallbackUrl; }} />
                                            </div>

                                            <div style={{ padding: "18px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                                <div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                                        <span style={{ fontSize: "11px", background: "#2d3748", color: "#cbd5e0", padding: "4px 8px", borderRadius: "6px" }}>{product.category || "General"}</span>
                                                        <span style={{ fontSize: "11px", color: hasStock ? "#48bb78" : "#f56565", fontWeight: "bold" }}>
                                                            {hasStock ? `Stock: ${product.availableQuantity}` : "Agotado"}
                                                        </span>
                                                    </div>
                                                    <h3 style={{ margin: "5px 0 15px 0", fontSize: "17px", fontWeight: "600", color: "#ffffff", lineHeight: "1.3" }}>{product.productName}</h3>
                                                </div>

                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #2d3748", paddingTop: "15px", marginTop: "10px" }}>
                                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                                        <span style={{ fontSize: "11px", color: "#718096", marginBottom: "2px" }}>Precio base</span>
                                                        <div style={{ fontSize: "20px", fontWeight: "800", color: "#48bb78" }}>${price.toFixed(2)}</div>
                                                    </div>
                                                    <button
                                                        style={{ background: qtyInCart > 0 ? "#2b6cb0" : "#3182ce", color: "#ffffff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: hasStock ? "pointer" : "not-allowed", fontWeight: "600", transition: "0.2s" }}
                                                        disabled={!hasStock || qtyInCart >= product.availableQuantity || isProcessingOrder}
                                                        onClick={() => addToCart(product)}>
                                                        {qtyInCart > 0 ? `Agregado (${qtyInCart})` : "Comprar"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* BACKDROP */}
            {isCartOpen && (
                <div onClick={() => !isProcessingOrder && setIsCartOpen(false)}
                     style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)", zIndex: 998 }} />
            )}

            {/* PANEL CARRITO */}
            <aside style={{
                position: "fixed", top: 0, right: isCartOpen ? "0" : "-420px", width: "100%", maxWidth: "380px", height: "100vh",
                background: "#1a202c", borderLeft: "1px solid #2d3748", padding: "25px", display: "flex", flexDirection: "column",
                boxSizing: "border-box", zIndex: 999, transition: "right 0.3s ease-in-out", boxShadow: isCartOpen ? "-10px 0 30px rgba(0,0,0,0.7)" : "none"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2d3748", paddingBottom: "15px", marginBottom: "15px" }}>
                    <div>
                        <h3 style={{ margin: 0, color: "#f7fafc" }}>Tu Carrito</h3>
                        <span style={{ fontSize: "12px", color: "#718096" }}>{cartItemsCount} artículos</span>
                    </div>
                    <button style={{ background: "none", border: "none", color: "#a0aec0", fontSize: "28px", cursor: isProcessingOrder ? "not-allowed" : "pointer", padding: "0 5px" }}
                            disabled={isProcessingOrder} onClick={() => setIsCartOpen(false)}>&times;</button>
                </div>

                <div style={{ flexGrow: 1, overflowY: "auto", paddingRight: "5px" }}>
                    {cart.map((item) => (
                        <div key={item.sku} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#2d3748", padding: "12px", borderRadius: "10px", marginBottom: "10px" }}>
                            <div style={{ maxWidth: "55%" }}>
                                <h4 style={{ margin: 0, fontSize: "13px", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</h4>
                                <span style={{ fontSize: "12px", color: "#a0aec0", fontWeight: "bold" }}>${(item.price || 0).toFixed(2)} c/u</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <button disabled={isProcessingOrder} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }} onClick={() => updateQuantity(item.sku, -1)}><LuMinus size={10} /></button>
                                <span style={{ fontSize: "13px", fontWeight: "bold" }}>{item.quantity}</span>
                                <button disabled={isProcessingOrder} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }} onClick={() => updateQuantity(item.sku, 1)}><LuPlus size={10} /></button>
                                <button disabled={isProcessingOrder} style={{ background: "none", border: "none", color: "#fc8181", cursor: "pointer", marginLeft: "5px" }} onClick={() => removeFromCart(item.sku)}><LuTrash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div style={{ textAlign: "center", color: "#718096", marginTop: "40px" }}>
                            <LuShoppingBag style={{ fontSize: "40px", marginBottom: "10px", opacity: 0.5 }} />
                            <p style={{ fontSize: "14px" }}>Tu carrito está vacío.</p>
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div style={{ borderTop: "1px solid #2d3748", paddingTop: "20px", marginTop: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#a0aec0" }}>
                            <span>Subtotal estimado</span>
                            <span>${cartSubtotal.toFixed(2)}</span>
                        </div>
                        <p style={{ fontSize: "11px", color: "#718096", margin: "0 0 16px 0" }}>
                            El total final puede variar según descuentos o recargos aplicados automáticamente por el sistema.
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "18px" }}>
                            <span style={{ color: "#ffffff", fontWeight: "bold" }}>Total estimado</span>
                            <span style={{ color: "#48bb78", fontWeight: "900" }}>${cartSubtotal.toFixed(2)}</span>
                        </div>

                        <button
                            style={{ width: "100%", padding: "16px", background: isProcessingOrder ? "#718096" : "#48bb78", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "bold", cursor: isProcessingOrder ? "not-allowed" : "pointer", transition: "0.2s" }}
                            disabled={isProcessingOrder}
                            onClick={handleCheckout}>
                            {isProcessingOrder ? "Procesando Orden..." : "Confirmar Pedido"}
                        </button>
                    </div>
                )}
            </aside>
        </div>
    );
}

export default StorePage;
