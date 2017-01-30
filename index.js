const express = require('express'),
    app = express(),
    path = require('path'),
    fs = require('fs'),
    mediaserver = require('mediaserver'),
    multer = require('multer'),
    multerOpts = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, 'songs'))
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    }),
    upload = multer({storage: multerOpts});


app.use(express.static('public'));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery','dist')));

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.get('/songs', (req, res)=>{
   fs.readFile(path.join(__dirname, 'songs.json'), 'utf8', function(err, songs){
       if(err) throw err;
       res.json(JSON.parse(songs));
   })
});

app.get('/songs/:name', (req, res)=>{
    var song = path.join(__dirname, 'songs', req.params.name);
    mediaserver.pipe(req, res, song);
});

app.post('/songs', upload.single('song'), function(req, res) {
    var songsFile = path.join(__dirname, 'songs.json');
    var name = req.file.originalname;
    fs.readFile(songsFile, 'utf8', function(err, file) {
        if (err) throw err;
        var songs = JSON.parse(file);
        songs.push({name: name});
        fs.writeFile(songsFile, JSON.stringify(songs), function(err) {
            if (err) throw err;
            res.sendFile(path.join(__dirname, 'index.html'));
        })
    });
});

app.listen(3000, ()=>{
    console.log('App is running');
});