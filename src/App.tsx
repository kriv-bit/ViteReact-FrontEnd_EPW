import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-sky-400 drop-shadow-lg">
          ¡Tailwind funcionando!
        </h1>
      </div>
    </>
  )
}

export default App
