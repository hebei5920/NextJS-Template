import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  password?: string;
  isEmailVerified: boolean;
  emailVerified?: Date; // Next-auth compatibility
  provider?: string; // oauth provider (google, github, credentials)
  providerId?: string; // provider user id
  lastLoginAt?: Date;
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  avatar: {
    type: String,
    default: null
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // 默认不返回密码字段
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Date,
    default: null
  },
  provider: {
    type: String,
    default: null
  },
  providerId: {
    type: String,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko']
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true
});

// 索引
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

// 静态方法
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

export default mongoose.models.User || mongoose.model<IUser, IUserModel>('User', userSchema);
