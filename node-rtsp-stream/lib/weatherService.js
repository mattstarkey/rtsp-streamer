(function() {

    const key = '1f835b14ed768aa2e8b81d67719d92fb';
const https = require('https');

function WeatherService() {
    this.cityJson = "";
}

WeatherService.prototype.getWeatherJson = function (cityId) {

    return new Promise((resolve, reject) => {
        https.get(`https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&APPID=${key}`, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(data);
                this.cityJson = data;
            });

        }).on("error", (err) => {
            reject(err);
            console.log("Error: " + err.message);
        });
    });

}

module.exports = WeatherService;

}).call(this);