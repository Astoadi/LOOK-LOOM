import { configureStore } from "@reduxjs/toolkit";
import auth_reducer from './reducers/auth_reducers/index.js'
import outfit_category_reducer from "./reducers/outfit_category_reducer/index.js";
import outfits from "./reducers/outfits/index.js";
import dress from "./reducers/dress/index.js";
import planner from "./reducers/planner/index.js";
const store=configureStore({
    reducer:{
        auth:auth_reducer,
        outfit_category:outfit_category_reducer,
        outfit:outfits,
        dress:dress,
        planner:planner
    }
});

export default store;