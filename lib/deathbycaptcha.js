'use strict'
const dbc = require('./Deathbycaptcha.class.js');

// Proxy and Recaptcha token data


// Death By Captcha Socket Client

// const client = new dbc.HttpClient(username, password) for http client
class Deathbycaptcha {

  static async GetBalance(username, password) {
    const balance = new dbc(username, password);
    try {

      return await balance.getProfile((b) => {console.log(b) });

    } catch (error) {
      return error.message
    }
  }
  static async GetToken(username, password, googlekey, pageurl) {
    let result;
    const token_params = JSON.stringify({
      
      'googlekey': googlekey,
      'pageurl': pageurl
    });
    const token = new dbc(username, password);
    try {

      result = await token.decode({ extra: { type: 4, token_params: token_params } }, (captcha) => { });

    } catch (error) {
      result = error.message
    }
    return result
  }


}
module.exports = Deathbycaptcha;
