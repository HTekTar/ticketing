import express, { Request, Response} from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@henoktekatickets/common';

import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signup', [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'), 
    body('password')
      .trim()
      .isLength({ min: 5, max: 20 })
      .withMessage('password must be between 5 and 20 characters')
  ], 
  validateRequest,
  async (req: Request, res: Response)=>{
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if(existingUser){
      throw new BadRequestError('Email in use');
    }

    const user = User.build({ email, password });
    await user.save();

    //Generate JWT
    const userJWT = jwt.sign({
      email: user.email,
      id: user.id
    }, process.env.JWT_KEY!);


    //store jwt on session object
    req.session = { jwt: userJWT };

    res.status(201).send(user);
});

export { router as signupRouter };