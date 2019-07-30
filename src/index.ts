import * as HID from 'node-hid';
import * as ref from 'ref';
import StructType from 'ref-struct';

// define the "timeval" struct type
let U2FHID_INIT_RESPONSE = StructType({
    channelID : ref.types.uint,
    cmd : ref.types.uchar,
    cmd2 : ref.types.uchar,
    bcnt : ref.types.short,
    nonce: ref.types.uint64,
    cid : ref.types.uint,		// Channel identifier  
    versionInterface : ref.types.uchar,	// Interface version
    versionMajor : ref.types.uchar,	// Major version number
    versionMinor : ref.types.uchar,	// Minor version number
    versionBuild : ref.types.uchar,	// Build version number
    capFlags : ref.types.uchar		// Capabilities flags      
})


class uDevice {
    device: any;

    constructor() {
        this.device = new HID.HID(4292,35535);
        this.device.on("data", this.showResponse);
    }

    showResponse(data: any) {
        console.log("data happened x:");
        console.log(data);

        let x = ref.get(data, 0, U2FHID_INIT_RESPONSE);
        //@ts-ignore
        let p : U2FHID_INIT_RESPONSE = (x as U2FHID_INIT_RESPONSE);
        console.log("------");
        console.log("channelID: " + p.channelID.toString(16));
        console.log("cmd: " + p.cmd.toString(16));
        console.log("bcnt: " + p.bcnt.toString(16) + ' / ' + p.bcnt);
        console.log("nonce: " + p.nonce.toString(16));        
        console.log("cid : " +  p.cid.toString(16));
        console.log("versionInterface : " +  p.versionInterface.toString(16));
        console.log("versionMajor : " +  p.versionMajor.toString(16));
        console.log("versionMinor : " +  p.versionMinor.toString(16));
        console.log("versionBuild : " +  p.versionBuild.toString(16));
        console.log("capFlags : " +  p.capFlags.toString(16));
    }

    getChannelID() {
        this.device.write([0xff,0xff,0xff,0xff,0xff,0x86,0x00,0x08,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01]);
        // this.device.write([0xff,0xff,0xff,0xff,0xff,0x86,0x00,0x08,0x05,0xb6,0xe8,0xb0,0x83,0x9c,0x47,0x83]);
        
    }
}


let d = new uDevice();
d.getChannelID();

function alertFunc() {
    console.log('done');
}

setTimeout(alertFunc, 3000);



