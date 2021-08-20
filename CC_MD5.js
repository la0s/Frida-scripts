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


// [+] args[0]: MGCopyAnswerInternalBuild
//             0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F  0123456789ABCDEF
// 16b364020  2c 12 5f c0 e1 33 13 14 71 ce 50 27 4a e2 3b 7a  ,._..3..q.P'J.;z
// 16b364030  b0 52 40 0d 01 00 00 00 4c 00 7a 02 f1 9b 0b 83  .R@.....L.z.....
//             0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F  0123456789ABCDEF
// 16b364020  2c 12 5f c0 e1 33 13 14 71 ce 50 27 4a e2 3b 7a  ,._..3..q.P'J.;z
// 16b364030  b0 52 40 0d 01 00 00 00 4c 00 7a 02 f1 9b 0b 83  .R@.....L.z.....
// [+] MD5 Hash: 2c125fc0e133131471ce50274ae23b7a
var ArgPtr = null;
Interceptor.attach(Module.findExportByName('libcommonCrypto.dylib', 'CC_MD5'), {
    onEnter: function(args) {
        try {
            LOG("[+] args[0]: " + Memory.readUtf8String(args[0], args[1].toInt32()), { c: Color.Gray });
        } catch(e) {
            console.log(hexdump(args[0], {
                length: args[1].toInt32(),
                header: true,
                ansi: true
            }))
        }  

        ArgPtr = args[2];
        // console.log('\tACCURATE Backtrace:\n\t' + Thread.backtrace(this.context,Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n\t'));
    },
  
    onLeave: function(retval) {
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
        for(var i = 0; i < uint8Array.length; i++) {
            var hextemp = (uint8Array[i].toString(16))
            str += hextemp;
        }
        LOG("[+] MD5 Hash: " + str, { c: Color.Cyan }); 
    }
});