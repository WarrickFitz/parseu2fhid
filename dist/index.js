"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var p_event_1 = __importDefault(require("p-event"));
var crypto_1 = __importDefault(require("crypto"));
var events_1 = require("events");
var string_decoder_1 = require("string_decoder");
var uDevice = /** @class */ (function (_super) {
    __extends(uDevice, _super);
    function uDevice() {
        var _this = _super.call(this) || this;
        _this.initResponse = { broadcastChannelID: -1, cmd: -1, bcnt: -1, nonce: Buffer.allocUnsafe(8).fill('!'), channelID: -1, versionInterface: -1, versionMajor: -1, versionMinor: -1, versionBuild: -1, capFlags: -1 };
        _this.reportSize = 64;
        _this.packetBuf = Buffer.allocUnsafe(_this.reportSize).fill('!');
        _this.device = new HID.HID(4292, 35535);
        _this.handleInitResponse = _this.handleInitResponse.bind(_this);
        _this.handleMsgResponse = _this.handleMsgResponse.bind(_this);
        _this.printInitResponseData = _this.printInitResponseData.bind(_this);
        _this.msg = _this.msg.bind(_this);
        return _this;
    }
    uDevice.prototype.handleInitResponse = function (data) {
        this.initResponse.broadcastChannelID = data.readUInt32BE(0);
        this.initResponse.cmd = data.readUInt8(4);
        this.initResponse.bcnt = data.readUInt16BE(5);
        data.copy(this.initResponse.nonce, 0, 7);
        var remainingData = data.slice(7);
        this.initResponse.channelID = remainingData.readUInt32BE(8);
        this.initResponse.versionInterface = remainingData.readUInt8(12);
        this.initResponse.versionMajor = remainingData.readUInt8(13);
        this.initResponse.versionMinor = remainingData.readUInt8(14);
        this.initResponse.versionBuild = remainingData.readUInt8(15);
        this.initResponse.capFlags = remainingData.readUInt8(16);
    };
    uDevice.prototype.printInitResponseData = function () {
        console.log("------");
        console.log("broadcastChannelID: " + this.initResponse.broadcastChannelID.toString(16));
        console.log("cmd: " + this.initResponse.cmd.toString(16));
        console.log("bcnt: " + this.initResponse.bcnt.toString(16) + ' / ' + this.initResponse.bcnt);
        console.log("nonce: " + this.initResponse.nonce.toString('hex'));
        console.log("channelID : " + this.initResponse.channelID.toString(16));
        console.log("versionInterface : " + this.initResponse.versionInterface.toString(16));
        console.log("versionMajor : " + this.initResponse.versionMajor.toString(16));
        console.log("versionMinor : " + this.initResponse.versionMinor.toString(16));
        console.log("versionBuild : " + this.initResponse.versionBuild.toString(16));
        console.log("capFlags : " + this.initResponse.capFlags.toString(16));
    };
    uDevice.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var windowsChomp, broadcastChannelID, cmd, length, nonce, data, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initResponse.broadcastChannelID !== -1) {
                            // You can only call init once. Calling it again will do nothing. 
                            return [2 /*return*/];
                        }
                        windowsChomp = [0xff];
                        broadcastChannelID = [0xff, 0xff, 0xff, 0xff];
                        cmd = [0x86];
                        length = [0x00, 0x08];
                        nonce = Array.from(crypto_1.default.pseudoRandomBytes(8));
                        // this.device.write([0xff,0xff,0xff,0xff,0xff,0x86,0x00,0x08,0x05,0xb6,0xe8,0xb0,0x83,0x9c,0x47,0x83]);
                        this.device.on("data", this.handleInitResponse);
                        data = windowsChomp.concat(broadcastChannelID).concat(cmd).concat(length).concat(nonce);
                        this.device.write(data);
                        return [4 /*yield*/, p_event_1.default(this.device, 'data')];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    uDevice.prototype.hash = function (buf) {
        return crypto_1.default.createHash('SHA256').update(buf).digest();
    };
    uDevice.prototype.websafeBase64 = function (buf) {
        if (!Buffer.isBuffer(buf))
            buf = Buffer.from(buf);
        return buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
    };
    uDevice.prototype.complete = function () {
        console.log('really done');
    };
    // https://github.com/ashtuchkin/u2f-client/blob/master/lib/u2f-device.js#L43
    uDevice.prototype.msg = function () {
        return __awaiter(this, void 0, void 0, function () {
            var clientData, handle, keyHandle, keyHandleLengthbuf, u2fAuthBuf, U2F_AUTHENTICATE, U2F_AUTH_ENFORCE, ctapBuf, buf, seq, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clientData = JSON.stringify({
                            typ: "navigator.id.getAssertion",
                            challenge: 'req.challenge',
                            origin: 'req.appId'
                        });
                        handle = 'FAAAAIwnkPYAAAAAAAAAAAAAAAAAAAAA';
                        keyHandle = Buffer.alloc(handle.length, handle, 'base64');
                        keyHandleLengthbuf = Buffer.from([keyHandle.length]);
                        u2fAuthBuf = Buffer.concat([this.hash(clientData), this.hash('req.appId'), keyHandleLengthbuf, keyHandle]);
                        U2F_AUTHENTICATE = 0x02;
                        U2F_AUTH_ENFORCE = 0x03;
                        ctapBuf = Buffer.alloc(u2fAuthBuf.length + 7);
                        ctapBuf[0] = 0; // CLA
                        ctapBuf[1] = U2F_AUTHENTICATE; // INS
                        ctapBuf[2] = U2F_AUTH_ENFORCE; // P1
                        ctapBuf[3] = 0; // P2
                        ctapBuf.writeUInt16BE(u2fAuthBuf.length, 4); // LENGTH
                        u2fAuthBuf.copy(ctapBuf, 6);
                        buf = this.packetBuf;
                        buf.fill(0); // Fill the buffer with 0
                        buf.writeUInt8(0xFF, 0); // This byte will get eaten by windows. 
                        buf.writeUInt32BE(this.initResponse.channelID, 1); // The channel ID that was previously selected during the INIT phase. 
                        buf.writeUInt8(0x83, 5); // The MSG command
                        buf.writeUInt16BE(ctapBuf.length, 6); // The data length
                        //data.copy(buf, 7); data = data.slice(buf.length - 7);
                        ctapBuf.copy(buf, 8);
                        ctapBuf = ctapBuf.slice(buf.length - 8);
                        console.log("msg buffer:");
                        console.log(buf);
                        this.device.on("data", this.handleMsgResponse);
                        this.device.write(buf.toJSON().data);
                        seq = 0;
                        while (ctapBuf.length > 0 && seq < 0x80) {
                            buf.fill(0);
                            buf.writeUInt8(0xFF, 0); // This byte will get eaten by windows. 
                            buf.writeUInt32BE(this.initResponse.channelID, 1);
                            buf.writeUInt8(seq++, 5);
                            ctapBuf.copy(buf, 6);
                            ctapBuf = ctapBuf.slice(buf.length - 6);
                            this.device.write(buf.toJSON().data);
                        }
                        if (ctapBuf.length > 0)
                            throw new Error("Tried to send too large data packet to U2F HID device (" + ctapBuf.length + " bytes didn't fit).");
                        console.log("BEFORE AWAIT ......");
                        return [4 /*yield*/, p_event_1.default(this, 'completed')];
                    case 1:
                        result = _a.sent();
                        console.log("result:");
                        console.log(result);
                        console.log("AFTER AWAIT ......");
                        return [2 /*return*/];
                }
            });
        });
    };
    // https://github.com/eosnewyork/MetroFirmware/blob/8ad2cd77eac1588b816427634fbe768d6af0027e/fido2/ctap.c
    uDevice.prototype.handleMsgResponse = function (data) {
        console.log('~~~~~~~~~~~~~ GOT DATA ~~~~~~~~~~');
        console.log(data);
        var cmd = data.readUInt8(4);
        // Is this the 1st packet in the sequence.
        if (cmd & 0x80) {
            console.log('1st packet');
            var channelID = data.readUInt32BE(0);
            // let bcnt = data.readUInt16BE(5);
            var dataLenth = data.readUInt16BE(5);
            this.handleMsgResponseExpectedDataLength = dataLenth - 8;
            console.log("broadcastChannelID:" + channelID.toString(16));
            console.log("cmd:" + cmd.toString(16));
            console.log("bcnt:" + dataLenth.toString(16));
            var res = data.slice(7, 7 + dataLenth);
            console.log("res:");
            console.log(res);
            //let remainingData = res.slice(6, -2)
            var remainingData = res.slice(6);
            console.log("remainingData:");
            console.log(remainingData);
            this.handleMsgResponseBuffer = Buffer.from(remainingData);
        }
        else {
            console.log('continuation packet');
            //Append this buffer to the existing buffer
            var combo = Buffer.concat([this.handleMsgResponseBuffer, data.slice(5)]);
            this.handleMsgResponseBuffer = combo;
        }
        console.log("are we done?:");
        console.log("this.handleMsgResponseBuffer.length:" + this.handleMsgResponseBuffer.length);
        console.log("this.handleMsgResponseExpectedDataLength:" + this.handleMsgResponseExpectedDataLength);
        // The +2 is becasue the data ExpectedDataLength should always have a status code at the end. 
        if (this.handleMsgResponseBuffer.length >= this.handleMsgResponseExpectedDataLength + 2) {
            var status = this.handleMsgResponseBuffer.readUInt16BE(this.handleMsgResponseExpectedDataLength, this.handleMsgResponseBuffer.length - 2);
            this.finalStatusCode = status;
            // console.log("status:" + status.toString(16));            
            //Trim the status info
            this.handleMsgResponseBuffer = this.handleMsgResponseBuffer.slice(0, this.handleMsgResponseExpectedDataLength);
            // Decode APDU frame status
            this.emit('completed', true);
        }
    };
    return uDevice;
}(events_1.EventEmitter));
try {
    var d_1 = new uDevice();
    d_1.init().then(function () {
        d_1.printInitResponseData();
        d_1.msg().then(function () {
            console.log("status:" + d_1.finalStatusCode.toString(16));
            // console.log(d.handleMsgResponseBuffer.toJSON());
            console.log(d_1.handleMsgResponseExpectedDataLength);
            console.log(d_1.handleMsgResponseBuffer.length);
            var decoder = new string_decoder_1.StringDecoder('utf8');
            console.log(decoder.write(d_1.handleMsgResponseBuffer));
            console.log("Done.");
            process.exit(1);
        });
    });
}
catch (error) {
    console.log("Error." + error);
}
