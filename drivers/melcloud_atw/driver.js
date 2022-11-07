const MELCloudDriverMixin = require('../../mixins/driver_mixin');

class MELCloudAtwDriver extends MELCloudDriverMixin {
  async onInit() {
    this.deviceType = 1;
    this.heatPumpType = 'Atw';

    this.setCapabilityMapping = {
      onoff: ['Power', BigInt(0x1)],
      'operation_mode_zone.zone1': ['OperationModeZone1', BigInt(0x8)],
      'operation_mode_zone_with_cool.zone1': ['OperationModeZone1', BigInt(0x8)],
      'operation_mode_zone.zone2': ['OperationModeZone2', BigInt(0x10)],
      'operation_mode_zone_with_cool.zone2': ['OperationModeZone2', BigInt(0x10)],
      'onoff.forced_hot_water': ['ForcedHotWaterMode', BigInt(0x10000)],
      target_temperature: ['SetTemperatureZone1', BigInt(0x200000080)],
      'target_temperature.zone2': ['SetTemperatureZone2', BigInt(0x800000200)],
      'target_temperature.zone1_flow_cool': ['SetCoolFlowTemperatureZone1', BigInt(0x1000000000000)],
      'target_temperature.zone1_flow_heat': ['SetHeatFlowTemperatureZone1', BigInt(0x1000000000000)],
      'target_temperature.zone2_flow_cool': ['SetCoolFlowTemperatureZone2', BigInt(0x1000000000000)],
      'target_temperature.zone2_flow_heat': ['SetHeatFlowTemperatureZone2', BigInt(0x1000000000000)],
      'target_temperature.tank_water': ['SetTankWaterTemperature', BigInt(0x1000000000020)],
    };
    this.getCapabilityMapping = {
      eco_hot_water: 'EcoHotWater',
      measure_temperature: 'RoomTemperatureZone1',
      'measure_temperature.zone2': 'RoomTemperatureZone2',
      'measure_temperature.outdoor': 'OutdoorTemperature',
      'measure_temperature.tank_water': 'TankWaterTemperature',
      operation_mode_state: 'OperationMode',
    };
    this.listCapabilityMapping = {
      'alarm_generic.booster_heater1': 'BoosterHeater1Status',
      'alarm_generic.booster_heater2': 'BoosterHeater2Status',
      'alarm_generic.booster_heater2_plus': 'BoosterHeater2PlusStatus',
      'alarm_generic.defrost_mode': 'DefrostMode',
      'alarm_generic.immersion_heater': 'ImmersionHeaterStatus',
      'measure_power.heat_pump_frequency': 'HeatPumpFrequency',
      'measure_power.wifi': 'WifiSignalStrength',
      'measure_temperature.flow': 'FlowTemperature',
      'measure_temperature.return': 'ReturnTemperature',
    };

    this.atwCapabilities = [
      'measure_temperature',
      'measure_temperature.outdoor',
      'measure_temperature.flow',
      'measure_temperature.return',
      'onoff',
      'onoff.forced_hot_water',
      'operation_mode_state',
      'target_temperature',
      'target_temperature.zone1_flow_heat',
    ];
    this.coolAtwCapabilities = [
      'operation_mode_zone_with_cool.zone1',
      'target_temperature.zone1_flow_cool',
    ];
    this.notCoolAtwCapabilities = [
      'operation_mode_zone.zone1',
    ];
    this.zone2AtwCapabilities = [
      'measure_temperature.zone2',
      'target_temperature.zone2',
      'target_temperature.zone2_flow_heat',
    ];
    this.coolZone2AtwCapabilities = [
      'operation_mode_zone_with_cool.zone2',
      'target_temperature.zone2_flow_cool',
    ];
    this.notCoolZone2AtwCapabilities = [
      'operation_mode_zone.zone2',
    ];
    this.otherAtwCapabilities = [
      'measure_temperature.tank_water',
      'target_temperature.tank_water',
    ];

    // Condition flowcards
    this.homey.flow
      .getConditionCard('eco_hot_water_condition')
      .registerRunListener((args) => args.eco_hot_water === String(args.device.getCapabilityValue('eco_hot_water')));

    this.homey.flow
      .getConditionCard('onoff_forced_hot_water_condition')
      .registerRunListener((args) => args.onoff_forced_hot_water === String(args.device.getCapabilityValue('onoff.forced_hot_water')));

    this.homey.flow
      .getConditionCard('operation_mode_state_condition')
      .registerRunListener((args) => args.operation_mode_state === args.device.getCapabilityValue('operation_mode_state'));

    this.homey.flow
      .getConditionCard('operation_mode_zone1_condition')
      .registerRunListener((args) => args.operation_mode_zone === args.device.getCapabilityValue('operation_mode_zone.zone1'));

    this.homey.flow
      .getConditionCard('operation_mode_zone1_with_cool_condition')
      .registerRunListener((args) => args.operation_mode_zone === args.device.getCapabilityValue('operation_mode_zone_with_cool.zone1'));

    this.homey.flow
      .getConditionCard('operation_mode_zone2_condition')
      .registerRunListener((args) => args.operation_mode_zone === args.device.getCapabilityValue('operation_mode_zone.zone2'));

    this.homey.flow
      .getConditionCard('operation_mode_zone2_with_cool_condition')
      .registerRunListener((args) => args.operation_mode_zone === args.device.getCapabilityValue('operation_mode_zone_with_cool.zone2'));

    // Action flowcards
    this.homey.flow
      .getActionCard('onoff_forced_hot_water_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('onoff.forced_hot_water', args.onoff_forced_hot_water === 'true');
      });

    this.homey.flow
      .getActionCard('operation_mode_zone1_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('operation_mode.zone1', args.operation_mode_zone);
      });

    this.homey.flow
      .getActionCard('operation_mode_zone1_with_cool_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('operation_mode_with_cool.zone1', args.operation_mode_zone);
      });

    this.homey.flow
      .getActionCard('operation_mode_zone2_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('operation_mode.zone2', args.operation_mode_zone);
      });

    this.homey.flow
      .getActionCard('operation_mode_zone2_with_cool_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('operation_mode_with_cool.zone2', args.operation_mode_zone);
      });

    this.homey.flow
      .getActionCard('target_temperature_tank_water')
      .registerRunListener(async (args) => {
        await args.device.onCapability('target_temperature.tank_water', args.target_temperature);
      });

    this.homey.flow
      .getActionCard('target_temperature_zone2')
      .registerRunListener(async (args) => {
        await args.device.onCapability('target_temperature.zone2', args.target_temperature);
      });

    this.homey.flow
      .getActionCard('target_temperature_zone1_flow_cool_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('target_temperature.zone1_flow_cool', args.target_temperature);
      });

    this.homey.flow
      .getActionCard('target_temperature_zone1_flow_heat_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('target_temperature.zone1_flow_heat', args.target_temperature);
      });

    this.homey.flow
      .getActionCard('target_temperature_zone2_flow_cool_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('target_temperature.zone2_flow_cool', args.target_temperature);
      });

    this.homey.flow
      .getActionCard('target_temperature_zone2_flow_heat_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('target_temperature.zone2_flow_heat', args.target_temperature);
      });
  }

  async discoverDevices() {
    const listDevices = await this.homey.app.listDevices(this);
    const deviceList = Object.values(listDevices).map((device) => {
      const deviceInfo = {
        name: device.DeviceName,
        data: {
          id: device.DeviceID,
          buildingid: device.BuildingID,
        },
        store: {
          canCool: device.Device.CanCool,
          hasZone2: device.Device.HasZone2,
        },
        capabilities: [],
      };
      this.atwCapabilities.forEach((capability) => {
        deviceInfo.capabilities.push(capability);
      });
      if (device.Device.CanCool) {
        this.coolAtwCapabilities.forEach((capability) => {
          deviceInfo.capabilities.push(capability);
        });
      } else {
        this.notCoolAtwCapabilities.forEach((capability) => {
          deviceInfo.capabilities.push(capability);
        });
      }
      if (device.Device.HasZone2) {
        this.zone2AtwCapabilities.forEach((capability) => {
          deviceInfo.capabilities.push(capability);
        });
        if (device.Device.CanCool) {
          this.coolZone2AtwCapabilities.forEach((capability) => {
            deviceInfo.capabilities.push(capability);
          });
        } else {
          this.notCoolZone2AtwCapabilities.forEach((capability) => {
            deviceInfo.capabilities.push(capability);
          });
        }
      }
      this.otherAtwCapabilities.forEach((capability) => {
        deviceInfo.capabilities.push(capability);
      });
      return deviceInfo;
    });
    return deviceList;
  }
}

module.exports = MELCloudAtwDriver;
