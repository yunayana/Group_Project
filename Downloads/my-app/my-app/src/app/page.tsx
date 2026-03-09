'use client'

import { supabase } from "@/db-config"
import Link from "next/link"
import { useEffect, useState } from "react"

function Home() {
  const [users, setUsers] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<any>(null)

  async function getUsers() {
    setLoading(true)
    setFetchError(null)

    try {
      const { data, error } = await supabase.from("users").select("*")

      if (error) {
        console.error('Error fetching users (details):', JSON.stringify(error, null, 2))
        setFetchError(error)
        setUsers([])
        return
      }

      setUsers(data ?? [])
    } catch (err) {
      console.error('Unexpected error fetching users:', err)
      setFetchError(err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  return (
    <div>
      <h1 className="text-amber-400 text-4xl mb-10">Users</h1>
      {users.map((user: any) => (
        <div key={user.id}>
          <h1>{user.username}</h1>
          <h2>{user.email}</h2>
        </div>
      ))}
      <div className="mt-10">
        <Link href='/register' >Przejdz do rejestracji</Link>
      </div>
    </div>
  )
}

export default Home