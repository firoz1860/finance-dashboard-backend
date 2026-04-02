import { errorResponse } from '../utils/apiResponse.js';
export const roleGuard=(roles)=>(req,res,next)=>!req.user||!roles.includes(req.user.role)?errorResponse(res,{statusCode:403,message:'Forbidden resource'}):next();
