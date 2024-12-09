const express = require('express');
const cors = require('cors')
const puppeteer = require('puppeteer');

const app = express();
const port = 3002

// cors with figma plugins https://www.figma.com/plugin-docs/making-network-requests/
// this is essentially Access-Control-Allow-Origin: * for all routes
app.use(cors())
// to allow body parser in http request
app.use(express.json());

app.post('/', async (request, response) => {
    console.log('received', request.body)
    if(!request.body) response.status(500).json({ error: 'no data or incorrect data received'});
    else {
        const links = request.body.links
        const snapshots = []
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        response.setHeader('Content-Type', 'application/json');
        try {
            for (const link of links) {
                await page.goto(link);
                await page.setViewport({ width: 300, height: 480 });
                const snapshot = await page.screenshot({ encoding: 'base64', fullPage: true });
                snapshots.push(snapshot)
            }
            await browser.close();
            response.status(200).send({ snapshots });
        } catch (error) {
            console.log(error)
            response.status(500).send({ snapshots });
        }   
        console.log('responded',  snapshots.map((snapshot) => snapshot.length))
        
    }
})

app.listen(port, () => {
    console.log(`Listening to port: ${port}`)
});
