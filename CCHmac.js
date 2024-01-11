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


// [+] --------------------------------------------------------------
// [+] CCHmacAlgorithm: 0x2 --> kCCHmacAlgSHA256
// [+] key: c38f8f17
// [+] data: e3d4eab9779bc45ac76559105df3b6c30e359767d2b9a9bfcdceb8a0ae1826c3216294516426232.4.1fdiICkm4OzADHNer4O4i0wQkGi5uFeDeOo3Y2oUE8X627jdRkhwCkqey4uS4snZooy0/o641Zt2KQ9dpKRIYHPVTptuVaOpn2VKeskkJVZulDJ9x0usWUH6qEJif5lc3nr1TnvN6FavHk8+c2FhoyhGm3dnT159XGiGENbeAGU0=
//             0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F  0123456789ABCDEF
// 16fab0e70  10 3e 55 df 70 99 c2 f8 4b 93 7e 0f 26 50 6d 7b  .>U.p...K.~.&Pm{
// 16fab0e80  1e c6 ae 70 e0 6e cb 12 76 4e 6d 9a 0e 71 1c e2  ...p.n..vNm..q..
// [+] CCHmac Hash: 103e55df7099c2f84b937e0f26506d7b1ec6ae70e06ecb12764e6d9a0e711ce2
// [-] --------------------------------------------------------------
var ArgPtr = null;
var AlgorithmCount;
// void CCHmac(CCHmacAlgorithm algorithm, const void *key, size_t keyLength, const void *data, size_t dataLength, void *macOut);
Interceptor.attach(Module.findExportByName('libcommonCrypto.dylib', 'CCHmac'), {
    onEnter: function (args) {
        console.log("[+] --------------------------------------------------------------");
        // LOG("[+] args[0]: " + args[0], { c: Color.Gray });
        if (args[0] == 0x0) { console.log("[+] CCHmacAlgorithm: " + args[0] + " --> kCCHmacAlgSHA1"); AlgorithmCount = 40; }
        if (args[0] == 0x1) { console.log("[+] CCHmacAlgorithm: " + args[0] + " --> kCCHmacAlgMD5"); AlgorithmCount = 32; }
        if (args[0] == 0x2) { console.log("[+] CCHmacAlgorithm: " + args[0] + " --> kCCHmacAlgSHA256"); AlgorithmCount = 64; }
        try {
            LOG("[+] key: " + Memory.readUtf8String(args[1], args[2].toInt32()), { c: Color.Gray });
        } catch (e) {
            console.log(hexdump(args[1], {
                length: args[2].toInt32(),  // keyLength
                header: true,
                ansi: true
            }))
        }

        try {
            LOG("[+] data: " + Memory.readUtf8String(args[3], args[4].toInt32()), { c: Color.Gray });
        } catch (e) {
            console.log(hexdump(args[3], {
                length: args[4].toInt32(),  // dataLength
                header: true,
                ansi: true
            }))
        }

        ArgPtr = args[5];
        // console.log('\tACCURATE Backtrace:\n\t' + Thread.backtrace(this.context,Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n\t'));
    },

    onLeave: function (retval) {
        // retval == args[2]
        console.log(hexdump(ArgPtr, {
            length: AlgorithmCount / 2,
            header: true,
            ansi: true
        }))

        var ByteArray = Memory.readByteArray(ArgPtr, AlgorithmCount / 2);
        var uint8Array = new Uint8Array(ByteArray);

        var str = "";
        for (var i = 0; i < uint8Array.length; i++) {
            var hextemp = (uint8Array[i].toString(16))
            if (hextemp.length == 1) {
                hextemp = "0" + hextemp
            }
            str += hextemp;
        }
        LOG("[+] CCHmac Hash: " + str, { c: Color.Cyan });

        console.log("[-] --------------------------------------------------------------\n");
    }
});