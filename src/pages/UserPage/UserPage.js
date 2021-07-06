import React, { useEffect, useState } from 'react'
import {useParams} from 'react-router-dom'
import userService from '../../services/userService'

import './UserPage.css'

const UserPage = ({loggedInUser}) => {
    const {id} = useParams()
    const [user, setUser] = useState({})
    const [friends, setFriends] = useState([])
    const [incFriendRequests, setIncFriendRequests] = useState([])
    const [outFriendRequests, setOutFriendRequests] = useState([])

    useEffect(() => {
        (async () => {
            const currentUser = await userService.getUserFromId(id)
            setUser(currentUser)
            const friendInfo = await userService.getFriends(id)
            setFriends(friendInfo.friends)
            setIncFriendRequests(friendInfo.incRequests)
            setOutFriendRequests(friendInfo.outRequests)
        })()
    }, [id])

    const handleSendFr = async () => {
        await userService.sendFriendRequest(loggedInUser.id, id)
        setIncFriendRequests([...incFriendRequests, {email: loggedInUser.email, id: loggedInUser.id, name: loggedInUser.name}])
    }
    
    const handleAcceptReq = async (frId) => {
        const newFriend = await userService.acceptFriendRequest(id, frId)
        setIncFriendRequests(incFriendRequests.filter(fr => fr.id !== frId))
        setFriends([...friends, newFriend])
    }

    const handleDeleteWhileViewing = async (type) => {
        await userService.deleteFriend(id, loggedInUser.id)
        if (type === 'o') setOutFriendRequests(outFriendRequests.filter(fr => fr.id !== loggedInUser.id));
        if (type === 'i') setIncFriendRequests(incFriendRequests.filter(fr => fr.id !== loggedInUser.id));
        if (type === 'f') setFriends(friends.filter(fr => fr.id !== loggedInUser.id));
    }

    const handleDeleteOnOwnPage = async (frId, type) => {
        await userService.deleteFriend(id, frId)
        if (type === 'o') setOutFriendRequests(outFriendRequests.filter(fr => fr.id !== frId));
        if (type === 'i') setIncFriendRequests(incFriendRequests.filter(fr => fr.id !== frId));
        if (type === 'f') setFriends(friends.filter(fr => fr.id !== frId));
    }

    return (
        <>
            {user ?
                <>
                    <div className='user-area'>
                        <h3>{user.name}</h3>
                        <br></br>
                        <p>Email: {user.email}</p>
                        <div className='friend-button-area'>
                            {loggedInUser ?
                                loggedInUser.id !== user.id ?
                                    outFriendRequests.some(friend => friend.id === loggedInUser.id) ?
                                        <>
                                            <button onClick={() => handleAcceptReq(loggedInUser.id)}>Accept</button>
                                            <button onClick={() => handleDeleteWhileViewing('o')}>Cancel</button>
                                        </>
                                    :incFriendRequests.some(friend => friend.id === loggedInUser.id) ?
                                        <button onClick={() => handleDeleteWhileViewing('i')}>Cancel Friend Request</button>
                                    :friends.some(friend => friend.id === loggedInUser.id) ?
                                        <button onClick={() => handleDeleteWhileViewing('f')}>Unfriend</button>
                                    :<button onClick={handleSendFr}>Send Friend Request</button>
                                :''
                            :''}
                        </div>
                    </div>
                    <div className='friend-area'>
                        {loggedInUser ?
                            loggedInUser.id === user.id ?
                            <>
                                <div>
                                    <h5>Pending Requests</h5>
                                    {outFriendRequests ? 
                                        outFriendRequests.map((fr) => 
                                            <div key={fr.id} className='user'>
                                                <div>Name: {fr.name}</div>
                                                <div>Email: {fr.email}</div>
                                                <div className='user-button-area'>
                                                    <button onClick={() => handleDeleteOnOwnPage(fr.id, 'o')}>Cancel</button>
                                                </div>
                                            </div>
                                        )
                                    :''}
                                </div>
                                <div>
                                    <h5>Incoming Requests</h5>
                                    {incFriendRequests ?
                                        incFriendRequests.map((fr) => 
                                            <div key={fr.id} className='user'>
                                                <div>Name: {fr.name}</div>
                                                <div>Email: {fr.email}</div>
                                                <div className='user-button-area'>
                                                    <button onClick={() => handleAcceptReq(fr.id)}>Accept</button>
                                                    <button onClick={() => handleDeleteOnOwnPage(fr.id, 'i')}>Cancel</button>
                                                </div>
                                            </div>
                                        )
                                    :''}
                                </div>
                            </>
                            :''
                        :''}
                        <div>
                            <h5>Friends</h5>
                            {friends ? 
                                friends.map((friend) => 
                                    <div key={friend.id} className='user'>
                                        <div>Name: {friend.name}</div>
                                        <div>Email: {friend.email}</div>
                                        {loggedInUser ?
                                            user.id === loggedInUser.id ?
                                                <div className='user-button-area'>
                                                    <button onClick={() => handleDeleteOnOwnPage(friend.id, 'f')}>Delete</button>
                                                </div>
                                            :''
                                        :''}
                                    </div>
                                )
                            :''}
                        </div>
                    </div>
                </>
            :''}
        </>
    )
}

export default UserPage;