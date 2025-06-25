const express = require('express');
const bodyParser=require('body-parser');

const app=express();

app.use((req,res,next)=>{
    console.log('Welcome to first middleware');
    next();
})
app.use((req,res,next)=>{
    console.log('Welcome to second middleware');
    next();
})

app.get("/",(req,res,next)=>{
    console.log('Handling response for /');
    res.send("<h1>Welcome to our website</h1>");
    next();
})
app.get("/contact-details",(req,res,next)=>{
    console.log('Handling response for contact-details');
    res.send(`<h1>Drop your details here</h1>
        <form action="/contact-details" method="POST">
        <input type="text" placeholder="Enter your name" name="name">
        <input type="email" placeholder="Enter your Email" name="email">
        <input type="submit">
        </form>`)
        next();
})
app.use(bodyParser.urlencoded());
app.post("/contact-details",(req,res,next)=>{
    console.log('Handling contact-details for post',req.body);
    res.send(`<h1>Thanks for your details ${req.body.name}</h1>
        `)
})
const port=3000;
app.listen(port,()=>{
    console.log(`Server is listen at http://localhost:${port}`);
})