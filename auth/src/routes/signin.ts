import express, { Request, Response} from 'express';
import { body } from 'express-validator'
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@henoktekatickets/common';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin',[
  body('email')
    .isEmail()
    .withMessage('Valid email needs to be provided'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('a valid password needs to be provided')
] , 
validateRequest,
async (req: Request, res: Response)=>{
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if(!user){
    throw new BadRequestError('Invalid credentials');
  }

  const passwordMatches = await Password.compare(user.password, password);

  if(!passwordMatches){
    throw new BadRequestError('Invalid credentials');
  }

  const userJWT = jwt.sign({
      id: user.get('id'),
      email: user.get('email')
    }, 
    process.env.JWT_KEY!
  );
  
  req.session = { jwt: userJWT };
  res.status(200).send(user);
});

export { router as signinRouter };