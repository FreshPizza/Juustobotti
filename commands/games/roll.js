module.exports = {
    name: 'roll',
    description: 'get random number yes',
    detailedDescription: 'YEEHAW RANDOM NUMBER GENERATOR!!!!!!!!!!',
    execute(message, args){
        function getRandomBetween(max) {
            return Math.random() * (max - 0) + 0
        }
        let number = getRandomBetween(100)
        message.channel.send(`You got ${Math.floor(number)}`)
    }
}