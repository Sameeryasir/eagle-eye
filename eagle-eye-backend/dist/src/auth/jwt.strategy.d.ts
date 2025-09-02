import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Users } from '../entities/users.entity';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userRepo;
    constructor(configService: ConfigService, userRepo: Repository<Users>);
    validate(payload: any): Promise<{
        id: number;
        email: string;
        role: import("../entities/roles.entity").Roles;
    }>;
}
export {};
