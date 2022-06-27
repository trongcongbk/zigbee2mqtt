const exposes = require('zigbee-herdsman-converters/lib/exposes');
const fz = {...require('zigbee-herdsman-converters/converters/fromZigbee'), legacy: require('zigbee-herdsman-converters/lib/legacy').fromZigbee};
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const ota = require('zigbee-herdsman-converters/lib/ota');
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;
const libColor = require('zigbee-herdsman-converters/lib/color');
const utils = require('zigbee-herdsman-converters/lib/utils');

const TS011Fplugs = ['_TZ3000_5f43h46b', '_TZ3000_cphmq0q7', '_TZ3000_dpo1ysak', '_TZ3000_ew3ldmgx', '_TZ3000_gjnozsaz',
    '_TZ3000_jvzvulen', '_TZ3000_mraovvmm', '_TZ3000_nfnmi125', '_TZ3000_ps3dmato', '_TZ3000_w0qqde0g', '_TZ3000_u5u4cakc',
    '_TZ3000_rdtixbnu', '_TZ3000_typdpbpg', '_TZ3000_v1pdxuqq'];

const tzLocal = {
    TS0504B_color: {
        key: ['color'],
        convertSet: async (entity, key, value, meta) => {
            const color = libColor.Color.fromConverterArg(value);
            console.log(color);
            const enableWhite =
                (color.isRGB() && (color.rgb.red === 1 && color.rgb.green === 1 && color.rgb.blue === 1)) ||
                // Zigbee2MQTT frontend white value
                (color.isXY() && (color.xy.x === 0.3125 || color.xy.y === 0.32894736842105265)) ||
                // Home Assistant white color picker value
                (color.isXY() && (color.xy.x === 0.323 || color.xy.y === 0.329));

            if (enableWhite) {
                await entity.command('lightingColorCtrl', 'tuyaRgbMode', {enable: false});
                const newState = {color_mode: 'xy'};
                if (color.isXY()) {
                    newState.color = color.xy;
                } else {
                    newState.color = color.rgb.gammaCorrected().toXY().rounded(4);
                }
                return {state: libColor.syncColorState(newState, meta.state, entity, meta.options, meta.logger)};
            } else {
                return await tz.light_color.convertSet(entity, key, value, meta);
            }
        },
    },
};

module.exports = [
    {
        fingerprint: [{modelID: 'TS0202', manufacturerName: '_TYZB01_ef5xlc9q'},
            {modelID: 'TS0202', manufacturerName: '_TYZB01_vwqnz1sn'},
            {modelID: 'TS0202', manufacturerName: '_TYZB01_2b8f6cio'},
            {modelID: 'TS0202', manufacturerName: '_TZE200_bq5c8xfe'},
            {modelID: 'TS0202', manufacturerName: '_TYZB01_dl7cejts'},
            {modelID: 'TS0202', manufacturerName: '_TYZB01_qjqgmqxr'},
            {modelID: 'TS0202', manufacturerName: '_TZ3000_mmtwjmaq'},
            {modelID: 'TS0202', manufacturerName: '_TZ3000_kmh5qpmb'},
            {modelID: 'TS0202', manufacturerName: '_TYZB01_zwvaj5wy'},
            {modelID: 'TS0202', manufacturerName: '_TZ3000_mcxw5ehu'},
            {modelID: 'TS0202', manufacturerName: '_TZ3000_bsvqrxru'},
            {modelID: 'TS0202', manufacturerName: '_TZ3000_msl6wxk9'},
            {modelID: 'TS0202', manufacturerName: '_TYZB01_tv3wxhcz'},
            {modelID: 'TS0202', manufacturerName: '_TYZB01_hqbdru35'},
            {modelID: 'TS0202', manufacturerName: '_TZ3000_tiwq83wk'},
            {modelID: 'TS0202', manufacturerName: '_TZ3000_od1nj6bz'},
            {modelID: 'WHD02', manufacturerName: '_TZ3000_hktqahrq'}],
        model: 'TS0202',
        vendor: 'TuYa',
        description: 'Motion sensor',
        whiteLabel: [{vendor: 'Mercator Ikuü', model: 'SMA02P'}, {vendor: 'TuYa ', model: 'TY-ZPR06'}],
        fromZigbee: [fz.ias_occupancy_alarm_1, fz.battery, fz.ignore_basic_report, fz.ias_occupancy_alarm_1_report],
        toZigbee: [],
        exposes: [e.occupancy(), e.tamper()],
        //exposes: [e.occupancy(), e.battery_low(), e.tamper(), e.battery()],
		configure: async (device, coordinatorEndpoint, logger) => {
            // Reports itself as battery which is not correct: https://github.com/Koenkk/zigbee2mqtt/issues/6190
            device.powerSource = 'Mains (single phase)';
	    device.type = 'EndDevice';
            device.save();
        },
    },
];
