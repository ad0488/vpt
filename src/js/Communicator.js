// #package js/main

class Communicator {

    constructor() {
        this.dbSendTF = this.dbSendTF.bind(this);
    }

    /*
    dbSendTF() {
        const xhr = new XMLHttpRequest();
        let paket = {type: "tf", camera: RenderingContext.getTransformationMatrix(), bumps: _bumps, time: Date.now()};
        // this.rc._gl.getExtension('WEBGL_lose_context');

        xhr.open('POST', "test.db", true);
        xhr.setRequestHeader( "Content-Type", "application/json" );
        xhr.send(JSON.stringify(paket));
        console.log("SEND")
    }
    */
}