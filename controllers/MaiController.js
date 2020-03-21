'use strict'

const twocaptcha = require('../lib/twocaptcha')
const deathby = require('../lib/deathbycaptcha')
const amqp = require('amqplib/callback_api');
const url = "amqp://oxnuultd:HlIacjNxeTxeGVTBzJW5_d7kK84Jda0_@lion.rmq.cloudamqp.com/oxnuultd"
module.exports = {

    async getToken(req, res) {
        let site = req.body.site.name
        let dados = req.body;
        let result;
        console.log(site)
        switch (site) {
            case 'twocaptcha':
                if (dados.rabbitmq) {
                    var queue = dados.id + '#' + 'tokenRecaptcha';
                    var msg = await twocaptcha.GetToken(dados.site.api, dados.googlekey, dados.pageurl);

                    try {
                        if (msg != '') {
                            amqp.connect(url, (error0, connection) => {
                                if (error0) {
                                    throw error0;
                                }
                                connection.createChannel(async (error1, channel) => {
                                    if (error1) {
                                        throw error1;
                                    }

                                    channel.assertQueue(queue, {
                                        durable: false,
                                        autoDelete: true,
                                        expires: 90000
                                    });
                                    channel.sendToQueue(queue, Buffer.from(msg));

                                });
                                setTimeout(function () {
                                    connection.close();
                                    //process.exit(0);
                                }, 500);
                            });

                            result = queue + ' send to RabbitMQ OK'
                        } else {
                            result = queue + ''
                        }

                    } catch (error) {
                        return res.json(error.message)
                    }


                } else {
                    result = await twocaptcha.GetToken(dados.site.api, dados.googlekey, dados.pageurl)
                }
                break;

            case 'deathbycaptcha':
                if (dados.rabbitmq) {
                    var queue = dados.id + '#' + 'tokenRecaptcha';
                    var msg = await twocaptcha.GetToken(dados.site.api, dados.googlekey, dados.pageurl);
                    if (msg != '') {
                        try {
                            if (msg != '') {
                                amqp.connect(url, (error0, connection) => {
                                    if (error0) {
                                        throw error0;
                                    }
                                    connection.createChannel(async (error1, channel) => {
                                        if (error1) {
                                            throw error1;
                                        }

                                        channel.assertQueue(queue, {
                                            durable: false,
                                            autoDelete: true,
                                            expires: 90000
                                        });
                                        channel.sendToQueue(queue, Buffer.from(msg));

                                    });
                                    setTimeout(function () {
                                        connection.close();
                                        //process.exit(0);
                                    }, 500);
                                });

                                result = queue + ' send to RabbitMQ OK'
                            } else {
                                result = queue + ''
                            }

                        } catch (error) {
                            return res.json(error.message)
                        }
                    } else {
                        result = await deathby.GetToken(dados.site.username, dados.site.password, dados.googlekey, dados.pageurl)
                    }

                    break;
                }
            default:
                result = "nome do site incorreto, envie uma das opções ['twocaptcha','deathbycaptcha']"
                break;
        }
        return res.json(result)
    },
    async getBalance(req, res) {
        let site = req.body.site.name
        let dados = req.body;
        let result;

        switch (site) {
            case 'twocaptcha':
                result = await twocaptcha.GetBalance(dados.site.api)
                break;
            case 'deathbycaptcha':
                try {

                    let b = await deathby.GetBalance(dados.site.username, dados.site.password)
                    let r = JSON.parse(b)
                    result = parseFloat((r.balance / 100).toFixed(2))

                } catch (error) {
                    result = error.message
                }
                break;

            default:
                result = "nome do site incorreto, envie uma das opções ['twocaptcha','deathbycaptcha']"
                break;
        }
        return res.json(result)
    }
}
