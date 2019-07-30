import * as HID from 'node-hid';
import pEvent from 'p-event';
import crypto from 'crypto';
import { exists } from 'fs';

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

class uDevice {
    device: any;
    initResponse : U2FHID_INIT_RESPONSE = { broadcastChannelID: -1, cmd: -1,bcnt :  -1, nonce:  Buffer.allocUnsafe(8).fill('!'), channelID: -1, versionInterface: -1, versionMajor: -1, versionMinor: -1, versionBuild: -1, capFlags: -1  } ;

    constructor() {
        this.device = new HID.HID(4292,35535);

        this.handleInitResponse = this.handleInitResponse.bind(this);
        this.printInitResponseData = this.printInitResponseData.bind(this);
        this.device.on("data", this.handleInitResponse);
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
        //TODO: Remember to add an OS test here
        const windowsChomp = [0xff]; //Windows eats the 1st byte
        const broadcastChannelID = [0xff,0xff,0xff,0xff]; // FFFFFFFF is the broadcast address 
        const cmd = [0x86]; // 0x06 is the INIT command with the 7th bit set 
        const length = [0x00,0x08]; // Will always send an 8 byte nonce
        // const nonce = [0x05,0xb6,0xe8,0xb0,0x83,0x9c,0x47,0x83];       
        let nonce : number[] = Array.from(crypto.pseudoRandomBytes(8));
        // this.device.write([0xff,0xff,0xff,0xff,0xff,0x86,0x00,0x08,0x05,0xb6,0xe8,0xb0,0x83,0x9c,0x47,0x83]);

        this.device.write(windowsChomp.concat(broadcastChannelID).concat(cmd).concat(length).concat(nonce));
        const result = await pEvent(this.device, 'data');
    }

}


let d = new uDevice();
d.init().then(() => {
    d.printInitResponseData();
    console.log("Done.");
    process.exit(1);
})

