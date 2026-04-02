import { errorResponse } from '../utils/apiResponse.js';
export const notFoundHandler=(req,res)=>errorResponse(res,{statusCode:404,message:'Route not found'});
export const errorHandler=(err,req,res,next)=>{
  if(err.name==='ZodError'){
    return errorResponse(res,{statusCode:400,message:'Validation failed',errors:err.errors});
  }

  if(err.code==='P2002'){
    return errorResponse(res,{statusCode:409,message:'Resource already exists'});
  }

  if(err.code==='P2025'){
    return errorResponse(res,{statusCode:404,message:'Requested resource was not found'});
  }

  return errorResponse(res,{statusCode:err.statusCode||500,message:err.message||'Server Error'});
};
