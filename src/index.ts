import * as HID from 'node-hid';
import pEvent from 'p-event';
import crypto from 'crypto';
import {EventEmitter} from  'events';
import {StringDecoder} from 'string_decoder'

interface U2FHID_INIT_RESPONSE {
    broadcastChannelID : number;
    cmd  : number;
    bcnt : number;
    nonce : Buffer;
    channelID : number;
    versionInterface : number;
    versionMajor : number;
    versionMinor : number;
    versionBuild : number;
    capFlags : number;
}

class uDevice extends EventEmitter{
    device: any;
    initResponse : U2FHID_INIT_RESPONSE = { broadcastChannelID: -1, cmd: -1,bcnt :  -1, nonce:  Buffer.allocUnsafe(8).fill('!'), channelID: -1, versionInterface: -1, versionMajor: -1, versionMinor: -1, versionBuild: -1, capFlags: -1  } ;
    reportSize = 64;
    packetBuf = Buffer.allocUnsafe(this.reportSize).fill('!');
    finalStatusCode: any;
    handleMsgResponseExpectedDataLength: any;
    handleMsgResponseBuffer: any;

    constructor() {
        super();
        this.device = new HID.HID(4292,35535);

        this.handleInitResponse = this.handleInitResponse.bind(this);
        this.handleMsgResponse = this.handleMsgResponse.bind(this);

        this.printInitResponseData = this.printInitResponseData.bind(this);
        this.msg = this.msg.bind(this);
        
    }

    handleInitResponse(data: Buffer) {
        this.initResponse.broadcastChannelID = data.readUInt32BE(0);
        this.initResponse.cmd = data.readUInt8(4);
        this.initResponse.bcnt = data.readUInt16BE(5);

        data.copy(this.initResponse.nonce, 0, 7);

        let remainingData = data.slice(7);
        this.initResponse.channelID = remainingData.readUInt32BE(8);
        this.initResponse.versionInterface = remainingData.readUInt8(12);
        this.initResponse.versionMajor = remainingData.readUInt8(13);
        this.initResponse.versionMinor = remainingData.readUInt8(14);
        this.initResponse.versionBuild = remainingData.readUInt8(15);
        this.initResponse.capFlags = remainingData.readUInt8(16);        
    }



    printInitResponseData() {
        console.log("------");
        console.log("broadcastChannelID: " + this.initResponse.broadcastChannelID.toString(16));
        console.log("cmd: " + this.initResponse.cmd.toString(16));
        console.log("bcnt: " + this.initResponse.bcnt.toString(16) + ' / ' + this.initResponse.bcnt);
        console.log("nonce: " + this.initResponse.nonce.toString('hex'));        
        console.log("channelID : " +  this.initResponse.channelID.toString(16));
        console.log("versionInterface : " +  this.initResponse.versionInterface.toString(16));
        console.log("versionMajor : " +  this.initResponse.versionMajor.toString(16));
        console.log("versionMinor : " +  this.initResponse.versionMinor.toString(16));
        console.log("versionBuild : " +  this.initResponse.versionBuild.toString(16));
        console.log("capFlags : " +  this.initResponse.capFlags.toString(16));
    }


    async init() {

        if(this.initResponse.broadcastChannelID !== -1) {
            // You can only call init once. Calling it again will do nothing. 
            return;
        }

        //TODO: Remember to add an OS test here
        const windowsChomp = [0xff]; //Windows eats the 1st byte
        const broadcastChannelID = [0xff,0xff,0xff,0xff]; // FFFFFFFF is the broadcast address 
        const cmd = [0x86]; // 0x06 is the INIT command with the 7th bit set 
        const length = [0x00,0x08]; // Will always send an 8 byte nonce
        // const nonce = [0x05,0xb6,0xe8,0xb0,0x83,0x9c,0x47,0x83];       
        let nonce : number[] = Array.from(crypto.pseudoRandomBytes(8));
        // this.device.write([0xff,0xff,0xff,0xff,0xff,0x86,0x00,0x08,0x05,0xb6,0xe8,0xb0,0x83,0x9c,0x47,0x83]);

        this.device.on("data", this.handleInitResponse);
        const data = windowsChomp.concat(broadcastChannelID).concat(cmd).concat(length).concat(nonce);
        this.device.write(data);
        const result = await pEvent(this.device, 'data');
    }


    hash(buf: any) {
        return crypto.createHash('SHA256').update(buf).digest();
    }

    websafeBase64(buf: any) {
        if (!Buffer.isBuffer(buf))
            buf = Buffer.from(buf);
        return buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-').replace(/=/g, '');
    }

    complete() {
        console.log('really done');
    }

    // https://github.com/ashtuchkin/u2f-client/blob/master/lib/u2f-device.js#L43
    async msg() {

        // --------------------------------------------
        // This portion generates the CTAP buffer

        // https://github.com/ashtuchkin/u2f-client/blob/master/lib/u2f-device.js#L136
        var clientData = JSON.stringify({
            typ: "navigator.id.getAssertion",
            challenge: 'req.challenge',
            origin: 'req.appId'
        });

        let handle = 'FAAAAIwnkPYAAAAAAAAAAAAAAAAAAAAA'; //version
        // let handle = 'EgEAAIwnkPYAAAAAAAAAAAAAAAAAAAAA'; //reties
        // let handle = 'FgAAAIwnkPYC55kY3hXSzc-YwPr1weBs'; //sign
        // let handle = 'FwAAAIwnkPYAAAAAAAAAAAAAAAAAAAAA'; //is pin set
        
        var keyHandle = Buffer.alloc(handle.length, handle, 'base64');
        const keyHandleLengthbuf = Buffer.from([keyHandle.length]); 
        var u2fAuthBuf = Buffer.concat([this.hash(clientData), this.hash('req.appId'), keyHandleLengthbuf, keyHandle]);

        const U2F_AUTHENTICATE = 0x02;
        const U2F_AUTH_ENFORCE = 0x03;

        // Create APDU Request frame
        var ctapBuf = Buffer.alloc(u2fAuthBuf.length+7);
        ctapBuf[0] = 0; // CLA
        ctapBuf[1] = U2F_AUTHENTICATE; // INS
        ctapBuf[2] = U2F_AUTH_ENFORCE; // P1
        ctapBuf[3] = 0; // P2
        ctapBuf.writeUInt16BE(u2fAuthBuf.length, 4); // LENGTH
        u2fAuthBuf.copy(ctapBuf, 6);
       
        // --------------------------------------------
        // This portion generates the U2F HID buffer and then appends the CTAP buffer

        
        // https://github.com/ashtuchkin/u2f-client/blob/master/lib/u2f-hid-device.js
        let buf = this.packetBuf;
        buf.fill(0); // Fill the buffer with 0
        buf.writeUInt8(0xFF, 0); // This byte will get eaten by windows. 
        buf.writeUInt32BE(this.initResponse.channelID, 1); // The channel ID that was previously selected during the INIT phase. 
        buf.writeUInt8(0x83, 5); // The MSG command
        buf.writeUInt16BE(ctapBuf.length, 6); // The data length
        //data.copy(buf, 7); data = data.slice(buf.length - 7);
        ctapBuf.copy(buf, 8); ctapBuf = ctapBuf.slice(buf.length - 8);

        console.log("msg buffer:");
        console.log(buf);

        this.device.on("data", this.handleMsgResponse);
        this.device.write(buf.toJSON().data);

        // Create & send continuation packets.
        var seq = 0;
        while (ctapBuf.length > 0 && seq < 0x80) { 
            buf.fill(0);
            buf.writeUInt8(0xFF, 0); // This byte will get eaten by windows. 
            buf.writeUInt32BE(this.initResponse.channelID, 1);
            buf.writeUInt8(seq++, 5);
            ctapBuf.copy(buf, 6); ctapBuf = ctapBuf.slice(buf.length - 6);
            this.device.write(buf.toJSON().data);
        }

        if (ctapBuf.length > 0)
            throw new Error("Tried to send too large data packet to U2F HID device ("+ctapBuf.length+" bytes didn't fit).");
    
        console.log("BEFORE AWAIT ......");
        // const result = await pEvent(this.device, 'data');
        const result = await pEvent(this, 'completed');
        console.log("result:");
        console.log(result);
        console.log("AFTER AWAIT ......");


    }

    
    // https://github.com/eosnewyork/MetroFirmware/blob/8ad2cd77eac1588b816427634fbe768d6af0027e/fido2/ctap.c
    handleMsgResponse(data: Buffer)  {
        console.log('~~~~~~~~~~~~~ GOT DATA ~~~~~~~~~~')
        console.log(data);
        let cmd = data.readUInt8(4);
        
        // Is this the 1st packet in the sequence.
        if (cmd & 0x80) {
            console.log('1st packet');

            let channelID = data.readUInt32BE(0);
            // let bcnt = data.readUInt16BE(5);
            let dataLenth = data.readUInt16BE(5);
            this.handleMsgResponseExpectedDataLength = dataLenth-8;
    
            console.log("broadcastChannelID:"+channelID.toString(16));
            console.log("cmd:"+cmd.toString(16));
            console.log("bcnt:"+dataLenth.toString(16));
           
            let res = data.slice(7,7+dataLenth);
            console.log("res:");
            console.log(res);        
            
            //let remainingData = res.slice(6, -2)
            let remainingData = res.slice(6)
            console.log("remainingData:");
            console.log(remainingData);

            this.handleMsgResponseBuffer = Buffer.from(remainingData);

            
        } else {            
            console.log('continuation packet');
            
            //Append this buffer to the existing buffer
            let combo = Buffer.concat([this.handleMsgResponseBuffer, data.slice(5)]);
            this.handleMsgResponseBuffer = combo;

           
        }

        console.log("are we done?:");
        console.log("this.handleMsgResponseBuffer.length:" + this.handleMsgResponseBuffer.length);
        console.log("this.handleMsgResponseExpectedDataLength:"+this.handleMsgResponseExpectedDataLength);

        // The +2 is becasue the data ExpectedDataLength should always have a status code at the end. 
        if(this.handleMsgResponseBuffer.length >= this.handleMsgResponseExpectedDataLength+2) {

            var status = this.handleMsgResponseBuffer.readUInt16BE(this.handleMsgResponseExpectedDataLength, this.handleMsgResponseBuffer.length-2);
            this.finalStatusCode = status;

            // console.log("status:" + status.toString(16));            

            //Trim the status info
            this.handleMsgResponseBuffer = this.handleMsgResponseBuffer.slice(0,this.handleMsgResponseExpectedDataLength);

            // Decode APDU frame status
            this.emit('completed', true);
        }

        // Decode APDU frame status
        // var status = res.readUInt16BE(res.length-2);
        // console.log("status:" + status.toString(16));

        // this.finalStatusCode = status;

        // const resultBuf = Buffer.alloc(remainingData.length);
        // console.log(resultBuf);

        // var ver = new TextDecoder("utf-8").decode(data);
        // const decoder = new StringDecoder('utf8');

        //const ver = Buffer.from(data);
        // console.log(decoder.write(remainingData));
        // this.emit('completed', true);

    }

}

try {

    
    let d = new uDevice();
    d.init().then(() => {
        d.printInitResponseData();
        d.msg().then(() => {
            console.log("status:" + d.finalStatusCode.toString(16));
            // console.log(d.handleMsgResponseBuffer.toJSON());
            console.log(d.handleMsgResponseExpectedDataLength);
            console.log(d.handleMsgResponseBuffer.length);

            const decoder = new StringDecoder('utf8');
            console.log(decoder.write(d.handleMsgResponseBuffer));

            
            console.log("Done.");
            process.exit(1);
   
        });
    })
} catch(error) {
    console.log("Error." + error);
}


