"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var HID = __importStar(require("node-hid"));
var ref = __importStar(require("ref"));
var ref_struct_1 = __importDefault(require("ref-struct"));
// define the "timeval" struct type
var U2FHID_INIT_RESPONSE = ref_struct_1.default({
    channelID: ref.types.uint,
    cmd: ref.types.uchar,
    cmd2: ref.types.uchar,
    bcnt: ref.types.short,
    nonce: ref.types.uint64,
    cid: ref.types.uint,
    versionInterface: ref.types.uchar,
    versionMajor: ref.types.uchar,
    versionMinor: ref.types.uchar,
    versionBuild: ref.types.uchar,
    capFlags: ref.types.uchar // Capabilities flags      
});
var uDevice = /** @class */ (function () {
    function uDevice() {
        this.device = new HID.HID(4292, 35535);
        this.device.on("data", this.showResponse);
    }
    uDevice.prototype.showResponse = function (data) {
        console.log("data happened x:");
        console.log(data);
        var x = ref.get(data, 0, U2FHID_INIT_RESPONSE);
        //@ts-ignore
        var p = x;
        console.log("------");
        console.log("channelID: " + p.channelID.toString(16));
        console.log("cmd: " + p.cmd.toString(16));
        console.log("bcnt: " + p.bcnt.toString(16) + ' / ' + p.bcnt);
        console.log("nonce: " + p.nonce.toString(16));
        console.log("cid : " + p.cid.toString(16));
        console.log("versionInterface : " + p.versionInterface.toString(16));
        console.log("versionMajor : " + p.versionMajor.toString(16));
        console.log("versionMinor : " + p.versionMinor.toString(16));
        console.log("versionBuild : " + p.versionBuild.toString(16));
        console.log("capFlags : " + p.capFlags.toString(16));
    };
    uDevice.prototype.getChannelID = function () {
        this.device.write([0xff, 0xff, 0xff, 0xff, 0xff, 0x86, 0x00, 0x08, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01]);
        // this.device.write([0xff,0xff,0xff,0xff,0xff,0x86,0x00,0x08,0x05,0xb6,0xe8,0xb0,0x83,0x9c,0x47,0x83]);
    };
    return uDevice;
}());
var d = new uDevice();
d.getChannelID();
function alertFunc() {
    console.log('done');
}
setTimeout(alertFunc, 3000);
