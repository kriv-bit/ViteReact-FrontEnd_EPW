import { useState } from 'react'
import CustomersPage from "./pages/CustomersPage";

function App() {
  const [count, setCount] = useState(0)
  return (<CustomersPage />)
}
export default App