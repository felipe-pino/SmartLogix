import "../App.css";

function LoadingSpinner({ message = "Cargando datos..." }) {
  return (
    <div className="inventory-loading">
      <div className="spinner"></div>
      <h2>{message}</h2>
    </div>
  );
}

export default LoadingSpinner;