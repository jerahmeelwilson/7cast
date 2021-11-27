const { default: axios } = require("axios");
require("dotenv").config();
const { CONNECTION_STRING } = process.env;
const Sequelize = require("sequelize");

const sequelize = new Sequelize(CONNECTION_STRING, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

module.exports = {
  seed: (req, res) => {
    sequelize
      .query(
        `
        drop table if exists cities;

        create table cities (
            place_id varchar primary key,
            name varchar,
            latitude float,
            longitude float,
            photo varchar
        );
    `
      )
      .then(() => {
        console.log("DB seeded!");
        res.sendStatus(200);
      })
      .catch((err) => console.log("error seeding DB", err));
  },
  getCities: (req, res) => {
    sequelize
      .query(`select * from cities`)
      .then((dbRes) => res.status(200).send(dbRes[0]));
  },
  addCity: (req, res) => {
    let { place_id, name, latitude, longitude, photo } = req.body;
    sequelize
      .query(
        `
        insert into cities (place_id, name, latitude, longitude, photo)
        values('${place_id}','${name}',${latitude},${longitude},'${photo}')
    `
      )
      .then((dbRes) => res.status(200).send(dbRes[0]))
      .catch((err) => console.log(err));
  },
  deleteCity: (req, res) => {
    let { id } = req.params;
    sequelize
      .query(
        `delete from cities 
          where place_id = '${id}';
      `
      )
      .then((dbRes) => res.status(200).send(dbRes[0]))
      .catch((err) => console.log(err));
  },
};
