import express from 'express';
import user_auth_routes from './routes/user_auth_routes.js';
import user_outfits_routes from './routes/user_outfits_routes.js';
import user_category_routes from './routes/user_category_routes.js';
import user_outfit_category_history_route from './routes/user_outfit_category_history_route.js'
import user_outfit_category_history_planner_route from './routes/user_outfit_category_planner_routes.js';
import user_profile_routes from './routes/user_profile_routes.js'
import user_friend_routes from './routes/user_friend_routes.js'
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.set('port', 9080);

app.use(express.urlencoded());
//express middleware for json parsing
app.use(express.json());
//middleware for http-cookies parsing
app.use(cookieParser());
//cors
app.use(cors({
    origin: [Number(process.env.IN_PROD)===0?process.env.LOCAL_ORIGIN:process.env.PROD_ORIGIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

//user routes
app.use("/user",user_profile_routes);
app.use('/user/auth',user_auth_routes);
app.use('/user/outfits',user_outfits_routes);
app.use('/user/category',user_category_routes);
app.use('/user/outfit_category_history',user_outfit_category_history_route);
app.use('/user/outfit_category_history_planner',user_outfit_category_history_planner_route);
app.use("/user/connection",user_friend_routes)

const start = () => {
    app.listen(app.get('port'), () => {
        console.log(`Server listening on port ${app.get('port')}`);
    });
};

start();
