# NIDA SMART ENERGY

A building energy management system running on **MariaDB**, **Node.js (Express)**, and **ReactJS**.

## How to install and run

### Follow the steps accordingly.

After cloning repository, navigate into NIDA-SMART-ENERGY

```
cd NIDA-SMART-ENERGY
```

## Database

Start up MariaDB with docker-compose

```
docker-compose up -d
```

**Restore MariaDB from backup located in /db/sql/nse_dump.sql**

## Server

Navigate into /server and install packages with _yarn_

```
yarn install
```

Create a _.env_ file with the following keys

```
NODE_ENV=production
PORT=9876

DB_CLIENT=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=[db password]
DB_DATABASE=nida_smart_energy
DB_PORT=3306

MAIL_HOST=smtp.office365.com
MAIL_PORT=587
MAIL_USER=SmartNida.admin@nida.ac.th
MAIL_PASS=[mail password]
MAIL_SECURE=true
MAIL_CIPHERS=SSLv3

TOKEN_SECRET=[token secret key]
TOKEN_LIFE=[token life]
REFRESH_TOKEN_SECRET=[refresh token secret key]
REFRESH_TOKEN_LIFE=[refresh token life]

BASE_URL=http://[domain]:[port] // For reset password and verification emails
BASE_DOMAIN=.[domain] // Enable multiple subdomains for cookie

NIDA_API_BASE_URL=http://api2energy.nida.ac.th
NIDA_API_HOSTNAME=api2energy.nida.ac.th
NIDA_API_USERNAME=[NIDA API username]
NIDA_API_PASSWORD=[NIDA API password]

NIDA_API_IAQ_DEVICE_ID=PM25_NVOutdoor1
NIDA_API_SOLAR_DEVICE_ID=SolarCell

CLIENT_URL=http://[domain]:[port]
```

Start Express server

```
node ./bin/www.js
```

## Frontend

Navigate into /frontend and install packages with _yarn_

```
yarn install
```

Create a _.env_ file with the following keys

```
REACT_APP_NODE_ENV=production
REACT_APP_API_BASE_URL=http://[domain]:][port]

```

Start ReactJS app

```
yarn start
```
