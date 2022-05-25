import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import schema from './schema';

const app = express();

app.get('/', (req, res) => {
    res.json({
        message: 'Hello World'
    })
});

app.use('/graphql', graphqlHTTP({
    graphiql: true,
    schema: schema
}));

app.listen(8080, () => console.log("Running server on port 8080"));