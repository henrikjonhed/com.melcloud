import 'source-map-support/register'
import MELCloudDriverMixin from '../../mixins/driver_mixin'
import { DeviceInfo, ListDevices } from '../../types'

const setCapabilityMappingAta = {
  onoff: { tag: 'Power', effectiveFlag: BigInt(0x1) },
  operation_mode: { tag: 'OperationMode', effectiveFlag: BigInt(0x2) },
  target_temperature: { tag: 'SetTemperature', effectiveFlag: BigInt(0x4) },
  fan_power: { tag: 'SetFanSpeed', effectiveFlag: BigInt(0x8) },
  vertical: { tag: 'VaneVertical', effectiveFlag: BigInt(0x10) },
  horizontal: { tag: 'VaneHorizontal', effectiveFlag: BigInt(0x100) }
} as const

const getCapabilityMappingAta = {
  measure_temperature: { tag: 'RoomTemperature' }
} as const

const listCapabilityMappingAta = {
  'measure_power.wifi': { tag: 'WifiSignalStrength' }
} as const

export default class MELCloudDriverAta extends MELCloudDriverMixin {
  async onInit (): Promise<void> {
    await super.onInit()

    this.deviceType = 0
    this.heatPumpType = 'Ata'

    this.setCapabilityMapping = setCapabilityMappingAta
    this.getCapabilityMapping = getCapabilityMappingAta
    this.listCapabilityMapping = listCapabilityMappingAta

    // Condition flowcards
    this.homey.flow
      .getConditionCard('operation_mode_condition')
      .registerRunListener((args) => args.operation_mode === args.device.getCapabilityValue('operation_mode'))

    this.homey.flow
      .getConditionCard('fan_power_condition')
      .registerRunListener((args) => Number(args.fan_power) === args.device.getCapabilityValue('fan_power'))

    this.homey.flow
      .getConditionCard('vertical_condition')
      .registerRunListener((args) => args.vertical === args.device.getCapabilityValue('vertical'))

    this.homey.flow
      .getConditionCard('horizontal_condition')
      .registerRunListener((args) => args.horizontal === args.device.getCapabilityValue('horizontal'))

    // Action flowcards
    this.homey.flow
      .getActionCard('operation_mode_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('operation_mode', args.operation_mode)
      })

    this.homey.flow
      .getActionCard('fan_power_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('fan_power', Number(args.fan_power))
      })

    this.homey.flow
      .getActionCard('vertical_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('vertical', args.vertical)
      })

    this.homey.flow
      .getActionCard('horizontal_action')
      .registerRunListener(async (args) => {
        await args.device.onCapability('horizontal', args.horizontal)
      })
  }

  async discoverDevices (): Promise<DeviceInfo[]> {
    const devices: ListDevices = await this.app.listDevices(this)
    return Object.values(devices).map((device) => (
      {
        name: device.DeviceName,
        data: {
          id: device.DeviceID,
          buildingid: device.BuildingID
        }
      }
    ))
  }
}

module.exports = MELCloudDriverAta
