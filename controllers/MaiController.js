"use strict";

const twocaptcha = require("../lib/twocaptcha");
const deathby = require("../lib/deathbycaptcha");
const Redis = require("redis");
const Cache = Redis.createClient(6379, "redis");
const Logs = require("./model/logs");
module.exports = {
  async getToken(req, res) {
    let site = req.body.site.name;
    let dados = req.body;
    let result;
    switch (site) {
      case "twocaptcha":
        if (dados.redis) {
          try {
            const token = await twocaptcha.GetToken(
              dados.site.api,
              dados.googlekey,
              dados.pageurl
            );
            let er = token.substr(0, 2);
            if (token != "" && er == "03") {
              Cache.set(req.body.id + "token", token);
              Cache.expire(req.body.id + "token", 90);
            } else {
              let l = new Logs({
                arq: "MainController#api#2captcha",
                type: "error",
                msg: token
              });
              l.save();
              Cache.set(req.body.id + "errotoken", token);
            }
            //
          } catch (error) {
            let l = new Logs({
              arq: "MainController#api#captcha",
              type: "error",
              msg: error.message
            });
            l.save();
            ///
          }
          //
        } else {
          try {
            result = await twocaptcha.GetToken(
              dados.site.api,
              dados.googlekey,
              dados.pageurl
            );
            let er = result.substr(0, 2);
            if (er == "03") {
              let l = new Logs({
                arq: "MainController#api#2captcha",
                type: "error",
                msg: er
              });
              l.save();
            }
          } catch (error) {
            let l = new Logs({
              arq: "MainController#api#captcha",
              type: "error",
              msg: error.message
            });
            l.save();
            result = {
              erro: error.message
            };
          }
        }
        break;
        
      case "deathbycaptcha":
          try {
            result = await deathby.GetToken(
              dados.site.username,
              dados.site.password,
              dados.googlekey,
              dados.pageurl
            );
            console.log(result)
          } catch (error) {
              console.log(error.message)
            let l = new Logs({
              arq: "MainController#api#captcha",
              type: "error",
              msg: error.message
            });
            l.save();
            result = {
              erro: error.message
            };
          }
        
        break;
      default:
        result =
          "nome do site incorreto, envie uma das opções ['twocaptcha','deathbycaptcha']";
        break;
    }
    return res.json(result);
  },
  async getBalance(req, res) {
    let site = req.body.site.name;
    let dados = req.body;
    let result;
    switch (site) {
      case "twocaptcha":
        try {
          result = await twocaptcha.GetBalance(dados.site.api);

          if (result == "The key you've provided does not exists.") {
            let l = new Logs({
              arq: "MainController#api#captcha#balance",
              type: "error",
              msg: result
            });
            l.save();
          }
        } catch (error) {
          let l = new Logs({
            arq: "MainController#api#captcha",
            type: "error",
            msg: error.message
          });
          l.save();
          result = error.message;
        }
        break;
      case "deathbycaptcha":
        try {
          let b = await deathby.GetBalance(
            dados.site.username,
            dados.site.password
          );

          let r = JSON.parse(b);
          result = {
            is_banned: r.is_banned,
            status: r.status,
            rate: r.rate,
            balance: parseFloat((r.balance / 100).toFixed(2)),
            user: r.user
          };
        } catch (error) {
          let l = new Logs({
            arq: "MainController#api#captcha",
            type: "error",
            msg: error.message
          });
          l.save();
          result = error.message;
        }
        break;

      default:
        result =
          "nome do site incorreto, envie uma das opções ['twocaptcha','deathbycaptcha']";
        break;
    }
    return res.json(result);
  }
};
