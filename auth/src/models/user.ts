import mongoose from "mongoose";
import { Password } from '../services/password';

interface UserAttr{
  email: string;
  password: string;
}

interface UserDoc extends mongoose.Document{
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type:String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret){
      delete ret.password;
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

userSchema.pre('save', async function (done){
  if(this.isModified('password')){
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttr)=>{
  return new User(attrs);
}

interface UserModel extends mongoose.Model<UserDoc>{
  build(attrs: UserAttr):UserDoc;
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };