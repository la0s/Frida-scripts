// color着色
var Color = {
    RESET: "\x1b[39;49;00m", Black: "0;01", Blue: "4;01", Cyan: "6;01", Gray: "7;01", Green: "2;01", Purple: "5;01", Red: "1;01", Yellow: "3;01",
    Light: {
        Black: "0;11", Blue: "4;11", Cyan: "6;11", Gray: "7;01", Green: "2;11", Purple: "5;11", Red: "1;11", Yellow: "3;11"
    }
};

var LOG = function (input, kwargs) {
    kwargs = kwargs || {};
    var logLevel = kwargs['l'] || 'log', colorPrefix = '\x1b[3', colorSuffix = 'm';
    if (typeof input === 'object')
        input = JSON.stringify(input, null, kwargs['i'] ? 2 : null);
    if (kwargs['c'])
        input = colorPrefix + kwargs['c'] + colorSuffix + input + Color.RESET;
    console[logLevel](input);
};


function base64encode(str) {
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}

function bin2string(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += (String.fromCharCode(array[i]));
    }
    return result;
}


Interceptor.attach(Module.findExportByName('libcommonCrypto.dylib', 'CCCrypt'), {
    onEnter: function (args) {
        // Save the arguments
        this.operation = args[0]
        this.CCAlgorithm = args[1]
        this.CCOptions = args[2]
        this.keyBytes = args[3]
        this.keyLength = args[4]
        this.ivBuffer = args[5]
        this.inBuffer = args[6]
        this.inLength = args[7]
        this.outBuffer = args[8]
        this.outLength = args[9]
        this.outCountPtr = args[10]
        console.log("[+] --------------------------------------------------------------");
        // 不要在onLeave回溯堆栈，会产生误报！
        console.log('\tACCURATE Backtrace:\n\t' + Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n\t'));
        // console.log('\tFUZZY Backtrace:\n\t' + Thread.backtrace(this.context,Backtracer.FUZZY).map(DebugSymbol.fromAddress).join('\n\t'));

    },

    onLeave: function (retVal) {
        if (this.operation == 0) {
            // Show the buffers here if this an encryption operation

            // console.log("[+] CCAlgorithm: " + this.CCAlgorithm);
            if (this.CCAlgorithm == 0x0) { console.log("[+] CCAlgorithm: " + this.CCAlgorithm + " --> AES Encrypt"); }
            if (this.CCAlgorithm == 0x1) { console.log("[+] CCAlgorithm: " + this.CCAlgorithm + " --> DES Encrypt"); }
            if (this.CCAlgorithm == 0x2) { console.log("[+] CCAlgorithm: " + this.CCAlgorithm + " --> 3DES Encrypt"); }


            // enum {
            //     /* options for block ciphers */
            //     kCCOptionPKCS7Padding   = 0x0001,
            //     kCCOptionECBMode        = 0x0002
            //     /* stream ciphers currently have no options */
            // };
            // typedef uint32_t CCOptions;
            if (this.CCOptions == 0x0 || this.CCOptions == 0x1) { console.log("[+] CCOptions: " + this.CCOptions + " --> mode CBC"); }
            if (this.CCOptions == 0x2 || this.CCOptions == 0x3) { console.log("[+] CCOptions: " + this.CCOptions + " --> mode ECB"); } // kCCOptionPKCS7Padding | kCCOptionECBMode == 0x03
            // if (this.CCOptions != 0x1 && this.CCOptions != 0x3) {console.log("[+] CCOptions: " + this.CCOptions);}

            console.log(Memory.readByteArray(this.inBuffer, this.inLength.toInt32()));
            try {
                // console.log("[+] Before Encrypt: " + Memory.readUtf8String(this.inBuffer, this.inLength.toInt32()));
                LOG("[+] Before Encrypt: " + Memory.readUtf8String(this.inBuffer, this.inLength.toInt32()), { c: Color.Gray });
            } catch (e) {
                // var ByteArray = Memory.readByteArray(this.inBuffer, this.inLength.toInt32());
                // var uint8Array = new Uint8Array(ByteArray);
                // // console.log("[+] uint8Array: " + uint8Array);

                // var str = "";
                // for(var i = 0; i < uint8Array.length; i++) {
                //     var hextemp = (uint8Array[i].toString(16))
                //     if(hextemp.length == 1){
                //         hextemp = "0" + hextemp
                //     }
                //         str += hextemp + " ";
                // }

                // console.log("[+] Before Encrypt: " + str); // 打印hex,非可见ascii范围
            }

            console.log(Memory.readByteArray(this.keyBytes, this.keyLength.toInt32()));
            if (this.keyLength.toInt32() == 16) { console.log("[+] KEY Length --> 128"); }
            if (this.keyLength.toInt32() == 24) { console.log("[+] KEY Length --> 192"); }
            if (this.keyLength.toInt32() == 32) { console.log("[+] KEY Length --> 256"); }
            try {
                // console.log("[+] KEY: " + Memory.readUtf8String(this.keyBytes, this.keyLength.toInt32()));
                LOG("[+] KEY: " + Memory.readUtf8String(this.keyBytes, this.keyLength.toInt32()), { c: Color.Gray });
            } catch (e) {
                var ByteArray = Memory.readByteArray(this.keyBytes, this.keyLength.toInt32());
                var uint8Array = new Uint8Array(ByteArray);
                // console.log("[+] uint8Array: " + uint8Array);

                var str = "";
                for (var i = 0; i < uint8Array.length; i++) {
                    var hextemp = (uint8Array[i].toString(16))
                    if (hextemp.length == 1) {
                        hextemp = "0" + hextemp
                    }
                    str += hextemp + " ";
                }

                // console.log("[+] KEY: " + str); // 打印hex,非可见ascii范围
                LOG("[+] KEY: " + str, { c: Color.Gray });
            }

            if (this.CCOptions == 0x0 || this.CCOptions == 0x1) {
                console.log(Memory.readByteArray(this.ivBuffer, 16));
                try {
                    // console.log("[+] IV: " + Memory.readUtf8String(this.ivBuffer, this.keyLength.toInt32()));
                    LOG("[+] IV: " + Memory.readUtf8String(this.ivBuffer, 16), { c: Color.Gray });
                } catch (e) {
                    var ByteArray = Memory.readByteArray(this.ivBuffer, 16);
                    var uint8Array = new Uint8Array(ByteArray);

                    var str = "";
                    for (var i = 0; i < uint8Array.length; i++) {
                        var hextemp = (uint8Array[i].toString(16))
                        if (hextemp.length == 1) {
                            hextemp = "0" + hextemp
                        }
                        str += hextemp + " ";
                    }

                    // console.log("[+] IV: " + str); // 打印hex,非可见ascii范围
                    LOG("[+] IV: " + str, { c: Color.Gray });
                }
            }

            // console.log(Memory.readByteArray(this.outBuffer, Memory.readUInt(this.outCountPtr))); // 打印hex,非可见ascii范围
            var array = new Uint8Array(Memory.readByteArray(this.outBuffer, Memory.readUInt(this.outCountPtr)));
            // console.log("[+] After Encrypt: " + base64encode(bin2string(array)));
            LOG("[+] After Encrypt: " + base64encode(bin2string(array)), { c: Color.Gray });

            console.log("[-] --------------------------------------------------------------\n");
        }

        if (this.operation == 1) {
            // Show the buffers here if this a decryption operation

            // console.log("inLength: " + this.inLength.toInt32());
            // console.log("outLength: " + this.outLength.toInt32());
            // console.log("outCount: " + Memory.readUInt(this.outCountPtr)); //实际的outBuffer的有效长度

            // console.log("[+] CCAlgorithm: " + this.CCAlgorithm);
            if (this.CCAlgorithm == 0x0) { console.log("[+] CCAlgorithm: " + this.CCAlgorithm + " --> AES Decrypt"); }
            if (this.CCAlgorithm == 0x1) { console.log("[+] CCAlgorithm: " + this.CCAlgorithm + " --> DES Decrypt"); }
            if (this.CCAlgorithm == 0x2) { console.log("[+] CCAlgorithm: " + this.CCAlgorithm + " --> 3DES Decrypt"); }

            // enum {
            //     /* options for block ciphers */
            //     kCCOptionPKCS7Padding   = 0x0001,
            //     kCCOptionECBMode        = 0x0002
            //     /* stream ciphers currently have no options */
            // };
            // typedef uint32_t CCOptions;
            if (this.CCOptions == 0x0 || this.CCOptions == 0x1) { console.log("[+] CCOptions: " + this.CCOptions + " --> mode CBC"); }
            if (this.CCOptions == 0x2 || this.CCOptions == 0x3) { console.log("[+] CCOptions: " + this.CCOptions + " --> mode ECB"); } // kCCOptionPKCS7Padding | kCCOptionECBMode == 0x03
            // if (this.CCOptions != 0x1 && this.CCOptions != 0x3) {console.log("[+] CCOptions: " + this.CCOptions);}

            var array = new Uint8Array(Memory.readByteArray(this.inBuffer, this.inLength.toInt32()));
            // console.log("[+] Before Decrypt: " + base64encode(bin2string(array)));
            LOG("[+] Before Decrypt: " + base64encode(bin2string(array)), { c: Color.Gray });

            console.log(Memory.readByteArray(this.keyBytes, this.keyLength.toInt32()));
            if (this.keyLength.toInt32() == 16) { console.log("[+] KEY Length --> 128"); }
            if (this.keyLength.toInt32() == 24) { console.log("[+] KEY Length --> 192"); }
            if (this.keyLength.toInt32() == 32) { console.log("[+] KEY Length --> 256"); }
            try {
                // console.log("[+] KEY: " + Memory.readUtf8String(this.keyBytes, this.keyLength.toInt32()));
                LOG("[+] KEY: " + Memory.readUtf8String(this.keyBytes, this.keyLength.toInt32()), { c: Color.Gray });
            } catch (e) {
                var ByteArray = Memory.readByteArray(this.keyBytes, this.keyLength.toInt32());
                var uint8Array = new Uint8Array(ByteArray);
                // console.log("[+] uint8Array: " + uint8Array);

                var str = "";
                for (var i = 0; i < uint8Array.length; i++) {
                    var hextemp = (uint8Array[i].toString(16))
                    if (hextemp.length == 1) {
                        hextemp = "0" + hextemp
                    }
                    str += hextemp + " ";
                }

                // console.log("[+] KEY: " + str); // 打印hex,非可见ascii范围
                LOG("[+] KEY: " + str, { c: Color.Gray });
            }

            if (this.CCOptions == 0x0 || this.CCOptions == 0x1) {
                console.log(Memory.readByteArray(this.ivBuffer, 16));
                try {
                    // console.log("[+] IV: " + Memory.readUtf8String(this.ivBuffer, this.keyLength.toInt32()));
                    LOG("[+] IV: " + Memory.readUtf8String(this.ivBuffer, 16), { c: Color.Gray });
                } catch (e) {
                    var ByteArray = Memory.readByteArray(this.ivBuffer, 16);
                    var uint8Array = new Uint8Array(ByteArray);

                    var str = "";
                    for (var i = 0; i < uint8Array.length; i++) {
                        var hextemp = (uint8Array[i].toString(16))
                        if (hextemp.length == 1) {
                            hextemp = "0" + hextemp
                        }
                        str += hextemp + " ";
                    }

                    // console.log("[+] IV: " + str); // 打印hex,非可见ascii范围
                    LOG("[+] IV: " + str, { c: Color.Gray });
                }
            }

            console.log(Memory.readByteArray(this.outBuffer, Memory.readUInt(this.outCountPtr)));
            try {
                // console.log("[+] After Decrypt: " + Memory.readUtf8String(this.outBuffer, Memory.readUInt(this.outCountPtr)));
                LOG("[+] After Decrypt: " + Memory.readUtf8String(this.outBuffer, Memory.readUInt(this.outCountPtr)), { c: Color.Gray });
            } catch (e) {
                // var ByteArray = Memory.readByteArray(this.outBuffer, Memory.readUInt(this.outCountPtr));
                // var uint8Array = new Uint8Array(ByteArray);
                // // console.log("[+] uint8Array: " + uint8Array);

                // var str = "";
                // for(var i = 0; i < uint8Array.length; i++) {
                //     var hextemp = (uint8Array[i].toString(16))
                //     if(hextemp.length == 1){
                //         hextemp = "0" + hextemp
                //     }
                //         str += hextemp + " ";
                // }

                // console.log("[+] After Decrypt: " + str); // 打印hex,非可见ascii范围
            }

            console.log("[-] --------------------------------------------------------------\n");
        }
    }
})