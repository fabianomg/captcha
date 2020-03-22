'use strict'

const twocaptcha = require('../lib/twocaptcha')
const deathby = require('../lib/deathbycaptcha')
const amqp = require('amqplib/callback_api');
const url = "amqp://elpatron:EKaXfG4RbMWrvrrX1Fd5rZ@rabbitmq:5672"
const Logs = require("./model/logs")
module.exports = {

    async getToken(req, res) {
        let site = req.body.site.name
        let dados = req.body;
        let result;
        switch (site) {
            case 'twocaptcha':
                if (dados.rabbitmq) {
                    const queue = dados.id + '#' + 'tokenRecaptcha';
                    try {
                        const msg = await twocaptcha.GetToken(dados.site.api, dados.googlekey, dados.pageurl);
                        if (msg != '') {
                            amqp.connect(url, (error0, connection) => {
                                connection.createChannel(async (error1, channel) => {
                                    channel.assertQueue(queue, {
                                        durable: false,
                                        autoDelete: true,
                                        expires: 90000
                                    });
                                    channel.sendToQueue(queue, Buffer.from(msg));
                                });
                                setTimeout(function () {
                                    connection.close();
                                }, 800);
                            });
                        }
                    } catch (error) {
                        let l = new Logs({ arq: 'MainController#api#captcha', type: 'error', msg: error.message })
                        l.save();
                        amqp.connect(url, (error0, connection) => {
                            connection.createChannel(async (error1, channel) => {
                                channel.assertQueue(queue, {
                                    durable: false,
                                    autoDelete: true,
                                    expires: 90000
                                });
                                channel.sendToQueue(queue, Buffer.from('ERROTOKEN'));
                            });
                            setTimeout(function () {
                                connection.close();
                            }, 800);
                        });
                    }
                } else {
                    try {
                        result = await twocaptcha.GetToken(dados.site.api, dados.googlekey, dados.pageurl)
                    } catch (error) {
                        let l = new Logs({ arq: 'ValidationController#api#captcha', type: 'error', msg: error.message })
                        l.save();
                        result = {
                            erro: error.message
                        }
                    }
                }
                break;

            case 'deathbycaptcha':
                if (dados.rabbitmq) {
                    var queue = dados.id + '#' + 'tokenRecaptcha';
                    try {
                        var msg = await twocaptcha.GetToken(dados.site.api, dados.googlekey, dados.pageurl);
                        if (msg != '') {
                            amqp.connect(url, (error0, connection) => {
                                connection.createChannel(async (error1, channel) => {
                                    channel.assertQueue(queue, {
                                        durable: false,
                                        autoDelete: true,
                                        expires: 90000
                                    });
                                    channel.sendToQueue(queue, Buffer.from(msg));
                                });
                                setTimeout(function () {
                                    connection.close();
                                }, 800);
                            });
                        } else {
                            try {
                                result = await deathby.GetToken(dados.site.username, dados.site.password, dados.googlekey, dados.pageurl)
                            } catch (error) {
                                let l = new Logs({ arq: 'ValidationController#api#captcha', type: 'error', msg: error.message })
                                l.save();
                                result = {
                                    erro: error.message
                                }
                            }
                        }
                    } catch (error) {
                        let l = new Logs({ arq: 'ValidationController#api#captcha', type: 'error', msg: error.message })
                        l.save();
                        amqp.connect(url, (error0, connection) => {
                            connection.createChannel(async (error1, channel) => {
                                channel.assertQueue(queue, {
                                    durable: false,
                                    autoDelete: true,
                                    expires: 90000
                                });
                                channel.sendToQueue(queue, Buffer.from('ERROTOKEN'));
                            });
                            setTimeout(function () {
                                connection.close();
                            }, 800);
                        });
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
                try {
                    result = await twocaptcha.GetBalance(dados.site.api)
                } catch (error) {
                    let l = new Logs({ arq: 'ValidationController#api#captcha', type: 'error', msg: error.message })
                    l.save();
                    result = error.message
                }
                break;
            case 'deathbycaptcha':
                try {
                    let b = await deathby.GetBalance(dados.site.username, dados.site.password)
                    let r = JSON.parse(b)
                    result = parseFloat((r.balance / 100).toFixed(2))

                } catch (error) {
                    let l = new Logs({ arq: 'ValidationController#api#captcha', type: 'error', msg: error.message })
                    l.save();
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
