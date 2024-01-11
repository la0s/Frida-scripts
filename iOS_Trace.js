// 检查任意指针是否是有效的Objective-C对象
// 参考https://codeshare.frida.re/@mrmacete/objc-method-observer/
function CheckObjc(p) {
    var klass = getObjCClassPtr(p);
    return !klass.isNull();
}

function getObjCClassPtr(p) {
    /*
     * Loosely based on:
     * https://blog.timac.org/2016/1124-testing-if-an-arbitrary-pointer-is-a-valid-objective-c-object/
     */
    var ISA_MASK = ptr('0x0000000ffffffff8');
    var ISA_MAGIC_MASK = ptr('0x000003f000000001');
    var ISA_MAGIC_VALUE = ptr('0x000001a000000001');

    if (!isReadable(p))
        return NULL;
    var isa = p.readPointer();
    var classP = isa;
    if (classP.and(ISA_MAGIC_MASK).equals(ISA_MAGIC_VALUE))
        classP = isa.and(ISA_MASK);
    if (isReadable(classP))
        return classP;
    return NULL;
}

function isReadable(p) {
    try {
        p.readU8();
        return true;
    } catch (e) {
        return false;
    }
}


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


// https://codeshare.frida.re/@lichao890427/ios-utils/
// var NSData = ObjC.classes.NSData;
// var NSString = ObjC.classes.NSString;

// /* NSData -> NSString */
// function NSData2NSString(NSData) {
//     return ObjC.classes.NSString.alloc().initWithData_encoding_(NSData, 4);
// }


// generic trace
function trace(pattern) {
    var type = (pattern.indexOf(" ") !== -1) ? "objc" : "module";
    var res = new ApiResolver(type);
    var matches = res.enumerateMatchesSync(pattern);
    var targets = uniqBy(matches, JSON.stringify);

    targets.forEach(function (target) {
        if (type === "objc") {
            var filter = [  // 自定义过滤条件，方法名称中不含以下关键词
                "SDK",
                "Monitor",
                "_"
            ];
            for (var i = 0, Traceflag = 0; i < filter.length; i++) {
                if (target.name.indexOf(filter[i]) != -1) {
                    Traceflag = 1;
                }
            }
            if (Traceflag === 0) {
                LOG("Tracing " + target.name + " " + target.address, { c: Color.Gray });
                // console.log("Tracing " + target.name +" "+ target.address);
                traceObjC(target.address, target.name);
            }
        }
        else if (type === "module") {
            traceModule(target.address, target.name);
        }
    });
}

// remove duplicates from array
function uniqBy(array, key) {
    var seen = {};
    return array.filter(function (item) {
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
}

// trace ObjC methods
function traceObjC(impl, name) {
    Interceptor.attach(impl, {
        onEnter: function (args) {
            // debug only the intended calls
            // console.log("Tracing " + name);
            console.log("[+] ---------------------------------------------------------------");
            LOG("*** entering " + name, { c: Color.Green });
            // console.log("*** entered " + name);

            // print full backtrace
            // console.log('\tACCURATE Backtrace:\n\t' + Thread.backtrace(this.context,Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n\t'));
            // console.log('\tFUZZY Backtrace:\n\t' + Thread.backtrace(this.context,Backtracer.FUZZY).map(DebugSymbol.fromAddress).join('\n\t'));

            // print caller
            // console.log("[+] Caller: " + DebugSymbol.fromAddress(this.returnAddress));

            // print args
            if (name.indexOf(":") !== -1) {  // 有参数的逻辑处理
                var param = name.split(":");
                param[0] = param[0].split(" ")[1];
                for (var i = 0; i < param.length - 1; i++) {
                    // console.log("[+] args"+"["+ (i+2) +"] objc: " + CheckObjc(args[i + 2]));
                    if (CheckObjc(args[i + 2])) {
                        printArg("arg" + (i + 2) + " " + param[i] + ": ", args[i + 2]);
                    }
                }
                // 防止遗漏Receiver对象
                if (CheckObjc(args[0])) {
                    // 无参数的Objective-C方法，打印args[0]
                    var param1 = new ObjC.Object(args[0]);
                    LOG("[+] args[0]: " + param1, { c: Color.Gray });
                    // console.log("[+] args[0]: " + param1);
                    console.log("[+] type: " + param1.$className);
                }

            } else {  // 无参数的逻辑处理,如-[NSString md5]
                if (CheckObjc(args[0])) {
                    // 无参数的Objective-C方法，打印args[0]
                    var param1 = new ObjC.Object(args[0]);
                    LOG("[+] args[0]: " + param1, { c: Color.Gray });
                    // console.log("[+] args[0]: " + param1);
                    console.log("[+] type: " + param1.$className);
                }
            }
        },

        onLeave: function (retval) {
            // console.log("[+] retval objc: " + CheckObjc(retval));
            if (CheckObjc(retval)) {
                printArg("retval: ", retval);
            }

            LOG("*** exiting " + name, { c: Color.Green });
            // console.log("*** exiting " + name);
            console.log("[-] ---------------------------------------------------------------\n");
        }
    });
}

// print helper
function printArg(desc, arg) {
    try {
        var objcParam = ObjC.Object(arg);
        var objcType = objcParam.$className;

        // [+] arg3: {length = 36, bytes = 0x37374131 30324232 2d323736 462d3435 ... 34333430 43313143 }
        // [+] type: NSConcreteMutableData
        // ==>
        // [+] arg3: 77A102B2-276F-4542-8F33-0DF84340C11C
        // [+] type: __NSCFString
        // if (objcParam.$className == "NSConcreteMutableData" || objcParam.$className == "_NSInlineData") {    // 将NSConcreteMutableData等类型转化为NSString打印
        //     try {
        //         // objcParam = NSData2NSString(objcParam);  // 非可见字符不会报异常
        //         objcParam = objcParam.bytes().readUtf8String(objcParam.length());
        //     } catch(e){
        //         objcParam = objcParam.CKHexString();     // 非可见字符, 打印hex
        //     }
        // }

        if (desc.indexOf("arg") != -1) {   // 区分参数与返回值着色
            LOG("[+] " + desc + objcParam, { c: Color.Gray });
        } else {
            LOG("[+] " + desc + objcParam, { c: Color.Cyan });
        }
        // console.log("[+] " + desc + objcParam);

        console.log("[+] type: " + objcType);
    } catch (err) {
        console.log(desc + arg);
    }
}


// ----------------------usage examples---------------------------
if (ObjC.available) {

    // trace("*[* *md5*]"); //trace("*[* *MD5*]");
    // trace("*[* *Encode*]");
    // trace("*[* setObject:forKey:]");
    // trace("+[* *des*:]");
    // trace("*[MD5 *]");
    // trace("*[* *Sign*:*]");
    // trace("*[* *base64*:*]");
    // trace("*[* *Encrypt*:*]");
    trace("-[NSMutableURLRequest setValue:forHTTPHeaderField:]");


} else {
    send("error: Objective-C Runtime is not available!");
}
// ---------------------------------------------------------------

