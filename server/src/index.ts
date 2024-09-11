import express from "express"
import {ApolloServer} from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4"
import { prismaClient } from "./lib/db";
import createApolloGraphqlServer from "./graphql";


async function init() {
const app = express();
const PORT = Number(process.env.PORT) || 8000;
app.use(express.json())
const gqlServer = new ApolloServer({
    typeDefs:`
    type Query{
        hello:String
        say(name:String):String
    }
    type Mutation{
        createUser(firstName:String!,lastName:String!,email:String!,password:String!):Boolean
        }
    `,
    resolvers:{
        Query :{
            hello:()=>`Hey there , I am a GraphQL server`,
            say:(_,{name}:{name:string})=>`Hey ${name},How are you?`
        },
        Mutation:{
            createUser: async(_,{firstName,lastName,email,password}:
                {
                firstName:string;
                lastName:string;
                email: string;
                password: string;
                }
            )=>{
                await prismaClient.user.create({
                    data:{
                        email,
                        firstName,
                        lastName,
                        password,
                        salt:"random_salt",
                    }
                })

                
            }
        }
    },
})

await gqlServer.start(),

app.get("/",(req,res)=>{
    res.json({message:"Server is running"})
})

const gqlServer = await createApolloGraphqlServer()
app.use('/graphql',expressMiddleware(gqlServer))

app.listen(PORT,()=>{
    console.log(`Server is running at port : ${PORT}`)
})
}

init()