const express = require('express')
const mysql = require('mysql')

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: "project"
})

db.connect((err) => {
    if (err) throw err
    console.log('Database connected')
})

const createAdminTable = () => {
    let sql = `
        create table admin (
            id int unsigned auto_increment primary key,
            username varchar(100) not null,
            password varchar(255) not null,
            created_at timestamp default current_timestamp,
            updated_at timestamp default current_timestamp null on update current_timestamp
        )
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        console.log('Table admin has been created!')
    })
}

const createCarsTable = () => {
    let sql = `
        create table cars (
            id int unsigned auto_increment primary key,
            nama_mobil varchar(255) not null,
            tipe_mobil varchar(255) not null,
            harga varchar(255) not null,
            jml_kursi int unsigned not null,
            stock int(255),
            created_at timestamp default current_timestamp,
            updated_at timestamp default current_timestamp null on update current_timestamp
        )
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        console.log('Table cars has been created!')
    })
}

const createUsersTable = () => {
    let sql = `
        create table users (
            id int unsigned auto_increment primary key,
            fullName varchar(255),
            gender varchar(255) not null,
            username varchar(100) not null,
            password varchar(255) not null,
            created_at timestamp default current_timestamp,
            updated_at timestamp default current_timestamp null on update current_timestamp
        )
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        console.log('Table users has been created!')
    })
}


const createTransaksiTable = () => {
    let sql = `
        create table transaksi (
            id int unsigned auto_increment primary key,
            user_id int not null,
            cars_id int not null,
            created_at timestamp default current_timestamp
        )
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        console.log('Table user_book has been created!')
    })
}

createAdminTable()
createCarsTable()
createUsersTable()
createTransaksiTable()

