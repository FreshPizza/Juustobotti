const Discord = require('discord.js')
module.exports = {
    name: 'weather',
    description: 'Get the weather of some place',
    detailedDescription: 'You wna know the weather? Now you can without looking outside!',
    usage: `weather [some place]`,
    execute(message = new Discord.Message, args = []){
        // Toteutetaas tää käyttäen openweathermap.org
        // https://openweathermap.org/current
        const axios = require('axios').default
        
        const isoCountries = require('../../isoCountries.json') // Thanks maephisto! https://gist.github.com/maephisto/9228207

        if(args.length == 0) return message.channel.send('Please specify what do you wanna know the weather of?') // voi myös lisätä 

        let apiKey = process.env.OPENWEATHERKEY
        let endpoint = 'https://api.openweathermap.org/data/2.5/weather?q='
        let iconendpoint = 'https://openweathermap.org/img/wn/' // https://openweathermap.org/weather-conditions
        
        // Esimerkki input ['lahti', 'fi']
        // Pyörii jokasella argumentilla listas
        for(i = 0; i < args.length; i++) {
            if(args[0] && !args[1]) break
            // Jos isoCountries listassa löytyy argumentti isoina kirjaimina (esim 'fi' isona löytyy listast)
            if( isoCountries.hasOwnProperty(args[i].toUpperCase()) ) {
                // Vaihtaa sen argumentin olemaa isoina kirjaimina (fi -> FI)
                args[args.indexOf(args[i])] = args[i].toUpperCase()
            } else if( isoCountries.hasOwnProperty(capitalize(args[i])) ) {
                // Jos ei, nii jos löytyy oikein isoina kirjaimina maa listasta (esim 'finland' löytyy listast 'Finland')
                // ni joo
                args[args.indexOf(args[i])] = capitalize(args[i])
                args[args.indexOf(args[i])] = getCountryCode(args[i])
            }
        }

        // Jos joku inputtaa esim ju!weather fi lahti, tää kääntää ympäri.
        // Parempi ois kattoo onks listas, ja sitte reverse,, jos ettii jotai kakskirjaimisii kaupunkei etc
        if(args[0].length == 2) args.reverse()

        let fetchUrl = `${endpoint}${args.join()}&units=metric&appid=${apiKey}`
        axios.get(fetchUrl).then(res => {
            if(res.status == '404') {
                message.channel.send('Not found! Check for typos or somthing')
                return
            }
            const data = res.data
            let weatherMap = new Map()
            weatherMap.set("location", getCountryName(data.sys.country))
            weatherMap.set("id", data.id)
            weatherMap.set("city", data.name)
            weatherMap.set("weather", data.weather[0].main)
            weatherMap.set("desc", data.weather[0].description)
            weatherMap.set("temp", data.main.temp) 
            weatherMap.set("feelslike", data.main.feels_like)
            weatherMap.set("windspeed", data.wind.speed) // metri per sekuntti
            weatherMap.set("clouds", data.clouds.all) // pilvisyyden määrä %

            let fields = [
                { name: 'Temperature', value: `${weatherMap.get('temp')}°C` },
                { name: 'Feels like', value:  `${weatherMap.get('feelslike')}°C` },
                { name: 'Wind speed', value: `${weatherMap.get('windspeed')} m/s` },
                // { name: '', value: `${weatherMap.}` },
                // { name: 'Temperature', value: `${weatherMap.}` },
                // { name: 'Temperature', value: `${weatherMap.}` },
                // { name: 'Temperature', value: `${weatherMap.}` },
                // { name: 'Temperature', value: `${weatherMap.}` },
            ]

            console

            // ° asteen merkki
            let weatherEmbed = new Discord.MessageEmbed()
                .setAuthor(`Weather in ${weatherMap.get('city')}, ${weatherMap.get('location')}`, `https://pizzakeitto.xyz/flags/flags-iso/shiny/32/${data.sys.country}.png`, `https://openweathermap.org/city/${data.id}`)
                .setDescription(`It is ${weatherMap.get('weather')} yes yes (${weatherMap.get('desc')})`)
                .setColor('#00f9f9')
                .setThumbnail(`${iconendpoint}${data.weather[0].icon}@2x.png`)
                .addFields(fields)
                .setFooter('Data from https://openweathermap.org/current')
                .setTimestamp(Date(data.dt))

            message.channel.send({embeds: [weatherEmbed]})
        }).catch(err => {
            message.channel.send(`Cant do, ${err.response.data.cod} ${err.response.data.message}`)
            console.log(err.message)
        })

        function getCountryName(countryCode) {
            if (isoCountries.hasOwnProperty(countryCode)) {
                return isoCountries[countryCode]
            } else {
                return countryCode
            }
        }

        // Basically turha, sama asia ku getCountryName()
        function getCountryCode(countryName) {
            if (isoCountries.hasOwnProperty(countryName)) {
                return isoCountries[countryName]
            } else {
                return countryName
            }
        }

        // Kopioitu suoraa netist, https://www.digitalocean.com/community/tutorials/js-capitalizing-strings
        function capitalize(string = "") {
            return string.trim().toLowerCase().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))
        }
    }
}
