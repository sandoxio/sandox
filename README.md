# Sandox

SanDOx is an integrated development environment, that is thought to leverage Polkadot development process by providing ecosystem developers with right and convenient components and tools.

![Sandox ide pic](https://user-images.githubusercontent.com/130372146/234008638-f55a3bde-3482-41c5-9b40-6828128ee33d.png)

SanDOx IDE is supposed to have a built-in base list of tool panels with an ability to add personal panels in the form of plug-ins.

Supposed base list of panels:
Project – shows project structure with catalogues and files.
Console –displays results of the user’s code, “console” native object methods (log, warn, info, etc.)
Network – network choice and connection. A user could switch between Polkadot ecosystem parachains, connection code will be generated automatically.
Examples – examples library. Will include different case examples, which could be imported and run.
Find – search panel. Allows search of documents in a project and make multi autocorrect.
Personal panels – user defined and customized.


# How To
## Build

1) Rollup is used to build the application. This needs to be installed if you don't have it (https://rollupjs.org/introduction/#installation)

2) Install required project dependencies:

    `npm i`

3) Run the application build command from the project root:

    `./cmd/build.sh`

The compiled project will be in the directory `/dist`

You can run the application using any http server, such as `http-server` or `nginx`.

Example: 

   `http-server dist/`

## Usage

Sandox allows you to develop applications in Javascript. Ide supports es6 modules, you can include them in your project through imports.

The IDE already includes support for polkadot libraries that you can import and use to interact with the blockchain.

The examples are fairly trivial, but they are intentionally kept simple to show the modules clearly.
In this example, we have the following file structure:

```
   app.js
   src/
      blockchain.js
```

   `app.js` - the main script of the application, which is always run during the build

   `src/blockchain.js` - a module will be located that will itself use the polkadot modules

```
import {ApiPromise, WsProvider} from '@polkadot/api';
import {cryptoWaitReady} from '@polkadot/util-crypto';


cryptoWaitReady().then(async () => {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider }); 

    const chain = await api.rpc.system.chain();
    console.log('You are connected to chain ' + chain);
});
```

In this example, `app.js` will include the `src/blockchain.js` module, which will connect to the blockchain at `wss://rpc.polkadot.io` and get the name of the network.


## Demo

Here's a short demo video, that shows current progress on the project:
[![ms1 preview](https://github-production-user-asset-6210df.s3.amazonaws.com/130372146/252937788-b9df91d2-b65d-4b62-b988-39c2d12b704f.jpg)](https://youtu.be/42MsyZh1HRg)
