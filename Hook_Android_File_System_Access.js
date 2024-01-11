Java.perform(function () {

    // ============= Config =============
    // var CONFIG = {
    //     // if TRUE enable data dump 
    //     printEnable: true,
    //     // if TRUE enable libc.so open/read/write hook
    //     printLibc: false,
    //     // if TRUE print the stack trace for each hook
    //     printStackTrace: false,
    //     // to filter the file path whose data want to be dumped in ASCII 
    //     dump_ascii_If_Path_contains: [".log", ".xml", ".prop"],
    //     // to filter the file path whose data want to be NOT dumped in hexdump (useful for big chunk and excessive reads) 
    //     dump_hex_If_Path_NOT_contains: [".png", "/proc/self/task", "/system/lib", "base.apk", "cacert"],
    //     // to filter the file path whose data want to be NOT dumped fron libc read/write (useful for big chunk and excessive reads) 
    //     dump_raw_If_Path_NOT_contains: [".png", "/proc/self/task", "/system/lib", "base.apk", "cacert"]
    // }

    // ============= Keep a trace of file descriptor, path, and so =============
    var TraceFD = {};
    var TraceFS = {};
    var TraceFile = {};
    var TraceSysFD = {};

    // ============= Get classes =============
    var CLASS = {
        File: Java.use("java.io.File"),
        FileInputStream: Java.use("java.io.FileInputStream"),
        FileOutputStream: Java.use("java.io.FileOutputStream"),
        String: Java.use("java.lang.String"),
        FileChannel: Java.use("java.nio.channels.FileChannel"),
        FileDescriptor: Java.use("java.io.FileDescriptor"),
        Thread: Java.use("java.lang.Thread"),
        StackTraceElement: Java.use("java.lang.StackTraceElement"),
        AndroidDbSQLite: Java.use("android.database.sqlite.SQLiteDatabase")
    };
    var File = {
        new: [
            CLASS.File.$init.overload("java.io.File", "java.lang.String"),
            CLASS.File.$init.overload("java.lang.String"),
            CLASS.File.$init.overload("java.lang.String", "java.lang.String"),
            CLASS.File.$init.overload("java.net.URI"),
        ]
    };
    var FileInputStream = {
        new: [
            CLASS.FileInputStream.$init.overload("java.io.File"),
            CLASS.FileInputStream.$init.overload("java.io.FileDescriptor"),
            CLASS.FileInputStream.$init.overload("java.lang.String"),
        ],
        read: [
            CLASS.FileInputStream.read.overload(),
            CLASS.FileInputStream.read.overload("[B"),
            CLASS.FileInputStream.read.overload("[B", "int", "int"),
        ],
    };
    var FileOutputStream = {
        new: [
            CLASS.FileOutputStream.$init.overload("java.io.File"),
            CLASS.FileOutputStream.$init.overload("java.io.File", "boolean"),
            CLASS.FileOutputStream.$init.overload("java.io.FileDescriptor"),
            CLASS.FileOutputStream.$init.overload("java.lang.String"),
            CLASS.FileOutputStream.$init.overload("java.lang.String", "boolean")
        ],
        write: [
            CLASS.FileOutputStream.write.overload("[B"),
            CLASS.FileOutputStream.write.overload("int"),
            CLASS.FileOutputStream.write.overload("[B", "int", "int"),
        ],
    };


    // ============= File类 ============= 
    // CLASS.File.$init.overload("java.lang.String"),
    File.new[1].implementation = function (arg1) {
        console.log("[+] ------------------------------------------------------");
        // prettyLog("[+] [Java.File.new.1] new file: " + arg1);
        console.log("[+] [Java.File.new.1] new file: " + arg1);
        var ret = File.new[1].call(this, arg1);
        var f = Java.cast(this, CLASS.File);
        TraceFile["f" + this.hashCode()] = arg1;
        console.log("[-] ------------------------------------------------------\n");
        return ret;
    }

    // CLASS.File.$init.overload("java.lang.String", "java.lang.String"),
    File.new[2].implementation = function (arg1, arg2) {
        console.log("[+] ------------------------------------------------------");
        // prettyLog("[+] [Java.File.new.2] new file: " + arg1 + "/" + arg2);
        console.log("[+] [Java.File.new.2] new file: " + arg1 + "/" + arg2);
        var ret = File.new[2].call(this, arg1, arg2);;
        var f = Java.cast(this, CLASS.File);
        TraceFile["f" + this.hashCode()] = arg1 + "/" + arg2;
        console.log("[-] ------------------------------------------------------\n");
        return ret;
    }


    // =============== FileInputStream类 ===============
    // CLASS.FileOutputStream.$init.overload("java.io.File"),
    FileInputStream.new[0].implementation = function (arg1) {
        console.log("[+] ------------------------------------------------------");
        var file = Java.cast(arg1, CLASS.File);
        var fname = TraceFile["f" + file.hashCode()];
        if (fname == null) {
            var p = file.getAbsolutePath();
            if (p !== null)
                fname = TraceFile["f" + file.hashCode()] = p;
        }
        if (fname == null)
            fname = "[unknow]"
        // prettyLog("[+] [Java.FileInputStream.new.0] new input stream from file: " + fname);
        console.log("[+] [Java.FileInputStream.new.0] new input stream from file: " + fname);
        var fis = FileInputStream.new[0].call(this, arg1)
        var f = Java.cast(this, CLASS.FileInputStream);
        TraceFS["fd" + this.hashCode()] = fname;
        var fd = Java.cast(this.getFD(), CLASS.FileDescriptor);
        TraceFD["fd" + fd.hashCode()] = fname;
        console.log("[-] ------------------------------------------------------\n");
        return fis;
    }

    // CLASS.FileInputStream.read.overload("[B"),
    FileInputStream.read[1].implementation = function (arg1) {
        console.log("[+] ------------------------------------------------------");
        var fname = TraceFS["fd" + this.hashCode()];
        // console.log("[+] TraceFS: " + JSON.stringify(TraceFS));
        var fd = null;
        if (fname == null) {
            fd = Java.cast(this.getFD(), CLASS.FileDescriptor);
            fname = TraceFD["fd" + fd.hashCode()]
        }
        if (fname == null)
            fname = "[unknow]";
        // prettyLog("[+] [Java.FileInputStream.read.1] Read from file: " + fname + "\n");
        console.log("[+] [Java.FileInputStream.read.1] Read from file: " + fname + "\n");
        console.log("[+] bytes length: " + arg1.length);
        // PrintBytesHex(fname, arg1, arg1.length);
        printStack();
        console.log("[-] ------------------------------------------------------\n");
        return FileInputStream.read[1].call(this, arg1);
    }

    // CLASS.FileInputStream.read.overload("[B", "int", "int"),
    FileInputStream.read[2].implementation = function (arg1, arg2, arg3) {
        console.log("[+] ------------------------------------------------------");
        var fname = TraceFS["fd" + this.hashCode()];
        // console.log("[+] TraceFS: " + JSON.stringify(TraceFS));
        var fd = null;
        if (fname == null) {
            fd = Java.cast(this.getFD(), CLASS.FileDescriptor);
            fname = TraceFD["fd" + fd.hashCode()]
        }
        if (fname == null)
            fname = "[unknow]";
        // prettyLog("[+] [Java.FileInputStream.read.2] read from file: " + fname + " offset: " + arg2 + " len: " + arg3);
        console.log("[+] [Java.FileInputStream.read.2] read from file: " + fname + ", offset: " + arg2 + ", len: " + arg3);
        console.log("[+] arg1.length: " + arg1.length + ", arg3: " + arg3);
        PrintBytesHex(fname, arg1, arg3);
        printStack();
        console.log("[-] ------------------------------------------------------\n");
        return FileInputStream.read[2].call(this, arg1, arg2, arg3);
    }


    // // =============== FileOutputStream类 ===============
    // // CLASS.FileOutputStream.$init.overload("java.io.File"),
    // FileOutputStream.new[0].implementation = function (arg1) {
    //     console.log("[+] ------------------------------------------------------");
    //     var file = Java.cast(arg1, CLASS.File);
    //     var fname = TraceFile["f" + file.hashCode()];
    //     if (fname == null)
    //         fname = "[unknow]<File:" + file.hashCode() + ">";
    //     console.log("[+] [Java.FileOutputStream.new.0] new output stream to file: " + fname);
    //     var fis = FileOutputStream.new[0].call(this, arg1);
    //     TraceFS["fd" + this.hashCode()] = fname;
    //     var fd = Java.cast(this.getFD(), CLASS.FileDescriptor);
    //     TraceFD["fd" + fd.hashCode()] = fname;
    //     console.log("[-] ------------------------------------------------------\n");
    //     return fis;
    // }

    // // CLASS.FileOutputStream.$init.overload("java.io.File", "boolean"),
    // FileOutputStream.new[1].implementation = function (arg1, arg2) {
    //     console.log("[+] ------------------------------------------------------");
    //     var file = Java.cast(arg1, CLASS.File);
    //     var fname = TraceFile["f" + file.hashCode()];
    //     if (fname == null)
    //         fname = "[unknow]";
    //     console.log("[Java.FileOutputStream.new.1] new output stream to file: " + fname + "\n");
    //     var fis = FileOutputStream.new[1].call(this, arg1, arg2);
    //     TraceFS["fd" + this.hashCode()] = fname;
    //     var fd = Java.cast(this.getFD(), CLASS.FileDescriptor);
    //     TraceFD["fd" + fd.hashCode()] = fname;
    //     console.log("[-] ------------------------------------------------------\n");
    //     return fis;
    // }

    // // CLASS.FileOutputStream.$init.overload("java.io.FileDescriptor"),
    // FileOutputStream.new[2].implementation = function (arg1) {
    //     console.log("[+] ------------------------------------------------------");
    //     var fd = Java.cast(arg1, CLASS.FileDescriptor);
    //     var fname = TraceFD["fd" + fd.hashCode()];
    //     if (fname == null)
    //         fname = "[unknow]";
    //     console.log("[Java.FileOutputStream.new.2] new output stream to FileDescriptor: " + fname + "\n");
    //     var fis = FileOutputStream.new[2].call(this, arg1)
    //     TraceFS["fd" + this.hashCode()] = fname;
    //     console.log("[-] ------------------------------------------------------\n");
    //     return fis;
    // }

    // // CLASS.FileOutputStream.$init.overload("java.lang.String"),
    // FileOutputStream.new[3].implementation = function (arg1) {
    //     console.log("[+] ------------------------------------------------------");
    //     console.log("[+] [Java.FileOutputStream.new.3] new output stream to file: " + arg1);
    //     var fis = FileOutputStream.new[3].call(this, arg1)
    //     TraceFS["fd" + this.hashCode()] = arg1;
    //     var fd = Java.cast(this.getFD(), CLASS.FileDescriptor);
    //     TraceFD["fd" + fd.hashCode()] = arg1;
    //     console.log("[-] ------------------------------------------------------\n");
    //     return fis;
    // }

    // // CLASS.FileOutputStream.$init.overload("java.lang.String", "boolean")
    // FileOutputStream.new[4].implementation = function (arg1, arg2) {
    //     console.log("[+] ------------------------------------------------------");
    //     console.log("[Java.FileOutputStream.new.4] new output stream to file: " + arg1 + ", bool: " + arg2 + "\n");
    //     var fis = FileOutputStream.new[4].call(this, arg1, arg2)
    //     TraceFS["fd" + this.hashCode()] = arg1;
    //     var fd = Java.cast(this.getFD(), CLASS.FileDescriptor);
    //     TraceFD["fd" + fd.hashCode()] = arg1;
    //     console.log("[-] ------------------------------------------------------\n");
    //     return fis;
    // }

    // // CLASS.FileOutputStream.write.overload("[B"),
    // FileOutputStream.write[0].implementation = function (arg1) {
    //     console.log("[+] ------------------------------------------------------");
    //     var fname = TraceFS["fd" + this.hashCode()];
    //     var fd = null;
    //     if (fname == null) {
    //         fd = Java.cast(this.getFD(), CLASS.FileDescriptor);
    //         fname = TraceFD["fd" + fd.hashCode()]
    //     }
    //     if (fname == null)
    //         fname = "[unknow]";
    //     console.log("[Java.FileOutputStream.write.0] write byte array: " + fname + "\n");
    //     var hexstr = "";
    //     for (var i = 0; i < arg1.length; i++) {
    //         var b = (arg1[i] >>> 0) & 0xff;
    //         var n = b.toString(16);
    //         hexstr += ("00" + n).slice(-2) + " ";
    //     }
    //     console.log("[+] write bytes: " + hexstr);
    //     console.log("[-] ------------------------------------------------------\n");
    //     return FileOutputStream.write[0].call(this, arg1);
    // }

    // // CLASS.FileOutputStream.write.overload("int"),
    // FileOutputStream.write[1].implementation = function (arg1) {
    //     console.log("[+] ------------------------------------------------------");
    //     var fname = TraceFS["fd" + this.hashCode()];
    //     var fd = null;
    //     if (fname == null) {
    //         fd = Java.cast(this.getFD(), CLASS.FileDescriptor);
    //         fname = TraceFD["fd" + fd.hashCode()]
    //     }
    //     if (fname == null)
    //         fname = "[unknow]";
    //     console.log("[Java.FileOutputStream.write.1] write int: " + fname + " : " + arg1);
    //     console.log("[-] ------------------------------------------------------\n");
    //     return FileOutputStream.write[1].call(this, arg1);
    // }

    // // CLASS.FileOutputStream.write.overload("[B", "int", "int"),
    // FileOutputStream.write[2].implementation = function (arg1, arg2, arg3) {
    //     console.log("[+] ------------------------------------------------------");
    //     var fname = TraceFS["fd" + this.hashCode()];
    //     var fd = null;
    //     if (fname == null) {
    //         fd = Java.cast(this.getFD(), CLASS.FileDescriptor);
    //         fname = TraceFD["fd" + fd.hashCode()]
    //         if (fname == null)
    //             fname = "[unknow], fd=" + this.hashCode();
    //     }
    //     console.log("[Java.FileOutputStream.write.2] write " + arg3 + " bytes from " + arg2 + "  : " + fname + "\n");
    //     var hexstr = "";
    //     for (var i = 0; i < arg1.length; i++) {
    //         var b = (arg1[i] >>> 0) & 0xff;
    //         var n = b.toString(16);
    //         hexstr += ("00" + n).slice(-2) + " ";
    //     }
    //     console.log("[+] write bytes: " + hexstr);
    //     console.log("[-] ------------------------------------------------------\n");
    //     return FileOutputStream.write[2].call(this, arg1, arg2, arg3);
    // }


    // // native hooks    
    // Interceptor.attach(
    //     Module.findExportByName("libc.so", "read"), {
    //     // fd, buff, len
    //     onEnter: function (args) {
    //         if (CONFIG.printLibc === true) {
    //             var bfr = args[1],
    //                 sz = args[2].toInt32();
    //             var path = (TraceSysFD["fd-" + args[0].toInt32()] != null) ? TraceSysFD["fd-" + args[0].toInt32()] : "[unknow path]";

    //             prettyLog("[Libc.read] Read FD (" + path + "," + bfr + "," + sz + ")\n" +
    //                 rawPrint(path, Memory.readByteArray(bfr, sz)));
    //         }
    //     },
    //     onLeave: function (ret) {
    //     }
    // }
    // );

    // Interceptor.attach(
    //     Module.findExportByName("libc.so", "open"), {
    //     // path, flags, mode
    //     onEnter: function (args) {
    //         this.path = Memory.readCString(args[0]);
    //     },
    //     onLeave: function (ret) {
    //         TraceSysFD["fd-" + ret.toInt32()] = this.path;
    //         if (CONFIG.printLibc === true)
    //             prettyLog("[Libc.open] Open file '" + this.path + "' (fd: " + ret.toInt32() + ")");
    //     }
    // }
    // );

    // Interceptor.attach(
    //     Module.findExportByName("libc.so", "write"), {
    //     // fd, buff, count
    //     onEnter: function (args) {
    //         if (CONFIG.printLibc === true) {
    //             var bfr = args[1],
    //                 sz = args[2].toInt32();
    //             var path = (TraceSysFD["fd-" + args[0].toInt32()] != null) ? TraceSysFD["fd-" + args[0].toInt32()] : "[unknow path]";
    //             prettyLog("[Libc.write] Write FD (" + path + "," + bfr + "," + sz + ")\n" +
    //                 rawPrint(path, Memory.readByteArray(bfr, sz)));
    //         }
    //     },
    //     onLeave: function (ret) {
    //     }
    // }
    // );


    // // =============== helper functions ===============
    // function prettyLog(str) {
    //     console.log("------------------------------------------------------\n" + str);
    //     if (CONFIG.printStackTrace === true) {
    //         printStackTrace();
    //     }
    // }

    // function prettyPrint(path, buffer) {
    //     if (CONFIG.printEnable === false) return "";
    //     if (contains(path, CONFIG.dump_ascii_If_Path_contains)) {
    //         return b2s(buffer);
    //     } else if (!contains(path, CONFIG.dump_hex_If_Path_NOT_contains)) {
    //         return hexdump(b2s(buffer));
    //     }
    //     return "[dump skipped by config]";
    // }

    // function rawPrint(path, buffer) {
    //     if (CONFIG.printEnable === false) return "";

    //     if (!contains(path, CONFIG.dump_raw_If_Path_NOT_contains)) {
    //         return hexdump(buffer);
    //     }
    //     return "[dump skipped by config]";
    // }

    // function contains(path, patterns) {
    //     for (var i = 0; i < patterns.length; i++)
    //         if (path.indexOf(patterns[i]) > -1) return true;
    //     return false;
    // }

    // function printStackTrace() {
    //     var th = Java.cast(CLASS.Thread.currentThread(), CLASS.Thread);
    //     var stack = th.getStackTrace(),
    //         e = null;

    //     for (var i = 0; i < stack.length; i++) {
    //         console.log("\t" + stack[i].getClassName() + "." + stack[i].getMethodName() + "(" + stack[i].getFileName() + ")");
    //     }
    // }

    // function isZero(block) {
    //     var m = /^[0\s]+$/.exec(block);
    //     return m != null && m.length > 0 && (m[0] == block);
    // }

    // function hexdump(buffer, blockSize) {
    //     blockSize = blockSize || 16;
    //     var lines = [];
    //     var hex = "0123456789ABCDEF";
    //     var prevZero = false,
    //         ctrZero = 0;
    //     for (var b = 0; b < buffer.length; b += blockSize) {
    //         var block = buffer.slice(b, Math.min(b + blockSize, buffer.length));
    //         var addr = ("0000" + b.toString(16)).slice(-4);
    //         var codes = block.split('').map(function (ch) {
    //             var code = ch.charCodeAt(0);
    //             return " " + hex[(0xF0 & code) >> 4] + hex[0x0F & code];
    //         }).join("");
    //         codes += "   ".repeat(blockSize - block.length);
    //         var chars = block.replace(/[\\x00-\\x1F\\x20\n]/g, '.');
    //         chars += " ".repeat(blockSize - block.length);
    //         if (isZero(codes)) {
    //             ctrZero += blockSize;
    //             prevZero = true;
    //         } else {
    //             if (prevZero) {
    //                 lines.push("\t [" + ctrZero + "] bytes of zeroes");
    //             }
    //             lines.push(addr + " " + codes + "  " + chars);
    //             prevZero = false;
    //             ctrZero = 0;
    //         }
    //     }
    //     if (prevZero) {
    //         lines.push("\t [" + ctrZero + "] bytes of zeroes");
    //     }
    //     return lines.join("\\n");
    // }

    // function b2s(array) {
    //     var result = "";
    //     for (var i = 0; i < array.length; i++) {
    //         result += String.fromCharCode(modulus(array[i], 256));
    //     }
    //     return result;
    // }

    // function modulus(x, n) {
    //     return ((x % n) + n) % n;
    // }


    function PrintBytesHex(fname, bytes, length) {
        if (fname.indexOf(".jpg") != -1 || fname.indexOf(".png") != -1) {
            var hexstr = "";
            for (var i = 0; i < length; i++) {
                var b = (bytes[i] >>> 0) & 0xff;
                var n = b.toString(16);
                hexstr += ("00" + n).slice(-2) + " ";
            }
            console.log("[+] read bytes: " + hexstr);
        }
    }

    function printStack() {
        Java.perform(function () {
            var Exception = Java.use("java.lang.Exception");
            var ins = Exception.$new("Exception");
            var straces = ins.getStackTrace();
            if (straces != undefined && straces != null) {
                var strace = straces.toString();
                var replaceStr = strace.replace(/,/g, "\r\n");
                console.log("=============================Stack start=======================");
                console.log(replaceStr);
                console.log("=============================Stack end=======================\r\n");
                Exception.$dispose();
            }
        });
    }

});