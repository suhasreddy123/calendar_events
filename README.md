# Event UI 

Calendar events for Classes, Events and Facility events.

## Getting Started

UI is built using Angularjs.
Server runs on Apache

### Prerequisites

Below softwares need to be installed to run the project

Download JS lib files:
```
Angular Router - https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/1.0.3/angular-ui-router.js
Angularjs -  https://ajax.googleapis.com/ajax/libs/angularjs/1.6.6/angular.js
Moment js - http://momentjs.com/downloads/moment.js
```
Apache Installation:
```
sudo apt-get update
sudo apt-get install apache2
```

### Configuration changes:
Add virtual host configuration to /etc/apache2/extra/httpd-vhosts.conf file.
```
<VirtualHost *:80>
    ServerAdmin webmaster@dummy-host2.example.com
    DocumentRoot "{project_folder}"
    ServerName omnifytask.dev
    ServerAlias www.omnifytask.dev
    ErrorLog "/private/var/log/apache2/dummy-host2.example.com-error_log"
    CustomLog "/private/var/log/apache2/dummy-host2.example.com-access_log" common
</VirtualHost>
```

### Do below changes in httpd.conf
Uncomment below lines
```
Include /private/etc/apache2/extra/httpd-vhosts.conf
LoadModule vhost_alias_module libexec/apache2/mod_vhost_alias.so
```

### Enable Document root permissions 
```
<Directory "{project_folder}">
    AllowOverride None
    Options None
    Require all granted
</Directory>
```

### Map IP address to dev url
127.0.0.1       localhost omnifytask.dev www.omnifytask.dev

### Running Program

Run Apache server

```
 sudo apachectl start
```

UI main page url to enter in the browser address bar

```
www.omnifytask.dev
```

