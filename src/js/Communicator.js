// #package js/main

class Communicator {

    constructor() {
        this.dbSendTF = this.dbSendTF.bind(this);
    }


    dbSendTF(camera, bumps, volume, vol_id) {

        const xhr = new XMLHttpRequest();
        let paket = {type: "tf", camera: camera, bumps: bumps, volume: volume, time: Date.now(), vol_id: vol_id};

        xhr.open('POST', '../../test.db', true);
        xhr.setRequestHeader( "Content-Type", "application/json" );
        xhr.send(JSON.stringify(paket));

    }

}