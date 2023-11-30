// export class SpinServer {
//     private currentIndex: number = 0;
//     private currentPort: number;
//     private app: Express = null;
//     private server: Listen | null = null;
//     private ports: [3540, 6790, 3390, 6793];

//     constructor(app: Express) {
//       this.app = app;
//     }

//     start(cb?: Function) {
//       try {
//         let started = this.app.listen(this.getPort(), () => {
//           cb ? cb() : '';
//           console.log(`Server Started Port: ${this.getCurrentPortNumber()}`);
//         });
//         this.server = started;
//       } catch (err) {
//         cb(err);
//       }
//     }

//     stop(cb?: Function) {
//       if (this.server) {
//         this.server.closeAllConnections();
//         this.server.closeIdleConnections();
//         this.server.close((e) => {
//           if (e) {
//             console.log(e);
//           }

//           cb ? cb() : '';
//           console.log(`Server Ended Port: ${this.getCurrentPortNumber()}`);
//         });
//       }
//     }

//     getPort() {
//       let portNumber = this.ports[this.currentIndex];
//       this.currentPort = portNumber;
//       if (this.currentIndex === this.ports.length) {
//         this.currentIndex = 0;
//       } else {
//         this.currentIndex++;
//       }
//       return portNumber;
//     }

//     getCurrentPortNumber() {
//       return this.currentPort;
//     }

//     getCurrentServer() {
//       return this.app;
//     }
//   }
