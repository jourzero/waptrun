# Deploying this app to Azure App Service

<!-- TOC -->

-   [Deploying this app to Azure App Service](#deploying-this-app-to-azure-app-service)
    -   [Install VS Code extension](#install-vs-code-extension)
    -   [Deploy](#deploy)

<!-- /TOC -->

## Install VS Code extension

Ref.: [Create a Node.js web app in Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs?pivots=platform-linux)

-   Download and install the [Azure App Service extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice) for Visual Studio Code
-   Wait for the extension to finish installing then reload Visual Studio Code when prompted
-   Once complete, you'll see an Azure icon in the Activity Bar
-   Sign in to your Azure Account by clicking Sign in to Azure…
-   You should see a list of subscriptions under [APP SERVICE](VSCode_AzureExt_AppService.png)

## Deploy

-   Open the waptrun project in VS Code
-   In the Azure extension, right next to APP SERVICE , click **Deploy to Web App...** and:
    -   Choose **waptrun**
    -   Select the subscription to deploy to.
    -   Select **Create New Web App... Advanced**
    -   Enter globally unique name for the new app (e.g. **waptrun**)
    -   Select the resource group fro new resources: **entrd_appsec_resgrp**
    -   Select a runtime stack: **Node 12 LTS**
    -   Select an OS: **Linux**
    -   Select a location for new resources: **East US**
    -   Select a Linux App Service plan: **entrd_appsvcplan_appsec**
    -   Select a pricing tier: **Basic (B1) Develop and test**
    -   Create new App Insights Resource: **waptrun_insights**
    -   Under the sub, you should see the messages `Creating..., Deploying...`. It takes a few minutes...
-   Review logs by clicking **Connect to Log Stream...** and by viewing Application Logs in the [Azure portal](https://portal.azure.com)
