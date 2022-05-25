
// Se puede entender comon las rutas hacia el servidor

import { makeExecutableSchema } from "graphql-tools"; 
import { resolvers } from "./resolvers";

// Tipos de Datos de GraphQL
const typeDef = `
    scalar DateTime
    type Query {
        hello: String
        greet(name: String!): String
        tasks: [Task]
        accounts: [Account]
        products: [Product]
        salesProd: [Sale]
    }

    type Task {
        _id: ID
        title: String!
        description: String!
        number: Int
    }

    type Account {
        user_id: ID
        username: String!
        password: String!
        email: String!
        created_on: DateTime
        last_login: DateTime
    }

    type Product {
        product_id: ID
        product_name: String!
        description: String
        price: Float
    }

    type Sale {
        product_name: String!
        price: Float
        quantity: Float
        total: Float
    }

    type Mutation {
        createTask(input: TaskInput): Task
        createAccount(input: AccountInput): Account
    }

    input TaskInput {
        title: String!
        description: String!
        number: Int
    }

    input AccountInput {
        username: String!
        password: String!
        email: String!
        created_on: DateTime
        last_login: DateTime
    }
`;

export default makeExecutableSchema ({
    typeDefs: typeDef,
    resolvers: resolvers
})