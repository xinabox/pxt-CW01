enum USER {
    //% block="INDUSTRIAL"
    INDUSTRIAL = 1,
    //% block="EDUCATIONAL"
    EDUCATIONAL = 2
}


//% groups=["Common",ATT", "Ubidots", "Azure", "MQTT", "others"]
//% weight=6 color=#2699BF icon="\uf110" block="CW01"
namespace cw01 {
    class cw01_int_var123 {
        res: string
        TOKEN: string
        DEVICE_ID: string
        asset_name: string
        NEWLINE: string
        start: boolean
        latitude: number
        longitude: number
        select: boolean
        azureAccess: string
        mqtt_payload: string
        prev_mqtt_payload: string
        block: boolean
        mqtt_topic: string
        fail_count: number
        topics: string[]
        topic_count: number
        topic_rcv: string
        timer: number
        att_string: boolean
        att_string_value: string
        att_number: boolean
        att_number_value: number
        att_state: boolean
        att_state_value: boolean
        att_asset: string

        constructor() {
            this.res = ""
            this.TOKEN = ""
            this.DEVICE_ID = ""
            this.asset_name = ""
            this.NEWLINE = "\u000D\u000A"
            this.start = false
            this.latitude = 0
            this.longitude = 0
            this.select = false
            this.azureAccess = ""
            this.mqtt_payload = ""
            this.prev_mqtt_payload = ""
            this.block = false
            this.mqtt_topic = ""
            this.fail_count = 0
            this.topics = []
            this.topic_count = 0
            this.topic_rcv = ""
            this.timer = 0
            this.att_string = false
            this.att_string_value = ""
            this.att_number = false
            this.att_number_value = 0
            this.att_state = false
            this.att_state_value = false
            this.att_asset = ""
        }
    }

    let cw01_vars = new cw01_int_var123()

    cw01_vars.start = true
    serial.redirect(SerialPin.P1, SerialPin.P0, 115200)
    serial.setRxBufferSize(200)

    basic.showIcon(IconNames.Chessboard)
    basic.pause(2000)
    serial.writeString("ATE0" + cw01_vars.NEWLINE)
    basic.pause(300)
    serial.writeString("AT+CWMODE_DEF=3" + cw01_vars.NEWLINE)
    basic.pause(300)
    serial.writeString("AT+CIPRECVMODE=1" + cw01_vars.NEWLINE)
    basic.pause(300)
    serial.writeString("AT+TEST" + cw01_vars.NEWLINE)
    basic.pause(300)
    serial.readString();
    serial.writeString("AT+CWHOSTNAME?" + cw01_vars.NEWLINE);

    read_and_set_name();

    function read_and_set_name(): void {
        let name: string = "";
        name = serial.readString()

        if (!(name.includes("CW01"))) {
            serial.writeString("AT+CWHOSTNAME=\"CW01\"" + cw01_vars.NEWLINE)
            control.reset()
        }
    }

    /**
    * Connect to W-Fi 
    */
    //% weight=91 color=#ad0303
    //% group="Common"
    //% blockId="connectToWifi" block="CW01 connect to WiFi SSID %SSID, password %PSK"
    export function connectToWifi(SSID: string, PSK: string): void {
        if (true) {
            //serial.writeString("AT+CWMODE=1" + cw01_vars.NEWLINE)
            basic.pause(100)
            /*serial.readString()
            serial.writeString("AT+CWJAP=\"" + SSID + "\",\"" + PSK + "\"" + cw01_vars.NEWLINE)
            basic.pause(200)
            serial.readString()
            basic.pause(10000)
            cw01_vars.res = serial.readLine()*/

            /*if (cw01_vars.res.compare("WIFI CONNECTED\r") == 0) {
                basic.showString("C")
                cw01_vars.res = ""
            } else {
            basic.showString("D")
        }*/

        } else {
            //basic.showString("Missed begin block!")
        }
    }
    /**
    * Connect to AllThingsTalk IoT platform
    */
    //% weight=91
    //% group="ATT"
    //% blockId="connectToATT" block="CW01 connect to ATT with token %TKN and device-id %ID"
    export function connectToATT(TKN: string, ID: string): void {
        cw01_vars.DEVICE_ID = ID
        cw01_vars.TOKEN = TKN
        serial.writeString("AT+CIPSTART=\"TCP\",\"api.allthingstalk.io\",80" + cw01_vars.NEWLINE)
        basic.pause(500)
    }


    /**
    * Send string data to AllThingsTalk IoT platform
    */
    //% weight=91
    //% group="ATT"
    //% blockId="IoTSendStringToATT" block="CW01 send string %value to ATT asset %asset"
    export function IoTSendStringToATT(value: string, asset: string): void {
        cw01_vars.asset_name = asset
        serial.writeString("AT+CIPMODE=0" + cw01_vars.NEWLINE)
        basic.pause(100)
        let payload: string = "{\"value\": " + value + "}"
        let request: string = "PUT /device/" + cw01_vars.DEVICE_ID + "/asset/" + cw01_vars.asset_name + "/state" + " HTTP/1.1" + cw01_vars.NEWLINE +
            "Host: api.allthingstalk.io" + cw01_vars.NEWLINE +
            "User-Agent: CW01/1.0" + cw01_vars.NEWLINE +
            "Accept: */*" + cw01_vars.NEWLINE +
            "Authorization: Bearer " + cw01_vars.TOKEN + cw01_vars.NEWLINE +
            "Content-Type:application/json" + cw01_vars.NEWLINE +
            "Content-Length: " + (payload.length).toString() + cw01_vars.NEWLINE + cw01_vars.NEWLINE + payload + cw01_vars.NEWLINE

        basic.showLeds(`
        . . . . .
        . . . . .
        # . # . #
        . . . . .
        . . . . .
        `)

        serial.writeString("AT+CIPSEND=" + (request.length + 2).toString() + cw01_vars.NEWLINE)
        basic.pause(100)
        serial.writeString(request + cw01_vars.NEWLINE)
        basic.pause(10)
        serial.readString()
        basic.pause(1000)

        get_status()
        basic.pause(1000)

    }

    /**
    * Send numerical data to AllThingsTalk IoT platform
    */
    //% weight=91
    //% group="ATT"
    //% blockId="IoTSendValueToATT" block="CW01 send value %value to ATT asset %asset"
    export function IoTSendValueToATT(value: number, asset: string): void {
        cw01_vars.asset_name = asset
        serial.writeString("AT+CIPMODE=0" + cw01_vars.NEWLINE)
        basic.pause(100)
        let payload: string = "{\"value\": " + value.toString() + "}"
        let request: string = "PUT /device/" + cw01_vars.DEVICE_ID + "/asset/" + cw01_vars.asset_name + "/state" + " HTTP/1.1" + cw01_vars.NEWLINE +
            "Host: api.allthingstalk.io" + cw01_vars.NEWLINE +
            "User-Agent: CW01/1.0" + cw01_vars.NEWLINE +
            "Accept: */*" + cw01_vars.NEWLINE +
            "Authorization: Bearer " + cw01_vars.TOKEN + cw01_vars.NEWLINE +
            "Content-Type:application/json" + cw01_vars.NEWLINE +
            "Content-Length: " + (payload.length).toString() + cw01_vars.NEWLINE + cw01_vars.NEWLINE + payload + cw01_vars.NEWLINE


        basic.showLeds(`
        . . . . .
        . . . . .
        # . # . #
        . . . . .
        . . . . .
        `)

        serial.writeString("AT+CIPSEND=" + (request.length + 2).toString() + cw01_vars.NEWLINE)
        basic.pause(100)
        serial.writeString(request + cw01_vars.NEWLINE)
        basic.pause(10)
        serial.readString()
        basic.pause(1000)

        get_status()

        basic.pause(1000)
    }

    /**
    * Send boolean data to AllThingsTalk IoT platform
    */
    //% weight=91
    //% group="ATT"
    //% blockId="IoTSendStateToATT" block="CW01 send state %state to ATT asset %asset_name"
    export function IoTSendStateToATT(state: boolean, asset: string): void {
        let stateStr: string

        if (state == true) {
            stateStr = "true"
        } else {
            stateStr = "false"
        }

        cw01_vars.asset_name = asset
        serial.writeString("AT+CIPMODE=0" + cw01_vars.NEWLINE)
        basic.pause(100)
        let payload: string = "{\"value\": " + stateStr + "}"
        let request: string = "PUT /device/" + cw01_vars.DEVICE_ID + "/asset/" + cw01_vars.asset_name + "/state" + " HTTP/1.1" + cw01_vars.NEWLINE +
            "Host: api.allthingstalk.io" + cw01_vars.NEWLINE +
            "User-Agent: CW01/1.0" + cw01_vars.NEWLINE +
            "Accept: */*" + cw01_vars.NEWLINE +
            "Authorization: Bearer " + cw01_vars.TOKEN + cw01_vars.NEWLINE +
            "Content-Type:application/json" + cw01_vars.NEWLINE +
            "Content-Length: " + (payload.length).toString() + cw01_vars.NEWLINE + cw01_vars.NEWLINE + payload + cw01_vars.NEWLINE


        basic.showLeds(`
        . . . . .
        . . . . .
        # . # . #
        . . . . .
        . . . . .
        `)

        serial.writeString("AT+CIPSEND=" + (request.length + 2).toString() + cw01_vars.NEWLINE)
        basic.pause(100)
        serial.writeString(request + cw01_vars.NEWLINE)
        basic.pause(10)
        serial.readString()
        basic.pause(1000)

        get_status()

        basic.pause(1000)


    }

    /**
    * Get latest value of asset from AllThingsTalk IoT platform. Asset can be string, numerical and boolean
    */
    //% weight=91
    //% group="ATT"
    //% blockId="IoTgetATTAssetValue" block="CW01 get ATT asset %asset value"
    export function IoTgetATTAssetValue(asset: string): string {
        cw01_vars.res = ""
        let index1: number
        let index2: number
        let value: string
        cw01_vars.asset_name = asset
        basic.pause(100)
        let request: string = "GET /device/" + cw01_vars.DEVICE_ID + "/asset/" + cw01_vars.asset_name + "/state" + " HTTP/1.1" + cw01_vars.NEWLINE +
            "Host: api.allthingstalk.io" + cw01_vars.NEWLINE +
            "User-Agent: CW01/1.0" + cw01_vars.NEWLINE +
            "Accept: */*" + cw01_vars.NEWLINE +
            "Authorization: Bearer " + cw01_vars.TOKEN + cw01_vars.NEWLINE + cw01_vars.NEWLINE

        basic.showLeds(`
        . . . . .
        . . . . .
        # . # . #
        . . . . .
        . . . . .
        `)

        serial.writeString("AT+CIPSEND=" + (request.length + 2).toString() + cw01_vars.NEWLINE)
        basic.pause(400)
        serial.writeString(request + cw01_vars.NEWLINE)
        basic.pause(400)
        serial.writeString("AT+CIPRECVDATA=200" + cw01_vars.NEWLINE)
        basic.pause(100)
        serial.readString()
        basic.pause(400)
        serial.writeString("AT+CIPRECVDATA=200" + cw01_vars.NEWLINE)
        basic.pause(400)
        cw01_vars.res += serial.readString()
        index1 = cw01_vars.res.indexOf("\"value\":") + "\"value\":".length
        index2 = cw01_vars.res.indexOf("}", index1)
        value = cw01_vars.res.substr(index1, index2 - index1)

        return value
    }

    /**
    * Connect to Ubidots IoT platform
    */
    //% weight=91 color=#f2ca00
    //% group="Ubidots"
    //% blockId="connectToUbidots" block="CW01 connect to Ubidots %user| with token %TKN"
    export function connectToUbidots(User: USER, TKN: string): void {
        switch (User) {
            case USER.INDUSTRIAL: cw01_vars.select = true;
            case USER.EDUCATIONAL: cw01_vars.select = false;
        }
        cw01_vars.TOKEN = TKN
        serial.writeString("AT+CIPSTART=\"TCP\",\"things.ubidots.com\",80" + cw01_vars.NEWLINE)
        basic.pause(500)
    }

    /**
    * Get latest value of variable from Ubidots IoT platform
    */
    //% weight=91 color=#f2ca00
    //% group="Ubidots"
    //% blockId="IoTgetValuefromUbidots" block="CW01 get value from Ubidots device %device variable %variable"
    export function IoTgetValuefromUbidots(device: string, variable: string): string {
        cw01_vars.res = ""
        let value: string
        let index1: number
        let index2: number
        let industrial: string = "industrial.api.ubidots.com"
        let educational: string = "things.ubidots.com"
        let server: string
        if (cw01_vars.select) {
            server = industrial
        } else {
            server = educational
        }
        let request: string = "GET /api/v1.6/devices/" + device + "/" + variable + "/values/?page_size=1 HTTP/1.1" + cw01_vars.NEWLINE +
            "Host: " + server + cw01_vars.NEWLINE +
            "User-Agent: CW01/1.0" + cw01_vars.NEWLINE +
            "Accept: */*" + cw01_vars.NEWLINE +
            "X-Auth-Token: " + cw01_vars.TOKEN + cw01_vars.NEWLINE +
            "Content-Type: application/json" + cw01_vars.NEWLINE + cw01_vars.NEWLINE
        //"Content-Length: " + (payload.length).toString() + NEWLINE + NEWLINE + payload + NEWLINE



        serial.writeString("AT+CIPSEND=" + (request.length).toString() + cw01_vars.NEWLINE)
        basic.pause(400)
        serial.writeString(request)
        basic.pause(1000)

        serial.writeString("AT+CIPRECVDATA=200" + cw01_vars.NEWLINE)
        basic.pause(400)
        serial.readString()
        serial.writeString("AT+CIPRECVDATA=100" + cw01_vars.NEWLINE)
        basic.pause(400)
        serial.readString()
        basic.pause(100)
        serial.writeString("AT+CIPRECVDATA=200" + cw01_vars.NEWLINE)
        basic.pause(400)
        cw01_vars.res += serial.readString()
        basic.pause(400)

        index1 = cw01_vars.res.indexOf("\"value\": ") + "\"value\": ".length
        index2 = cw01_vars.res.indexOf("]", index1)
        value = cw01_vars.res.substr(index1, index2 - index1 - 1)

        return value

    }

    /**
    * Send numerical value to Ubidots IoT platform. Select loc to true if you want to send GPS
    * location entered with IoTaddLocation block
    */
    //% weight=91 color=#f2ca00
    //% group="Ubidots"
    //% blockId="IoTSendValueToUbidots" block="CW01 send value %value to Ubidots device %device variable %variable , include location %loc"
    export function IoTSendValueToUbidots(value: number, device: string, variable: string, loc: boolean): void {

        let payload: string = "{\"value\": " + value.toString() + "}"

        if (loc) {
            payload = "{\"value\": " + value.toString() + ", \"context\": {\"lat\": " + cw01_vars.latitude.toString() + ", \"lng\": " + cw01_vars.longitude.toString() + "}}"
        }

        let industrial: string = "industrial.api.ubidots.com"
        let educational: string = "things.ubidots.com"
        let server: string
        if (cw01_vars.select) {
            server = industrial
        } else {
            server = educational
        }
        let request: string = "POST /api/v1.6/devices/" + device + "/" + variable + "/values HTTP/1.1" + cw01_vars.NEWLINE +
            "Host: " + server + cw01_vars.NEWLINE +
            "User-Agent: CW01/1.0" + cw01_vars.NEWLINE +
            "X-Auth-Token: " + cw01_vars.TOKEN + cw01_vars.NEWLINE +
            "Content-Type: application/json" + cw01_vars.NEWLINE +
            "Accept: */*" + cw01_vars.NEWLINE +
            "Content-Length: " + (payload.length).toString() + cw01_vars.NEWLINE + cw01_vars.NEWLINE + payload + cw01_vars.NEWLINE



        serial.writeString("AT+CIPSEND=" + (request.length).toString() + cw01_vars.NEWLINE)
        basic.pause(100)
        serial.writeString(request)
        basic.pause(1000)

        get_status()

        basic.pause(100)
        serial.writeString("AT+CIPRECVDATA=400" + cw01_vars.NEWLINE)
        basic.pause(100)
        serial.readString()
    }

    /**
    * Connect to Microsoft Azure cloud computing platform
    */
    //% weight=91 color=#4B0082
    //% group="Azure"
    //% blockId="connectToAzure" block="CW01 connect to Azure with access enpoint %access"
    export function connectToAzure(access: string): void {
        serial.writeString("AT+CIPSTART=\"TCP\",\"proxy.xinabox.cc\",80" + cw01_vars.NEWLINE)
        basic.pause(500)
        cw01_vars.azureAccess = access
    }

    /**
    * Send string data to Microsoft Azure cloud computing platform
    */
    //% weight=91 color=#4B0082
    //% group="Azure"
    //% blockId="IoTSendStringToAzure" block="CW01 update Azure variable %asset with string %value"
    export function IoTSendStringToAzure(asset: string, value: string): void {

        let payload: string = "{\"" + asset + "\": " + value + "}"

        let request: string = "POST /135/" + cw01_vars.azureAccess + " HTTP/1.1" + cw01_vars.NEWLINE +
            "Host: proxy.xinabox.cc" + cw01_vars.NEWLINE +
            "User-Agent: CW01/1.0" + cw01_vars.NEWLINE +
            "Content-Type: application/json" + cw01_vars.NEWLINE +
            "Accept: */*" + cw01_vars.NEWLINE +
            "Content-Length: " + (payload.length).toString() + cw01_vars.NEWLINE + cw01_vars.NEWLINE + payload + cw01_vars.NEWLINE



        serial.writeString("AT+CIPSEND=" + (request.length).toString() + cw01_vars.NEWLINE)
        basic.pause(100)
        serial.writeString(request)
        basic.pause(10)
        serial.readString()
        basic.pause(1000)

        if (!get_status()) {
            connectToAzure(cw01_vars.azureAccess)
        }
    }

    /**
    * Send numerical value to Microsoft Azure cloud computing platform
    */
    //% weight=91 color=#4B0082
    //% group="Azure"
    //% blockId="IoTSendValueToAzure" block="CW01 update Azure variable %asset with value %value"
    export function IoTSendValueToAzure(asset: string, value: number): void {
        let payload: string = "{\"" + asset + "\": " + value.toString() + "}"

        let request: string = "POST /135/" + cw01_vars.azureAccess + " HTTP/1.1" + cw01_vars.NEWLINE +
            "Host: proxy.xinabox.cc" + cw01_vars.NEWLINE +
            "User-Agent: CW01/1.0" + cw01_vars.NEWLINE +
            "Content-Type: application/json" + cw01_vars.NEWLINE +
            "Accept: */*" + cw01_vars.NEWLINE +
            "Content-Length: " + (payload.length).toString() + cw01_vars.NEWLINE + cw01_vars.NEWLINE + payload + cw01_vars.NEWLINE



        serial.writeString("AT+CIPSEND=" + (request.length).toString() + cw01_vars.NEWLINE)
        basic.pause(100)
        serial.writeString(request)
        basic.pause(10)
        serial.readString()
        basic.pause(1000)

        if (!get_status()) {
            connectToAzure(cw01_vars.azureAccess)
        }
    }

    //% weight=91
    //% group="MQTT"
    //% blockId="IoTMQTTConnect" block="CW01 connect to MQTT broker URL %broker with Username %Username and Password %Password"
    export function IoTMQTTConnect(broker: string, Username: string, Password: string): void {

        serial.writeString("AT+CIPSTART=\"TCP\",\"" + broker + "\",1883" + cw01_vars.NEWLINE)
        basic.pause(2000)

        let protocol_name_prior: Buffer = pins.packBuffer("!H", [4])
        let protocol_name: string = "MQTT"
        let protocol_lvl: Buffer = pins.packBuffer("!B", [4])
        //let msg_part_one: string = protocol_name + protocol_lvl
        let connect_flags: Buffer = (pins.packBuffer("!B", [(1 << 7) | (1 << 6) | (1 << 1)]))
        let keep_alive: Buffer = pins.packBuffer("!H", [3600])
        let client_id: string = "CW01/1.1"
        let client_id_len: Buffer = pins.packBuffer("!H", [client_id.length])
        let username: string = Username
        let username_len: Buffer = pins.packBuffer("!H", [username.length])
        let password: string = Password
        let password_len: Buffer = pins.packBuffer("!H", [password.length])
        //let msg_part_two = client_id_len + client_id + username_len + username + password_len + password

        serial.writeString("AT+CIPSEND=" + (1 + 1 + protocol_name_prior.length + protocol_name.length + protocol_lvl.length + connect_flags.length + keep_alive.length + client_id_len.length + client_id.length + username_len.length + username.length + password_len.length + password.length) + cw01_vars.NEWLINE)
        basic.pause(1000)
        /*serial.writeBuffer(pins.packBuffer("!B", [4]))
        serial.writeBuffer(pins.packBuffer("!B", [4]))*/

        //Msg part one
        serial.writeBuffer(pins.packBuffer("!B", [1 << 4]))
        serial.writeBuffer(pins.packBuffer("!B", [protocol_name_prior.length + protocol_name.length + protocol_lvl.length + connect_flags.length + keep_alive.length + client_id_len.length + client_id.length + username_len.length + username.length + password_len.length + password.length]))

        //Msg part two
        serial.writeBuffer(protocol_name_prior)
        serial.writeString(protocol_name)
        serial.writeBuffer(protocol_lvl)
        serial.writeBuffer(connect_flags)
        serial.writeBuffer(keep_alive)
        serial.writeBuffer(client_id_len)
        serial.writeString(client_id)
        serial.writeBuffer(username_len)
        serial.writeString(username)
        serial.writeBuffer(password_len)
        serial.writeString(password)

        basic.pause(1000)
    }


    //% weight=91
    //% group="MQTT"
    //% blockId="IoTMQTTSendValue" block="CW01 send JSON %Json to topic %Topic"
    export function IoTMQTTSendValue(Json: string, Topic: string): void {

        //Msg part two
        let topic: string = Topic
        let topic_len: Buffer = pins.packBuffer("!H", [topic.length])
        let value: string = Json

        //Msg part one
        let start_byte: Buffer = pins.packBuffer("!B", [0x30])
        let msg_part_two_len: Buffer = pins.packBuffer("!B", [topic_len.length + topic.length + value.length])

        serial.writeString("AT+CIPSEND=" + (start_byte.length + msg_part_two_len.length + topic_len.length + topic.length + value.length) + cw01_vars.NEWLINE)

        basic.pause(1000)

        basic.showIcon(IconNames.Target)

        serial.writeBuffer(start_byte)
        serial.writeBuffer(msg_part_two_len)

        serial.writeBuffer(topic_len)
        serial.writeString(topic)
        serial.writeString(value)

        basic.pause(1000)

        basic.showString("")

    }

    //% weight=91
    //% group="MQTT"
    //% blockId="IoTMQTTSubscribe" block="CW01 subscribe to topic %Topic"
    export function IoTMQTTSubscribe(Topic: string): void {

        //Msg part two
        let pid: Buffer = pins.packBuffer("!H", [0xDEAD])
        let qos: Buffer = pins.packBuffer("!B", [0x00])
        let topic: string = Topic
        let topic_len: Buffer = pins.packBuffer("!H", [topic.length])
        cw01_vars.mqtt_topic = topic

        cw01_vars.topics[cw01_vars.topic_count] = topic
        cw01_vars.topic_count++

        //Msg part one
        let ctrl_pkt: Buffer = pins.packBuffer("!B", [0x82])
        let remain_len: Buffer = pins.packBuffer("!B", [pid.length + topic_len.length + topic.length + qos.length])

        serial.writeString("AT+CIPSEND=" + (ctrl_pkt.length + remain_len.length + pid.length + topic_len.length + topic.length + qos.length) + cw01_vars.NEWLINE)

        basic.pause(1000)

        serial.writeBuffer(ctrl_pkt)
        serial.writeBuffer(remain_len)
        serial.writeBuffer(pid)
        serial.writeBuffer(topic_len)
        serial.writeString(topic)
        serial.writeBuffer(qos)

        basic.pause(2000)

        serial.writeString("AT+CIPRECVDATA=200" + cw01_vars.NEWLINE)
        basic.pause(100)
        serial.readString()


        cw01_vars.timer = input.runningTime()
    }

    //% weight=91
    //% group="MQTT"
    //% blockId="IoTMQTTping" block="CW01 ping MQTT"
    export function IoTMQTTping() {
        //Header
        if ((input.runningTime() - cw01_vars.timer) > 300000) {
            cw01_vars.timer = input.runningTime()
            let header_one: Buffer = pins.packBuffer("!B", [0xC0])
            let header_two: Buffer = pins.packBuffer("!B", [0x00])

            serial.writeString("AT+CIPSEND=" + (header_one.length + header_two.length) + cw01_vars.NEWLINE)
            basic.pause(100)

            serial.writeBuffer(header_one)
            serial.writeBuffer(header_two)

            basic.pause(500)
        }

    }

    //% weight=91
    //% group="MQTT"
    //% blockId="IoTMQTTRecordMessages" block="CW01 record MQTT messages"
    export function IoTMQTTRecordMessages(): void {
        serial.onDataReceived("\n", function () {
            if ((serial.readString()).includes("IPD")) {
                IoTMQTTGetData()
            }
        })

        basic.showString("#")
    }


    //% weight=91
    //% group="MQTT"
    //% blockId="IoTMQTTGetLatestData" block="CW01 get latest payload data"
    export function IoTMQTTGetLatestData(): string {

        let payload: string

        for (let i: number = 0; i < cw01_vars.topics.length; i++) {
            if (cw01_vars.mqtt_payload.includes(cw01_vars.topics[i])) {
                cw01_vars.topic_rcv = cw01_vars.topics[i]
                break
            } else {
                continue
            }
        }

        if (cw01_vars.prev_mqtt_payload.compare(cw01_vars.mqtt_payload) != 0) {
            let index: number = cw01_vars.mqtt_payload.indexOf(cw01_vars.topic_rcv) + cw01_vars.topic_rcv.length
            let payload_length: number = cw01_vars.mqtt_payload.length - index - 6
            payload = cw01_vars.mqtt_payload.substr(index, payload_length)
        } else {
            payload = ""
        }

        return payload

    }

    //% weight=91
    //% group="MQTT"
    //% blockId="IoTMQTTGetLatestTopic" block="CW01 get latest payload topic"
    export function IoTMQTTGetLatestTopic(): string {

        for (let i: number = 0; i < cw01_vars.topics.length; i++) {
            if (cw01_vars.mqtt_payload.includes(cw01_vars.topics[i])) {
                cw01_vars.topic_rcv = cw01_vars.topics[i]
                break
            } else {
                continue
            }
        }

        return cw01_vars.topic_rcv

    }

    function IoTMQTTGetData(): void {
        basic.pause(500)
        serial.writeString("AT+CIPRECVDATA=4" + cw01_vars.NEWLINE)
        basic.pause(300)
        serial.readString()
        serial.writeString("AT+CIPRECVDATA=200" + cw01_vars.NEWLINE)
        basic.pause(300)

        cw01_vars.mqtt_payload = serial.readString()
        basic.pause(100)
    }


    /**
    * Send boolean state to Microsoft Azure cloud computing platform
    */
    //% weight=91 color=#4B0082
    //% group="Azure"
    //% blockId="IoTSendStateToAzure" block="CW01 update Azure variable %asset with boolean state %value"
    export function IoTSendStateToAzure(asset: string, value: boolean): void {

        let payload: string = "{\"" + asset + "\": " + value + "}"

        let request: string = "POST /135/" + cw01_vars.azureAccess + " HTTP/1.1" + cw01_vars.NEWLINE +
            "Host: proxy.xinabox.cc" + cw01_vars.NEWLINE +
            "User-Agent: CW01/1.0" + cw01_vars.NEWLINE +
            "Content-Type: application/json" + cw01_vars.NEWLINE +
            "Accept: */*" + cw01_vars.NEWLINE +
            "Content-Length: " + (payload.length).toString() + cw01_vars.NEWLINE + cw01_vars.NEWLINE + payload + cw01_vars.NEWLINE



        serial.writeString("AT+CIPSEND=" + (request.length).toString() + cw01_vars.NEWLINE)
        basic.pause(100)
        serial.writeString(request)
        basic.pause(10)
        serial.readString()
        basic.pause(1000)

        if (!get_status()) {
            connectToAzure(cw01_vars.azureAccess)
        }
    }

    /**
    * Get value from Microsoft Azure cloud computing platform. Value can be string, numerical and boolean.
    */
    //% weight=91 color=#4B0082
    //% group="Azure"
    //% blockId="IoTGetValueFromAzure" block="CW01 get latest value of Azure variable %asset"
    export function IoTGetValueFromAzure(asset: string): string {

        let value: string
        let index1: number
        let index2: number
        let searchString: string = "\"" + asset + "\":"
        let i: number = 0

        let payload: string = "{}"

        let request: string = "POST /135/" + cw01_vars.azureAccess + " HTTP/1.1" + cw01_vars.NEWLINE +
            "Host: proxy.xinabox.cc" + cw01_vars.NEWLINE +
            "User-Agent: CW01/1.0" + cw01_vars.NEWLINE +
            "Content-Type: application/json" + cw01_vars.NEWLINE +
            "Accept: */*" + cw01_vars.NEWLINE +
            "Content-Length: " + (payload.length).toString() + cw01_vars.NEWLINE + cw01_vars.NEWLINE + payload + cw01_vars.NEWLINE



        serial.writeString("AT+CIPSEND=" + (request.length).toString() + cw01_vars.NEWLINE)
        basic.pause(100)
        serial.writeString(request)
        basic.pause(10)
        serial.readString()

        for (; i < 10; i++) {
            if (getDataLen() < 1000) {
                continue
            } else {
                break
            }
        }

        if (i == 10) {
            connectToAzure(cw01_vars.azureAccess)
        }


        serial.writeString("AT+CIPRECVDATA=1100" + cw01_vars.NEWLINE)
        basic.pause(200)
        serial.readString()
        serial.writeString("AT+CIPRECVDATA=200" + cw01_vars.NEWLINE)
        basic.pause(200)
        cw01_vars.res = serial.readString()

        if (cw01_vars.res.includes(asset)) {
            index1 = cw01_vars.res.indexOf(searchString) + searchString.length
            index2 = cw01_vars.res.indexOf("}", index1)
            value = cw01_vars.res.substr(index1, index2 - index1)
        } else {

            value = ""

        }

        return value

    }

    /**
    * Add your GPS location
    */
    //% weight=91 color=#f2ca00
    //% group="Ubidots"
    //% blockId="IoTaddLocation" block="CW01 latitude is %lat and longitude is %lng"
    export function IoTaddLocation(lat: number, lng: number): void {
        cw01_vars.latitude = lat
        cw01_vars.longitude = lng
    }

    function getDataLen(): number {

        let index1: number
        let index2: number
        let searchString: string = ":"
        let value: string

        serial.writeString("AT+CIPRECVLEN?" + cw01_vars.NEWLINE)
        basic.pause(300)
        cw01_vars.res = serial.readString()
        index1 = cw01_vars.res.indexOf(searchString) + searchString.length
        index2 = cw01_vars.res.indexOf(",", index1)
        value = cw01_vars.res.substr(index1, index2 - index1)

        return parseInt(value)

    }

    function get_status(): boolean {

        serial.writeString("AT+CIPRECVDATA=200" + cw01_vars.NEWLINE)
        basic.pause(100)
        cw01_vars.res = serial.readString()

        if (cw01_vars.res.includes("HTTP/1.1 200") || cw01_vars.res.includes("HTTP/1.1 201") || cw01_vars.res.includes("HTTP/1.0 202")) {
            basic.showIcon(IconNames.Yes)
            basic.pause(100)
            basic.showString("")
            return true
        } else {
            basic.showIcon(IconNames.No)
            basic.pause(100)
            basic.showString("")
            return false
        }
    }

} 
