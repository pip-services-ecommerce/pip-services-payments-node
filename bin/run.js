let PaymentsProcess = require('../obj/src/container/PaymentsProcess').PaymentsProcess;

try {
    let proc = new PaymentsProcess();
    proc._configPath = "./config/config.yml";
    proc.run(process.argv);
} catch (ex) {
    console.error(ex);
}
