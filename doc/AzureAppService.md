# Deploying this app to Azure App Service

<!-- TOC -->

-   [Deploying this app to Azure App Service](#deploying-this-app-to-azure-app-service)
    -   [Install VS Code extensions](#install-vs-code-extensions)
    -   [Deploy App](#deploy-app)
    -   [Update Authorization Servers](#update-authorization-servers)
    -   [Add CosmosDB as MongoDB](#add-cosmosdb-as-mongodb)

<!-- /TOC -->

## Install VS Code extensions

> Ref.: [Create a Node.js web app in Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs?pivots=platform-linux)

-   Download and install the [Azure App Service extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice) for Visual Studio Code
-   Download and install the [Azure Databases extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-cosmosdb) for Visual Studio Code
-   Wait for the extensions to finish installing and reload Visual Studio Code
-   Once complete, you'll see an Azure icon in the Activity Bar
-   Sign in to your Azure Account by clicking Sign in to Azure…
-   You should see a list of subscriptions under [APP SERVICE](VSCode_AzureExt_AppService.png)

## Deploy App

-   Open the waptrun project in VS Code
-   In the Azure extension, right next to APP SERVICE , click **Deploy to Web App...** and:
    -   Choose **waptrun**
    -   Select the subscription to deploy to.
    -   Select **Create New Web App... Advanced**
    -   Enter globally unique name for the new app: <APP_NAME>
    -   Select the resource group for new resources: <RES_GRP_NAME>
    -   Select a runtime stack: **Node 12 LTS**
    -   Select an OS: **Linux**
    -   Select a location for new resources: **East US**
    -   Select a Linux App Service plan: <APP_SERVICE_PLAN_NAME>
    -   Select a pricing tier: **Basic (B1) Develop and test**
    -   Create new App Insights Resource: <APP_INSIGHTS_RESOURCE_NAME>
    -   Under the sub, you should see the messages `Creating..., Deploying...`. It takes a few minutes...
-   Review logs by clicking **Connect to Log Stream...** and by viewing Application Logs in the [Azure portal](https://portal.azure.com)

## Update Authorization Servers

-   Since the URL for the app would change to something like https://<APPNAME>.azurewebsites.net, update OAuth server config(s) (details ommitted)

## Add CosmosDB as MongoDB

> Refs:
>
> -   [Create production MongoDB via CLI](https://docs.microsoft.com/en-ca/azure/app-service/tutorial-nodejs-mongodb-app?pivots=platform-linux#create-production-mongodb)
> -   [Create production MongoDB via VS Code](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-cosmosdb#create-an-azure-databases-server)

```bash
appuser@7a735fa6ca0f:~$ az cosmosdb create --name waptrun-mongodb --resource-group <RES_GRP_NAME> --kind MongoDB --subscription <SUBSCRIPTION_NAME> --enable-public-network false
```
