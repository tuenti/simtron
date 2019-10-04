# Server provisioning

The server required to run Simtron can be provisioned using the provided **install.sh** script, just clone
this repo in the server machine and execute:

```bash
cd server-provision/
./install.sh
```

This script will create 3 services: simtron and 2 instances of influx db, one for production, with an already
created **simtron** database and one for development, also with a database, this time called **simtron-dev**.

**IMPORTANT:** If you already have important data stored in previously provisioned server, answare with **n**
when the script ask you for confirmation on deleting data, otherwise, all data will be deleted from influx
dababases.
