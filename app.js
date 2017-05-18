const Animal = require('./models/animal.js')
const Email = require('./models/email-notificacao.js')
const User = require('./models/user.js')
const nodemailer = require('nodemailer')
const _ = require('underscore')
const schedule = require('node-schedule')

exports.MonitorarNotificacoes = () => {
    let rule = new schedule.RecurrenceRule()
    rule.second = [0, 10, 20, 30, 40, 50]

    let j = schedule.scheduleJob(rule, () => {
        ConsultarNotificacoes((sucesso) => {
            console.info('Email enviado: ' + sucesso)
        })
    })
}

exports.RemoverNotificacoes = () => {
    let rule = new schedule.RecurrenceRule()
    rule.second = [0, 20, 40]

    let j = schedule.scheduleJob(rule, () => {
        Email.remove({ 'enviada': true }, (err, result) => {
            console.log('Removida')
        })
    })
}

var ConsultarNotificacoes = (callback) => {
    Email.find({}, (err, notificacoes) => {
        let _notificacoes = notificacoes
        _.each(notificacoes, (notificacao) => {
            SepararEmails(notificacao, (sucesso) => {
                if (sucesso) {
                    notificacao.enviada = true
                    notificacao.save((err, doc) => {
                        if (err) console.error(err)

                        callback(sucesso)
                    })
                }

            })
        })

    })
}

var SepararEmails = (notificacao, callback) => {
    User.find({ 'local.email': notificacao.usuario }, (err, usuario) => {
        if (err) return callback(false)
        console.log(usuario[0].local.subscribers)
        _.each(usuario[0].local.subscribers, (assinante) => {
            if (!notificacao.enviada) {
                EnviarEmail(notificacao, assinante.email, (sucesso) => {
                    callback(sucesso)
                })
            }
        })
    })
}

var EnviarEmail = (notificacao, assinante, callback) => {
    let notificacaoOpts = {
        from: 'Bichinhos',
        to: assinante,
        subject: 'Um novo bichinho foi adicionado.',
        text: notificacao.mensagem
    }

    let smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        auth: {
            user: '__yourEmail',
            pass: '__yourPassword'
        }
    })

    smtpTransport.sendMail(notificacaoOpts, (err, response) => {
        if (err) return callback(false)

        console.log('O e-mail foi enviado para ' + notificacaoOpts.to + ', veja sua caixa de entrada :)')
        return callback(true)
    })
}

