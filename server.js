//packages
const express = require('express')
const axios = require('axios');

//Global Variables
const app = express()

const getPeople = async () => {
    let peopleResults = []
    let peopleUrl = 'https://swapi.dev/api/people/';
    //to wait to return results after the for loop completes, must use await on promisified axios.get method
    for (let i = 1; peopleUrl; i++) {
        let response = await axios.get(peopleUrl)
        let data = response.data
        peopleUrl = data.next
        peopleResults.push(...data.results)
    }
    return peopleResults
}
const getPlanets = async () => {
    let planetsResults = []
    let planetsUrl = 'https://swapi.dev/api/planets/'
    for (let i = 1; planetsUrl; i++) {
        let response = await axios.get(planetsUrl)
        let data = response.data
        planetsUrl = data.next
        planetsResults.push(...data.results)
    }
    planetsResults.forEach(async (planet, i) => {
        planet.residents.forEach(async (resident, index) => {
            const returnedResident = await axios.get(resident)
            planetsResults[i].residents.splice(index, 1, returnedResident.data.name)
        })
    })
    return planetsResults
}

//exposed url on our server
app.get('/people', async (req, res) => {
    if ((Object.keys(req.query).length > 0) && (req.query.sortBy !== "name" && req.query.sortBy !== "height" && req.query.sortBy !== "mass")) {
        res.send("<h1>You will sortBy something else...try name, height, or mass</h1>")
    }
    const peopleResults = await getPeople()
    if (Object.keys(req.query).length === 0) res.send(peopleResults)
    if (req.query.sortBy === "name") res.send(peopleResults.sort((a, b) => (a.name > b.name) ? 1 : -1))
    if (req.query.sortBy === "height") res.send(peopleResults.sort((a, b) => (a.height - b.height)))
    if (req.query.sortBy === "mass") res.send(peopleResults.sort((a, b) => (a.mass - b.mass)))
})
app.get('/planets', async (req, res) => {
    const planetsResults = await getPlanets()
    res.send(planetsResults)
})
//start server
port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`server is up on port ${port}`)
})