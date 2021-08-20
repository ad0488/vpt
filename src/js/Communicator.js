// #package js/main
// #include EventEmitter.js
// #include utils

class Communicator extends EventEmitter {

    constructor(options) {
        super();

        this.toolSendVolume = this.toolSendVolume.bind(this);
        this.toolSendTF = this.toolSendTF.bind(this);
    }

    toolSendVolume(volume) {

        const xhr = new XMLHttpRequest();
        let paket = {type: 'vol', volume: volume};
        xhr.open('POST', 'test.py');
        xhr.setRequestHeader( "Content-Type", "application/json" );
        xhr.send(JSON.stringify(paket));

        // console.log('Pošiljam volume' + JSON.stringify(paket));
    }

    toolSendTF(bumps, callback) {

        const xhr = new XMLHttpRequest();
        let paket = {type: 'tf', bumps: bumps};
        xhr.open('POST', 'test.py', true);
        xhr.setRequestHeader( "Content-Type", "application/json" );

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                // console.log(xhr.responseText);
                // SEND ME SOMEWHERE NICE

                callback(xhr.responseText);

                // const event = new CustomEvent('pcb');
                // this.dispatchEvent(event);
            }
        }

        xhr.send(JSON.stringify(paket));

    }

}