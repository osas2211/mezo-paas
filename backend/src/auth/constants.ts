/*  eslint-disable */

import { env_config } from '../lib/config';
import * as dotenv from 'dotenv';

dotenv.config();

export const jwtConstants = {
  secret: env_config.jwt_secret,
};
