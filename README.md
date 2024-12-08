# Arpab-APP

## Configurazione
Dopo aver clonato il repository creare un file nella directory principale per le variabili di ambiente dal nome: .env
<!-- After cloning the repository, create a file in the main directory for the environment variables named: .env -->
```
MYSQL_ROOT_PASSWORD=<rootpassword>
MYSQL_PASSWORD=<mypassword>
CONFIGURATION=<production|development>
```

## Build e esecuzione
Usare docker compose per la build e esecuzione dalla directory principale
<!-- Use docker compose to build and run from the main directory -->

```
Linux:
sudo docker compose build
sudo docker compose up
```
Windows:
docker compose build
docker compose up

