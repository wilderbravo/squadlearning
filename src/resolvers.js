//Se puede entender como el controlador de tu servidor
import express from 'express';
import knex from 'knex';
import { tasks } from './sample';

const DB = require('../services/DB');

async function getAccounts(req, res) {
    let params = ['user_id','username', 'password','email', 'created_on', 'last_login'];
    let accounts = await DB('accounts').select(params)
        .then(res => {
            if (res) return res;
        })
        .catch(err => {
            console.log('Error: ', err)
        })
    return accounts;
}

async function getProducts(req, res) {
    let params = ['product_id','product_name', 'description','price'];
    let products = await DB('product').select(params)
        .then(res => {
            if (res) return res;
        })
        .catch(err => {
            console.log('Error: ', err)
        })
    return products;
}

async function getSales(req, res) {
  const sales = await DB('product as p')
  .join('sales as s', 's.product_id', 'p.product_id')
  .select('p.product_name', 'p.price', 's.quantity')
  return sales;
}
// getSales();
let myq = 0;

async function getAccountsCount() {
    let quantity = 0;
    let accountsCount = await DB('accounts').count('user_id', { as: 'rows' })
        .then(res => {
            if (res) {
                quantity = res[0]['rows']; 
                myq = res[0]['rows'];
            }
        })
        .catch(err => {
            console.log('Error: ', err);
        })
}

async function createNewAccount(req) {
    let today = new Date();
    console.log(today);
    let accountToAdd = {user_id: req.user_id, username:req.username, password:req.password, email: req.email, created_on: today, last_login: today}
    const DBResult = await DB('accounts').insert(accountToAdd)
        .then(res => {
            console.log({ success: true, message: 'ok', data: accountToAdd });
            return { success: true, message: 'ok', data: accountToAdd };
        })
        .catch(err => {
            console.log('Error: ', err)
            return { success: false, message: 'no', data: err };
        })
    // console.log(accountToAdd)
}

export const resolvers = {
    Query: {
        hello: () => {
            return 'Hello World with GraphQL'
        },
        // { name } 
        greet(root, args) {
            return `Hello ${args.name}!` 
        },
        tasks() {
            return tasks;
        },
        accounts: () => {
            const accounts = getAccounts();
            return accounts;
        },
        products: () => {
            const products = getProducts();
            return products;
        },
        salesProd: () => {
            const sales = getSales();
            // console.log(sales);
            return sales;
        }
    },
    Mutation: {
        createTask(_, { input }) {
            input._id = tasks.length;
            tasks.push(input);
            return input;
        },
        createAccount(_, { input }) {
            getAccountsCount();
            console.log(myq, parseInt(myq) + 1);
            input.user_id = parseInt(myq) + 1;
            createNewAccount(input);
            return input;
        }
    }
};