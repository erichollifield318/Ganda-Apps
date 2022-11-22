# ganda.app

## Instructions to setup dev environment

* Install Node.js, NPM and NVM(Node Version Management)

`sudo apt-get install nodejs`

`sudo apt-get install npm`

    - How to install NVM.

    sudo apt-get update
    
    sudo apt-get install build-essential libssl-dev
    
    curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh -o install_nvm.sh

    nano install_nvm.sh
    
    bash install_nvm.sh
    
    source ~/.profile
    
    nvm ls-remote
    
* Install MongoDB

    - Import the public key used by the package management system
    
    `sudo apt-get install gnupg`
    
    `wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -`
    
    - Create a list file for MongoDB.

    `echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list`
    
    - Reload local package database.
    
    `sudo apt-get update`
    
    - Install the MongoDB packages
    
    `sudo apt-get install -y mongodb-org`
    
    - Start MongoDB.
    
    `sudo systemctl start mongod` 
    
    - Verify that MongoDB has started successfully
    
    `sudo systemctl status mongod`

* Install and Configure Apache/Nginx for redirecting 80/443 port to meteor app (I explain only for Nginx case)

    - Step 1: Install Nginx
    
    `sudo apt-get update`
    
    `sudo apt-get install nginx`
    
    - Step 2: Adjust the Firewall
    
    `sudo ufw app list`
    
    `sudo ufw allow 'Nginx HTTP'`
     
    `sudo ufw status`
    
    - Step 3: Check your Web Server
    
    `systemctl status nginx`
    
    - Step 4: Create Server Block File for Ganda App
    
    `sudo nano /etc/nginx/sites-available/ganda`
    
    Paste following contents to ganda file (I will write for only http case for local environment)
    
    ```
    server {
        listen 80;
        server_name admin.ganda.app;
    
        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    server {
            listen 80;
            server_name *.ganda.app;
        
            location / {
                proxy_pass http://127.0.0.1:4000;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
    ```
 *** Enable ganda file. ***
 
     ln -s /etc/nginx/sites-available /etc/nginx/site-enabled

* Install Meteor

`curl https://install.meteor.com/ | sh`

* Clone the source code from this repository

`git clone https://github.com/Hazious/ganda.app.git`

* Copy the settings.json files for both of Admin and Client App directory
 
* How to run the Admin App

    - Go to Admin Directory
    
    `cd ganda.app/envently_adminApp`

    - Check and install meteor 1.8.1 version using following command
    
    `meteor --version`
    
    - Install packages
    
    `meteor npm install`
    
    - Run the Admin App
    
    `npm run app`
    
 * Import database from dbdump files
 
    - Run the following command on Admin directory
 
    `mongorestore -h 127.0.0.1 --port 3001 -d meteor dbdump/dump/meteor`
    
 * How to Run the Client App
 
    - Go to Client App Directory
    
    `cd envently_userApp`
    
    - Install packages
    
    `npm install`
    
    - Set the Env Variables

    `export ROOT_URL="http://www.ganda.app"`
    
    `export MONGO_URL=mongodb://127.0.0.1:3001/meteor`
    
    - Run the Client App
    
    `npm run app`
    
## Instructions to setup production environment

* Install Node.js, NPM and NVM(Node Version Management)

`sudo apt-get install nodejs`

`sudo apt-get install npm`

    - How to install NVM.

    sudo apt-get update
    
    sudo apt-get install build-essential libssl-dev
    
    curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh -o install_nvm.sh

    nano install_nvm.sh
    
    bash install_nvm.sh
    
    source ~/.profile
    
    nvm ls-remote
    
* Install MongoDB

    - Import the public key used by the package management system
    
    `sudo apt-get install gnupg`
    
    `wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -`
    
    - Create a list file for MongoDB.

    `echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list`
    
    - Reload local package database.
    
    `sudo apt-get update`
    
    - Install the MongoDB packages
    
    `sudo apt-get install -y mongodb-org`
    
    - Start MongoDB.
    
    `sudo systemctl start mongod` 
    
    - Verify that MongoDB has started successfully
    
    `sudo systemctl status mongod`

* Install and Configure Apache/Nginx for redirecting 80/443 port to meteor app (I explain only for Nginx case)

    - Step 1: Install Nginx
    
    `sudo apt-get update`
    
    `sudo apt-get install nginx`
    
    - Step 2: Adjust the Firewall
    
    `sudo ufw app list`
    
    `sudo ufw allow 'Nginx HTTP'`
     
    `sudo ufw status`
    
    - Step 3: Check your Web Server
    
    `systemctl status nginx`
    
    - Step 4: Create Server Block File for Ganda App
    
    `sudo nano /etc/nginx/sites-available/ganda`
    
    Paste following contents to ganda file
    
    *** Here I used 35155 and 38291 port because the Admin and Client app are running on that ports ***
    *** We can check listening port status by `sudo lsof -i -P -n | grep LISTEN` command and change the ports *** 
    
    ```
    server_tokens off; # for security-by-obscurity: stop displaying nginx version
    
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }
    
    server {
        listen 80; # if this is not a default server, remove "default_server"
        listen [::]:80 ipv6only=on;
    
        root /usr/share/nginx/html; # root is irrelevant
        index index.html index.htm; # this is also irrelevant
    
    
        # redirect non-SSL to SSL
        location / {
            rewrite     ^ https://$server_name$request_uri? permanent;
        }
    }
    
    server {
        listen 443 ssl; # we enable SPDY here
        server_name admin.ganda.app; # this domain must match Common Name (CN) in the SSL certificate
    
        root html; # irrelevant
        index index.html; # irrelevant
    
        ssl_certificate /etc/nginx/ssl/ganda.app.crt; # full path to SSL certificate and CA certificate concatenated together
        ssl_certificate_key /etc/nginx/ssl/ganda.app.key; # full path to SSL key

        ssl_stapling on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 5m;
    
        ssl_prefer_server_ciphers on;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:ECDHE-RSA-RC4-SHA:ECDHE-ECDSA-RC4-SHA:RC4-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!PSK';
    
        add_header Strict-Transport-Security "max-age=31536000;";
    
        if ($http_user_agent ~ "MSIE" ) {
            return 303 https://browser-update.org/update.html;
        }
    
        location / {
            proxy_pass http://127.0.0.1:35155;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade; # allow websockets
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header X-Forwarded-For $remote_addr; # preserve client IP
    
            if ($uri != '/') {
                expires 30d;
            }
        }
    }
    
    server {
        listen 443 ssl; # we enable SPDY here
        server_name *.ganda.app; # this domain must match Common Name (CN) in the SSL certificate
    
    
        ssl_certificate /etc/nginx/ssl/ganda.app.crt; # full path to SSL certificate and CA certificate concatenated together
        ssl_certificate_key /etc/nginx/ssl/ganda.app.key; # full path to SSL key
    
        ssl_stapling on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 5m;
    
        ssl_prefer_server_ciphers on;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:ECDHE-RSA-RC4-SHA:ECDHE-ECDSA-RC4-SHA:RC4-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!PSK';
    
        add_header Strict-Transport-Security "max-age=31536000;";
    
        if ($http_user_agent ~ "MSIE" ) {
            return 303 https://browser-update.org/update.html;
        }
    
        location / {
            proxy_pass http://127.0.0.1:38291;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade; # allow websockets
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header X-Forwarded-For $remote_addr; # preserve client IP
    
            if ($uri != '/') {
                expires 30d;
            }
        }
    }
    ```    

 *** Enable ganda file. ***

    `ln -s /etc/nginx/sites-available /etc/nginx/site-enabled`
    
* Install Meteor

`curl https://install.meteor.com/ | sh`

* Clone the source code from this repository

`git clone https://github.com/Hazious/ganda.app.git`

* How to build the production app

    - Go to admin app directory and build to production. After that go to client app directory and build production for client app.
    
    `sudo mkdir productions` 
    
    `cd ganda.app/envently_adminApp`
    
    `meteor build --server-only ../../productions`
    
    `cd ../`
    
    `cd envetly_userApp`
    
    `meteor build --server-only ../../productions`
    
    - Move the tar.gz files to `/var/www/html` directory Extract tar.gz files
    
    `sudo mv productions/envently_adminApp.tar.gz /var/www/html/ganda_admin`

    `sudo mv productions/envently_userApp.tar.gz /var/www/html/ganda_client`
    
    `cd /var/www/html/ganda_admin`
    
    `tar -xvf envently_adminApp.tar.gz`
    
    `cd bundle/programs/server`
    
    - Build the both of Apps for production
        
    *** Here we need to use node.js 8.17.0 to do `npm install` on production app ***
    
    `nvm install 8.17.0`
    
    `nvm use 8.17.0`
    
    `npm install --production`
    
    `cd ../../`
    
    Now we need to set ROOT_URL, MONGO_URL and METEOR_SETTINGS variables to run the production app
    
    Here is the command for admin app:
    
    `MONGO_URL="mongodb://envent:Env321enT@127.0.0.1:27017/ganda-app?authSource=admin" ROOT_URL="https://admin.ganda.app" METEOR_SETTINGS='{ "FbAppId": "152878832127369", "FbSecret": "0d32dd8279aa427429df8935c38dc3aa", "GoogleClientId": "923874879072-s0cclmsg0uu18tv58rii0h0k6dehltfh.apps.googleusercontent.com", "GoogleSecret": "AynSoMGCfubGcAnqG0-uAl61", "TwitterConsumerKey": "HAeskBRhHHRHwAuOK6Unvee8t", "TwitterSecret": "iqcaaXQX6iF8b9N8Op5pYCyrULipqGnByYrrTh46p4OR1N5m35", "awsBucket": "envent.ly", "awsAccessKeyId": "AKIAIGILMACFBZCKBKTQ", "awsSecretKey": "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", "awsRegion": "ap-southeast-2", "loggly": { "token": "a52095ba-00bf-4d56-9ef9-98ca68edc122", "subdomain": "envently", "auth": { "username": "app", "password": "App123" }, "json": "true" }, "private": { "smtp": { "username": "CodyEnvent", "password": "Nuked0011", "server":  "smtp.sendgrid.net", "port": 587 } }, "public": { "globalURL": "admin.ganda.app", "adminEmail": "ganda@envent.cloud", "mapboxglKey": "pk.eyJ1IjoiZW52ZW50IiwiYSI6ImNqMTJ3MG81czAwYmszM28yNHlxNmFrYnYifQ.XH3Z4-OILdPbG_wCna1g-Q", "prodSensisKey": "hjaqehsymv8rt8k62v698ghp", "devSensisKey": "6q56cxjyygzktfkyrtahadnw", "prodSensisUrl": "https://api.sensis.com.au/v1/prod/", "devSensisUrl": "http://api.sensis.com.au/v1/test/", "isLocal": false, "userAppActions": { "appStart": "app start", "appLoaded": "app loaded", "sensisQuery": "sensis query", "sensisResult": "sensis result", "localQuery": "local query", "localResult": "local result", "mapRender": "map render", "mapRendered": "map rendered", "mainMenuOpened": "main menu opened", "mainMenuItemSelected": "main menu item selected", "subMenuItemSelected": "sub menu item selected", "markerPressed": "marker pressed", "detailsButtonPressed": "details button pressed", "directionsButtonPressed": "directions button pressed", "externalLinkPressed": "External link pressed" } } }' PORT=3000 node main.js`
    
    Next, `npm install --production` in `/var/www/html/ganda_client/bundle/programs/server` directory.
    
    Finally run this command for client app:
    
    `MONGO_URL="mongodb://envent:Env321enT@127.0.0.1:27017/ganda-app?authSource=admin" ROOT_URL="http://www.ganda.app" METEOR_SETTINGS='{ "awsBucket": "envent.ly", "awsAccessKeyId": "AKIAIGILMACFBZCKBKTQ", "awsSecretKey": "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", "awsRegion": "ap-southeast-2", "loggly":{ "token": "a52095ba-00bf-4d56-9ef9-98ca68edc122", "subdomain": "envently", "auth": { "username": "app", "password": "App123" }, "json": "true" }, "private":{ "smtp" : { "username": "CodyEnvent", "password": "Nuked0011", "server":  "smtp.sendgrid.net", "port": 587 } }, "public": { "globalURL": "ganda.app", "adminEmail": "ganda@envent.cloud", "mapboxglKey": "pk.eyJ1IjoiZW52ZW50IiwiYSI6ImNqMTJ3MG81czAwYmszM28yNHlxNmFrYnYifQ.XH3Z4-OILdPbG_wCna1g-Q", "prodSensisKey":"hjaqehsymv8rt8k62v698ghp", "devSensisKey":"6q56cxjyygzktfkyrtahadnw", "prodSensisUrl":"https://api.sensis.com.au/v1/prod/", "devSensisUrl":"http://api.sensis.com.au/v1/test/", "isLocal": false, "userAppActions": { "appStart":"app start", "appLoaded":"app loaded", "sensisQuery":"sensis query", "sensisResult":"sensis result", "localQuery":"local query", "localResult":"local result", "mapRender":"map render", "mapRendered":"map rendered", "mainMenuOpened":"main menu opened", "mainMenuItemSelected":"main menu item selected", "subMenuItemSelected":"sub menu item selected", "markerPressed":"marker pressed", "detailsButtonPressed":"details button pressed", "directionsButtonPressed":"directions button pressed", "externalLinkPressed":"External link pressed", "listMenuSelected":"list menu item selected", "languageSelected":"language selected"  } } }' PORT=4000 node main.js`
    
    
Now Both of  the Admin and Client apps are  running on production server.

Thank you!!!

Eric
