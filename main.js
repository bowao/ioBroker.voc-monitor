'use strict';

/*
 * Created with @iobroker/create-adapter v1.17.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const VOCMonitor = require('./lib/iam-voc-monitor');
const dgram = require('dgram');

class vocmonitor extends utils.Adapter {

    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'voc-monitor',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here
        var that = this;

        if(this.config.usb) {

            createNode('USB');

            let vocMonitor = new VOCMonitor();

            vocMonitor.on('connected', (device) => {
                vocMonitor.startTransfer();
                this.log.info('Connected to VOC-Monitor device via USB');
                this.setState('info.connection', true, true);
            });

            vocMonitor.on('error', (error) => {
                this.log.error('No device found on the usb port: ' + error);
                this.setState('info.connection', false, true);
            });

            vocMonitor.on('rawData', (data) => {
                this.log.debug('VOC-Monitor_USB VOC: ' + data);
                this.setState('VOC-Monitor_USB.voc', {val: data, ack: true});
            });

            try{
                vocMonitor.connect();
            }
            catch (e) {
                this.log.error(e);
            }

        }

        if(this.config.server) {
            const PORT = this.config.port;
            const HOST = this.config.ip;
            let voc, nodeIp, msgStr;
            
	    const server = dgram.createSocket('udp4');

            server.on('listening', function() {
                var address = server.address();
                that.log.info('UDP Server listening on ' + address.address + ':' + address.port);
            });

            server.on('message', function(msg, remote) {
                that.setState('info.connection', true, true);
                that.log.debug(remote.address + ' ' + msg);

                nodeIp = remote.address.replace(/[.]/g, "_"); 

                that.getObject('VOC-Monitor_' + nodeIp, function (err, obj) {
                    if(err) {
                        that.log.info(err);
                    } else {
                        if(!obj){
                            that.log.info('Create new Device: VOC-Monitor_' + nodeIp);
                            createNode(nodeIp);
                        }
                    }
                });

                if (/VOC=[0-9]+/.test(msg)) {
                    msgStr = msg.toString();
                    voc = parseInt((msgStr.match(/VOC=[0-9]+/)[0].substring(4)));
                    that.setState('VOC-Monitor_' + nodeIp + '.voc', {val: voc, ack: true});
                }

            });

            server.on('close', function() {
                that.log.info('UDP Server closed');
            });

            try {
                server.bind(PORT, HOST);
            }
            catch (e) {
                try {
                    if(!this.config.port || this.config.port === '' || this.config.port === undefined) {
                        this.log.info('No udp-server-port defined in config. Fallback to port 44444');
                    }
                    this.log.error('Adapter stopped on udp-server binding : ' + e);
                    server.bind(44444);
                }
                catch (e) {
                    this.log.error('Adapter stopped on udp-server bind : ' + e)
                }
            }

        }

        function createNode(id) {

            that.setObjectNotExists('VOC-Monitor_' + id, {
                type: 'channel',
                common: {
                    name: 'VOC-Monitor ' + id
                },
                native: {
                    "addr": id
                }
            });

            that.setObjectNotExists('VOC-Monitor_' + id + '.voc', {
                type: 'state',
                common: {
                    "name": "VOC",
                    "type": "number",
                    "unit": "ppm",
                    "min": 0,
                    "max": 3000,
                    "read": true,
                    "write": false,
                    "role": "value",
                    "desc": "VOC"
                },
                native: {}
            });

        }

    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.setState('info.connection', false, true);
            server.close()
            this.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new vocmonitor(options);
} else {
    // otherwise start the instance directly
    new vocmonitor();
}
