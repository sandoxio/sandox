<p align="center">
<img src="https://github-production-user-asset-6210df.s3.amazonaws.com/130372146/279723964-56be4efe-9203-40bc-8116-ed0464f069ed.jpg" />
</p>


SanDOx is an integrated development environment that is thought to leverage Polkadot development process by providing ecosystem developers with right and convenient components and tools.

![Sandox ide pic](https://user-images.githubusercontent.com/130372146/234008638-f55a3bde-3482-41c5-9b40-6828128ee33d.png)

Currently SanDOx IDE is under construction and is supposed to have a built-in base list of tool panels with an ability to add personal panels in the form of plug-ins (plug-ins support is under development now).

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

3) Run the application `build` command from the project root:

    `./cmd/build.sh`

The compiled project will be in a `/dist` directory

You can run the application using any http server, such as `http-server` or `nginx`.

Example: 

   `http-server dist/`

## Usage

Sandox allows you to develop applications in Javascript. Ide supports es6 modules, you can include them in your project using imports.

The SanDOx IDE already supports Polkadot libraries that you can import and use to interact with a blockchain.

Examples are fairly trivial, but they are intentionally kept simple to show the modules clearly.
In this example, we have the following file structure:

```
   app.js
   src/
      blockchain.js
```

1)   `app.js` - the main script of the application, which is always running during the build

```import {} from "./src/blockchain.js";```

2)   `src/blockchain.js` - for connecting Polkadot modules

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

Here's short demo videos, that show current progress on the project:  

The SanDOx IDE app skeleton with some basic features:  
[![ms1 preview](http://i3.ytimg.com/vi/42MsyZh1HRg/hqdefault.jpg)](https://youtu.be/42MsyZh1HRg)

“Project” panel and compiling feature:  
[![2 Demo video](https://img.youtube.com/vi/jkzKwSGnxCg/hqdefault.jpg)](https://youtu.be/jkzKwSGnxCg)

Themes, settings and project local storage:  
[![3 Demo video](http://i3.ytimg.com/vi/feuukkLKpY0/hqdefault.jpg)](https://youtu.be/feuukkLKpY0)
