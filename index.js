const express = require('express')
var session = require('express-session');
const mysql = require('mysql')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const app = express()
const port = 3000;
const secretKey = 'thisisverysecretkey'

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: "project"
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//TOKEN
const isAuthorized = (request, result, next) => {
    // cek apakah user sudah mengirim header 'x-api-key'
    if (typeof(request.headers['x-api-key']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }

    // get token dari header
    let token = request.headers['x-api-key']

    // melakukan verifikasi token yang dikirim user
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })

    // lanjut ke next request
    next()
}

//LOGIN UNTUK ADMIN
//mencocokkan username dan password yang ada di database
app.post('/auth', function(request, response) {
    let data = request.body
	var username = data.username;
	var password = data.password;
	if (username && password) {
		db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = data.username;
				response.redirect('/home');
			} else {
				response.send('Username dan/atau Password salah!');
			}			
			response.end();
		});
	} else {
		response.send('Masukkan Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, result ) {
	if (request.session.loggedin) {
        let data = request.body
        let token = jwt.sign(data.username + '|' + data.password, secretKey)

        result.json({
            success: true,
            message: 'Selamat Datang, ' + request.session.username + '!',
            token: token
        })

    } else {
		result.json({
            success: false,
            message: 'Mohon Login Terlebih Dahulu !'
        })
	}
	result.end();
});

//crud untuk admin
app.get('/admin', (req, res) => {
    let sql = `
        select username, created_at from admin`

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get all admin",
            data: result
        })
    })
})

app.post('/admin',(req, res) => {
    let data = req.body

    let sql = `
        insert into admin (username, password)
        values ('`+data.username+`', '`+data.password+`')
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "admin created",
            data: result
        })
    })
})

app.get('/admin/:id',(req, res) => {
    let sql = `
        select * from admin
        where id = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get all admin's detail",
            data: result[0]
        })
    })
})

app.put('/admin/:id',(req, res) => {
    let data = req.body

    let sql = `
        update admin
        set username = '`+data.username+`', password = '`+data.password+`'
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "data has been updated",
            data: result
        })
    })
})

app.delete('/admin/:id', (req, res) => {
    let sql = `
        delete from admin
        where id = `+req.params.id+`
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "data has been deleted",
            data: result
        })
    })
})

//LOGIN UNTUK USERS 
app.post('/login', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/homeusers');
			} else {
				response.send('Username dan/atau Password salah!');
			}			
			response.end();
		});
	} else {
		response.send('Masukkan Username and Password!');
		response.end();
	}
});


app.get('/homeusers', function(request, response) {
	if (request.session.loggedin) {
		response.send('Selamat Datang, ' + request.session.username + '!');
	} else {
		response.send('Mohon login terlebih dahulu!');
	}
	response.end();
});


// CRUD UNTUK USER
app.get('/users', (req, res) => {
    let sql = `
        select username, created_at from users`

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get all user",
            data: result
        })
    })
})

app.post('/users',(req, res) => {
    let data = req.body

    let sql = `
        insert into users (fullName, gender, username, password)
        values ('`+data.fullName+`', '`+data.gender+`' , '`+data.username+`', '`+data.password+`')
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "user created",
            data: result
        })
    })
})

app.get('/users/:id',(req, res) => {
    let sql = `
        select * from users
        where id = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get all user's detail",
            data: result[0]
        })
    })
})

app.put('/users/:id',(req, res) => {
    let data = req.body

    let sql = `
        update users
        set username = '`+data.username+`', password = '`+data.password+`'
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "data has been updated",
            data: result
        })
    })
})

app.delete('/users/:id', (req, res) => {
    let sql = `
        delete from users
        where id = `+req.params.id+`
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "data has been deleted",
            data: result
        })
    })
})

// CRUD UNTUK Mobil
app.get('/mobil', (req, res) => {
    let sql = `
    select nama_mobil, tipe_mobil, harga, jml_kursi, stock , created_at from cars
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get all the car ",
            data: result
        })
    })
})

app.post('/mobil', isAuthorized, (req, res) => {
    let data = req.body

    let sql = `
        insert into cars (nama_mobil, tipe_mobil, harga, jml_kursi, stock)
        values ('`+data.nama_mobil+`', '`+data.tipe_mobil+`', '`+data.harga+`', '`+data.jml_kursi+`', '`+data.stock+`')
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "car created",
            data: result
        })
    })
})

app.get('/mobil/:id', isAuthorized, (req, res) => {
    let sql = `
        select * from cars
        where id = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get car detail",
            data: result[0]
        })
    })
})

app.put('/mobil/:id', isAuthorized, (req, res) => {
    let data = req.body

    let sql = `
        update cars
        set nama_mobil = '`+data.nama_mobil+`', tipe_mobil = '`+data.tipe_mobil+`', harga = '`+data.harga+`', jml_kursi = '`+data.jml_kursi+`', stock = '`+data.stock+`'
        where id = '`+req.params.id+`'
    `
    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "data has been updated",
            data: result
        })
    })
})

app.delete('/mobil/:id', isAuthorized, (req, res) => {
    let sql = `
        delete from cars
        where id = '`+req.params.id+`'
        `
    
        db.query(sql, (err, result) => {
            if (err) throw err
            
            res.json({
                message: "data has been deleted",
                data: result
            })
        })
    })
    

//CRUD TRANSAKSI PEMINJAMAN
app.post('/cars/:id/take', isAuthorized, (req, res) => {
    let data = req.body

    db.query(`
        insert into transaksi (user_id, cars_id)
        values ('`+data.user_id+`', '`+req.params.id+`')
    `, (err, result) => {
        if (err) throw err
    })

    db.query(`
        update cars
        set stock = stock - 1
        where id = '`+req.params.id+`'
    `, (err, result) => {
        if (err) throw err
    })

    res.json({
        message: "Cars has been taked by user"
    })
})

app.get('/users/:id/cars', isAuthorized, (req, res) => {
    db.query(`
        select cars.nama_mobil, cars.tipe_mobil, cars.harga
        from users
        right join transaksi on users.id = transaksi.user_id
        right join cars on transaksi.cars_id = cars.id
        where users.id = '`+req.params.id+`'
    `, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get user's cars",
            data: result
        })
    })
})

app.listen(port, () => {
    console.log('App running on port ' + port)
})
