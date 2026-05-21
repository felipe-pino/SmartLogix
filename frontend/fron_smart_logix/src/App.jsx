import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import LoginPage from './pages/login'
import InventoryPage from './pages/inventoryPage'


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='container'>
      <LoginPage />
      <InventoryPage />

    </div>
    
    
  )
}

export default App