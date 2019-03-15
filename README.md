# Simtron

<p>
  <img align="right" height="45" src="simtrnLogo.png">
  Simtron is a SMS reception Slack Bot and Api software built on top of standard SIM5320e gsm and 3g modems serial connections through USB.
</p>

# Contribute

We prefer pull request, but you can also open an issue.

# Why do you need one simtron in your workflow

Simtron can be extended to do whatever you need with a bunch of sim cards, imagine you have 16 mobile phones connected through USB to keep them charged and also to communicate with them. Then you need to listen to received SMS and react doing something usefull. Simtron can just automate that, avoiding all that mess of phones with sims you need to keep up and running.

In Tuenti, we have the following use case: we need to do login in our applications when developing new features and also when doing QA. In development, we can avoid that login most of the times; but, when testing, we need to use test accounts that behaves like real customers, also in login related stuff. These accounts uses "one use SMS code" based authentication.

So we started having lot of sim cards around the company, assigned to development teams and QA teams. We realized this wasn't efficient at all, all these sim card should be maintained and paid, so we decided to share the sim cards in a service tha allows to read and list SMS in a common company channel, reducing the amount of required cards.

To automate this task, we're using Simtron.

# Requirements

You will need following hardware:

- Multi SIM card module device, simtron is compatible with lot of hardware, take a look to the following picture. We've tested in hardware containing SIM5320e and SIM800l modems.

<p align="center">
  <img align="center" height="200" src="sim5320emultimodem.jpg">
</p>

- A PC or server having at least one USB 2.0 port and running linux. Simtron can run on windows and mac too, but we have not tested in such operating systems.

# Installation

You will need **node 10** to run Simtron.

Just clone this repo and then execute:

```bash
npm install
```
Then, to start the service you will need **pm2** package to be globally installed:

```bash
npm install -g pm2
```

To make this installation works, you will need to set a file with basic configuration, all fields but slack token are optional. In repo root, put a file called **data/config.json**, with following content:

```javascript
{
    "bot": {
        "names": ["Simtron"], // all the names the bot will respond to.
    	  "slack": {
            "token": "YOUR SLACK INTEGRATION TOKEN",
            "adminUserIds": [...] // valid slack user ids.
        }
    },
    "countries": { // These entries are used to configure the sim card catalog, organized by country and operator.
        "ES": {
            "name": "Spain",
            "flag": ":flag-es:",
            "lineTypes": { // These are just operator name and sim card classification
                "Movistar": ["Tarjeta", "Contrato"],
                ...
            }
        }
        ...
    }
}
```

Last, just execute:

```bash
npm start
```

Depending on your system, to access USB ports you will need to run previous command as sudo, please do this on your own risk and responsibility.

This will show a new process running under **pm2** process manager. If you need Simtron to restart on every system restart, just type:

```bash
pm2 startup
```
To restart type:

```bash
pm2 restart simtron
```
To kill:

```bash
pm2 delete simtron
```

To see logs:

```bash
pm2 logs simtron
```

# Available command on the bot

For users:

## Read sim catalog

```
Simtron
```

This command displays the simcards catalog. If there are unregistered sim cards in use, this command will show them too, allowing to register properly if needed.

If some sim is not working properly, it will be ~~strikethrough~~

## Read sim details

```
Simtron details <phone number>
```

This command will display the ICC and connection status of the sim identified by the given phone number.

For Admins:

## Register sim card in catalog

```
Simtron register <unregistered sim index>
```

This command starts a formulary to identify and then register all required sim data, just answer inline questions.

## Register sim card in catalog

```
Simtron edit <phone number>
```

This command edits previously registered sim cards' data.
