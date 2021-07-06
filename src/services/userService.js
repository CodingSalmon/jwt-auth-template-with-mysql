import tokenService from '../services/tokenService';
const BASE_URL = '/api/auth/';

function signup(user) {
  return fetch(BASE_URL + 'signup', {
    method: 'POST',
    headers: new Headers({'Content-Type': 'application/json'}),
    body: JSON.stringify(user)
  })
  .then(res => {
    console.log(res, '<-- response object')
    return res.json();
  })
  .then(json => {
    if(json.token) return json;
    throw new Error(`${json.err || json.message}`)
  })
  .then(({ token }) => {
    tokenService.setToken(token);
  });
}

function getUser() {
  return tokenService.getUserFromToken();
}

function logout() {
  tokenService.removeToken();
}

function login(creds) {
  return fetch(BASE_URL + 'login', {
    method: 'POST',
    headers: new Headers({'Content-Type': 'application/json'}),
    body: JSON.stringify(creds)
  })
  .then(res => res.json())
  .then(json => {
    if(json.token) return json;
    throw new Error(`${json.err || json.message}`)
  })
  .then(({token}) => tokenService.setToken(token));
}

function getUserFromId(id) {
  return fetch(BASE_URL + 'user/' + id, {
    headers: new Headers({'Content-Type': 'application/json'})
  })
  .then(res => res.json())
}

function forgotPassword(email) {
  return fetch(BASE_URL + 'forgot-password', {
    method: 'PUT',
    headers: new Headers({'Content-Type': 'application/json'}),
    body: JSON.stringify({email})
  })
  .then(res => res.json())
  .then(json => {
    if (json.message) return json
    throw new Error(`${json.error}`)
  })
}

function resetPassword(password, token) {
  return fetch(BASE_URL + 'reset-password',{
    method:'PUT',
    headers: new Headers({'Content-Type': 'application/json'}),
    body: JSON.stringify({password, token})
  })
  .then(res => res.json())
  .then(json => {
    if(json.message) return json
    throw new Error(`${json.error}`)
  })
}

function sendFriendRequest(userId) {
  return fetch(BASE_URL + `add-friend/${userId}`, {
    method: 'POST',
    headers: new Headers({'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tokenService.getToken()}),
  })
  .then(res => res.json())
}

function acceptFriendRequest(user1id, user2id) {
  return fetch(BASE_URL + `accept-friend/${user1id}/${user2id}`, {
    method: 'PUT',
    headers: new Headers({'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tokenService.getToken()}),
  })
  .then(res => res.json())
}

function deleteFriend(user1id, user2id) {
  return fetch(BASE_URL + `delete-friend/${user1id}/${user2id}`, {
    method:'DELETE',
    headers: new Headers({'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tokenService.getToken()}),
  })
  .then(res => res.json())
}

function getFriends(userId) {
  return fetch(BASE_URL + `friends/${userId}`, {
    headers: new Headers({'Content-Type': 'application/json'}),
  })
  .then(res => res.json())
}

function getFriendRequests() {
  return fetch(BASE_URL + 'friends', {
    headers: new Headers({'Content-Type': 'application/json'}),
  })
  .then(res => res.json())
}

function getAllUsers() {
  return fetch(BASE_URL + 'users', {
    headers: new Headers({'Content-Type': 'application/json'}),
  })
  .then(res => res.json())
}

let functions = {
  signup,
  getUser,
  logout,
  login,
  getUserFromId,
  forgotPassword,
  resetPassword,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriend,
  getFriends,
  getFriendRequests,
  getAllUsers,
};

export default functions