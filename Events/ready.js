const mongoose = require("mongoose");
const mongoPath = process.env.MONGO_URI;
const { MessageEmbed } = require('discord.js')
const gamesSchema = require('../Models/gamesSchema')
const statsSchema = require('../Models/statsSchema')

module.exports = {
    name: 'ready',
    description: 'on startup | expired games',
    on: true,
    async execute (client) {
        console.log('Wrdl Bot online!')

        await mongoose.connect(mongoPath, {
            keepAlive: true
        }).then(() => {
            console.log('Connected to the database!')
        }).catch((err) => {
            console.log(err)
        });
        client.user.setActivity({
            name: `wordle games | /help`,
            type: 'WATCHING'
        })
        client.user.setStatus('online')

        //Check for inactive games
        const check = async () => {
            /*

            Check for expired inside of guild

            */
            let Guilds = client.guilds.cache.map(guild => guild.id)
            for (let guild of Guilds) {
                guild = client.guilds.cache.get(guild)
                let expires1 = new Date()
                let dt = new Date(expires1.getTime() + 120 * 60 * 1000)
                dt = dt.toLocaleString('ro-RO', { timezone: 'Europe/Bucharest' })
                const query = {
                    guildID: guild.id,
                    expires: {$lt: dt},
                }
                const results = await gamesSchema.find(query)
                try {
                    if (!isIterable(results)) {
                        let guildIDUser = results.guildID, userIDUser = results.userID
                        const query2 = {
                            guildID: guildIDUser,
                            userID: userIDUser,
                        }
                        await gamesSchema.deleteMany(query)
                        let schema = await statsSchema.findOne(query2)
                        schema.gamesLost = schema.gamesLost + 1
                        schema.winRate = Math.trunc(schema.gamesWon / schema.gamesTotal * 100)
                        await schema.save()
                        let channel = results.channelStarted
                        const message = new MessageEmbed()
                            .setTitle('Wordle Game')
                            .setColor('RED')
                            .setDescription(`<@${results.userID}>'s game has ended due to inactivity`)

                        await client.channels.cache.get(channel).send({ embeds: [message] })
                    }
                    else {
                        for (const result of results) {
                            let guildIDUser = result.guildID, userIDUser = result.userID
                            const query2 = {
                                guildID: guildIDUser,
                                userID: userIDUser,
                            }
                            await gamesSchema.deleteMany(query)
                            let schema2 = await statsSchema.findOne(query2)
                            schema2.gamesLost = schema2.gamesLost + 1
                            schema2.winRate = Math.trunc(schema2.gamesWon / schema2.gamesTotal * 100)
                            await schema2.save()
                            let channel = result.channelStarted
                            const message2 = new MessageEmbed()
                                .setTitle('Wordle Game')
                                .setColor('RED')
                                .setDescription(`<@${result.userID}>'s game has ended due to inactivity`)

                            await client.channels.cache.get(channel).send({ embeds: [message2] })
                        }
                    }
                } catch (err) {
                    console.log(err)
                }
            }

            /*

            Check for expired outside of guild

            */
            let expires1 = new Date()
            let dt = new Date(expires1.getTime() + 120 * 60 * 1000)
            dt = dt.toLocaleString('ro-RO', { timezone: 'Europe/Bucharest' })
            const query = {
                expires: {$lt: dt},
            }
            const results = await gamesSchema.find(query)
            try {
                if (!isIterable(results)) {
                    let guildIDUser = results.guildID, userIDUser = results.userID
                    const query2 = {
                        guildID: guildIDUser,
                        userID: userIDUser,
                    }
                    await gamesSchema.deleteMany(query)
                    let schema = await statsSchema.findOne(query2)
                    schema.gamesLost = schema.gamesLost + 1
                    schema.winRate = Math.trunc(schema.gamesWon / schema.gamesTotal * 100)
                    await schema.save()
                }
                else {
                    for (const result of results) {
                        let guildIDUser = result.guildID, userIDUser = result.userID
                        const query2 = {
                            guildID: guildIDUser,
                            userID: userIDUser,
                        }
                        await gamesSchema.deleteMany(query)
                        let schema2 = await statsSchema.findOne(query2)
                        schema2.gamesLost = schema2.gamesLost + 1
                        schema2.winRate = Math.trunc(schema2.gamesWon / schema2.gamesTotal * 100)
                        await schema2.save()
                    }
                }
            } catch (err) {
                console.log(err)
            }
            setTimeout(check, 1000 * 30)
        }
        await check()
    }
}

function isIterable(obj) {
    //checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}