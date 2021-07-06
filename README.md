# JWT-Auth-Template-With-MySQL

##

## This template contains a basic navbar that will display the name of the logged in user.

### Instructions:

#### 1. Clone this repository to your local machine.

```
git clone https://github.com/CodingSalmon/jwt-auth-template-with-mysql.git
```

#### 2. Navigate into the repository and install node modules.

```
cd jwt-auth-template-with-mysql
npm i
```

#### 3. Create a .env file and add values for your MySQL password, a key for signing tokens to securely reset passwords, your client's url, and login info for a google account that does not have 2FA enabled. (nodemailer will not work with 2FA enabled)

```
touch .env
```

```
MYSQL_PW=<your MySQL password>
SECRET=<any string>
CLIENT_URL=http://localhost:3000
RESET_PASSWORD_KEY=<any string>
GOOGLE_APP_EMAIL=<google account email>
GOOGLE_APP_PW=<google account password>
```

(note: When deploying change CLIENT_URL to your site's url)
