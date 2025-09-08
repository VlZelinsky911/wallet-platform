import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput } from './auth.inputs';
import { AuthPayload } from './auth.types';
@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}
  @Query(() => String)
  ping() {
    return 'ok';
  }
  @Mutation(() => AuthPayload) register(@Args('input') i: RegisterInput) {
    return this.auth.register(i.email, i.password, i.name);
  }
  @Mutation(() => AuthPayload) login(@Args('input') i: LoginInput) {
    return this.auth.login(i.email, i.password);
  }
}
