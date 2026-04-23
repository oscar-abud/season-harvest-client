import { useEffect, useState } from "react"
import { useClientStore } from "@/store/client.store"

export function Cart() {
  const [cart, setCart] = useState([])
  const [client, setClient] = useState({})
  const { user } = useClientStore()

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWU4MTViZTMzNmM5ZmExODk0NTVmN2MiLCJpYXQiOjE3NzY4MTc2NDB9.Rscs01kQwE-1hLPnoxiNJmwKGLrzinBVUMwvJDyutRA'

  useEffect(() => {
    async function fetchClient() {
      const res = await fetch(`http://localhost:8080/api/cliente/${user?._id}`, {
         method: "GET",
         headers: {
           Authorization: `Bearer ${token}`,
           "Content-Type": "application/json",
         },
      })
      const data = await res.json()
      setClient(data)
      setCart(data.carts)
    }
    fetchClient()
  }, [])

  const styled = {
    color: "black"
  }

  return (
    <>
      <h1 style={styled}>
        🛒{cart.length}
      </h1>
    </>
  )
}