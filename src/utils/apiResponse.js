export const successResponse=(res,{statusCode=200,data=null,meta,message='OK'})=>{const p={success:true,message,data};if(meta)p.meta=meta;return res.status(statusCode).json(p);};
export const errorResponse=(res,{statusCode=500,message='Server Error',errors})=>{const p={success:false,message};if(errors)p.errors=errors;return res.status(statusCode).json(p);};
