'use strict'
const Client = require('@infosimples/node_two_captcha');
class TwoCaptcha {

    static async GetBalance(api) {
        var balance = new Client(api, {
            timeout: 600000,
            polling: 5000,
            throwErrors: true
        });
        try {


            return await balance.balance((b) => {
                return b
            });
        } catch (error) {
            return error.message
        }

    }
    static async GetToken(api, googlekey, pageurl) {
        var token = new Client(api, {
            timeout: 600000,
            polling: 5000,
            throwErrors: true
        });
        let result;

        try {

            console.log('aguarde...')
            await token.decodeRecaptchaV2({
                googlekey: googlekey,
                pageurl: pageurl
            }).then(async (response) => {
                result = await response['_text']


            }).catch(async (erro) => {

                result = erro.message
            })

        } catch (error) {
            result = error.message

        }
        return result
    }
}
module.exports = TwoCaptcha;
