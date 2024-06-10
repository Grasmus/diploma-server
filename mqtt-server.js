PropertiesReader = require('properties-reader');
const deafultPort = 1883

class MqttServer {
    #aedes = require('aedes')();
    #server = require('net').createServer(this.#aedes.handle);
    #port = deafultPort;
    #propertiesReader = PropertiesReader('local.properties');
    
    constructor() {
        this.#server.listen(this.#port, function () {
            console.log(`MQTT Broker running on port: ${deafultPort}`);
        });

        this.#aedes.authenticate = (client, username, password, callback) => {
            if (password == undefined || username == undefined) {
                const error = new Error('Authentication Failed!! Invalid user credentials.');

                console.log('Error ! Authentication failed.')
                return callback(error, false)
            }

            password = Buffer.from(password, 'base64').toString();

            if (username === this.#propertiesReader.get('username') && password === this.#propertiesReader.get('password')) {
                return callback(null, true);
            }
            const error = new Error('Authentication Failed!! Invalid user credentials.');
            console.log('Error ! Authentication failed.')
            return callback(error, false)
        }

        this.#aedes.authorizePublish = (client, packet, callback) => {
            if (packet.topic === 'airQuality') {
                return callback(null);
            }
            console.log('Error ! Unauthorized publish to a topic.')
            return callback(new Error('You are not authorized to publish on this message topic.'));
        }

        this.#aedes.on('client', function (client) {
            let currentDate = new Date(); 

            console.log(`[${currentDate.toLocaleString()}] Client ${(client ? client.id : client)} connected to broker`)
        })

        this.#aedes.on('clientDisconnect', function (client) {
            let currentDate = new Date(); 

            console.log(`[${currentDate.toLocaleString()}] Client ${(client ? client.id : client)} disconnected from the broker`)
        })

        this.#aedes.on('subscribe', function (subscriptions, client) {
            let currentDate = new Date(); 

            console.log(`[${currentDate.toLocaleString()}] Client ${(client ? client.id : client)} subscribed to topics: ${subscriptions.map(s => s.topic).join(',')}`)
        })

        this.#aedes.on('unsubscribe', function (subscriptions, client) {
            let currentDate = new Date(); 

            console.log(`[${currentDate.toLocaleString()}] Client ${(client ? client.id : client)} unsubscribed to topics: ${subscriptions.join(',')}`)
        })
    }

    onReceiveMessage(callback) {
        this.#aedes.on('publish', async function (packet, client) {
            let currentDate = new Date(); 
            
            if (client) {
                console.log(`[${currentDate.toLocaleString()}] Client ${(client ? client.id : 'Unknown')} has published message on ${packet.topic}`)

                callback(packet.payload);
            }
        })
    }
}

module.exports = MqttServer;
