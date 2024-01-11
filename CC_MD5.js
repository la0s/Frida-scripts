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
// [+] args[0]: 067647E3-757D-46D2-A4E8-43FE592FE0510cb2f3c73b7ba030fcd7170f9cbf92055483c392
//             0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F  0123456789ABCDEF
// 16d982538  f1 ca 1c 38 14 76 7d 37 b8 44 53 e2 f4 a7 55 f9  ...8.v}7.DS...U.
// 16d982548  61 00 ca c4 e4 ae 9a 60 c0 c3 d0 83 02 00 00 00  a......`........
//             0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F  0123456789ABCDEF
// 16d982538  f1 ca 1c 38 14 76 7d 37 b8 44 53 e2 f4 a7 55 f9  ...8.v}7.DS...U.
// 16d982548  61 00 ca c4 e4 ae 9a 60 c0 c3 d0 83 02 00 00 00  a......`........
// [+] MD5 Hash: f1ca1c3814767d37b84453e2f4a755f9
// [-] --------------------------------------------------------------
var ArgPtr = null;
Interceptor.attach(Module.findExportByName('libcommonCrypto.dylib', 'CC_MD5'), {
    onEnter: function (args) {
        console.log("[+] --------------------------------------------------------------");
        try {
            LOG("[+] args[0]: " + Memory.readUtf8String(args[0], args[1].toInt32()), { c: Color.Gray });
        } catch (e) {
            console.log(hexdump(args[0], {
                length: args[1].toInt32(),
                header: true,
                ansi: true
            }))
        }

        ArgPtr = args[2];
        // console.log('\tACCURATE Backtrace:\n\t' + Thread.backtrace(this.context,Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n\t'));
    },

    onLeave: function (retval) {
        // retval == args[2]
        console.log(hexdump(ArgPtr, {
            length: 32,
            header: true,
            ansi: true
        }))

        console.log(hexdump(retval, {
            length: 32,
            header: true,
            ansi: true
        }))

        var ByteArray = Memory.readByteArray(ArgPtr, 16);
        var uint8Array = new Uint8Array(ByteArray);

        var str = "";
        for (var i = 0; i < uint8Array.length; i++) {
            var hextemp = (uint8Array[i].toString(16))
            if (hextemp.length == 1) {
                hextemp = "0" + hextemp
            }
            str += hextemp;
        }
        LOG("[+] MD5 Hash: " + str, { c: Color.Cyan });
        console.log("[-] --------------------------------------------------------------\n");
    }
});