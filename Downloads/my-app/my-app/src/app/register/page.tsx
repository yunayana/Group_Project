'use client'

import { useState } from "react"
import { supabase } from "@/db-config"

function Register() {

    const [data, setData] = useState({
        username: '',
        email: '',
        password: ''
    })

    async function formHandler(e: any) {
        e.preventDefault()

        await supabase.from("users").insert([data])

    }

    return (
        <div>
            <h1>Rejestracja</h1>
            <form onSubmit={formHandler}>
                <input type='text' placeholder="username" value={data.username} onChange={e => setData({ ...data, username: e.target.value })} />
                <input type='text' placeholder="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
                <input type='text' placeholder="password" value={data.password} onChange={e => setData({ ...data, password: e.target.value })} />
                <button>Rejestruj</button>
            </form>
        </div>
    )
}

export default Register