// tests go here; this will not be compiled when this package is used as a library

cw01.connectToWifi("SSID", "PSK")
cw01.connectToATT("DEVICE_TOKEN", "DEVICE_ID")
basic.forever(function () {
    cw01.IoTSendStateToATT(true, "boolTest")
    basic.showString(cw01.IoTgetATTAssetValue("6"))
    cw01.IoTSendStateToATT(false, "boolTest")
})