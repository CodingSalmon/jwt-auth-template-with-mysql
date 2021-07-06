import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import userService from '../../services/userService'

import './UsersPage.css'

const UsersPage = ({user}) => {
    const [users, setUsers] = useState([])

    useEffect(() => {
        (async () => {
            const currentUsers = await userService.getAllUsers()
            setUsers(currentUsers)
        })()
    }, [])

    return (
        <div className='UsersPage'>
            <h3>All Users</h3>
            {users.map((currentUser) =>
                <div className='user' key={currentUser.id}>
                    <div>Name: {currentUser.name}</div>
                    <div>Email: {currentUser.email}</div>
                    <div className='user-button-area'>
                        <Link to={`/user/${currentUser.id}`}><button>Details</button></Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsersPage;