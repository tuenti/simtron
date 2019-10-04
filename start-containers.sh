#!/bin/sh

deleteData()
{
    read -p "Do you want to clean all containers volumes (Y|n): " deleteConfirmation
    if [ "$deleteConfirmation" = "Y" ]
    then
        echo "Deleting all data in: " $1
        cd "$1"
        sudo rm -rf data/
        sudo rm -rf meta/
        sudo rm -rf wal/
        cd ../..
    fi
}

echo Starting ...
if [ "$1" = "dev" ]
then
    echo Dev environment.
    deleteData "./server-provision/influxdb-dev/data/"
    echo Starting docker containers...
    sudo docker-compose -f ./docker-compose-dev.yaml up &

else
    echo Production environment.
    deleteData "./server-provision/influxdb-prod/data/"
    echo Starting docker containers...
    sudo docker-compose up &
fi
    echo Running.
