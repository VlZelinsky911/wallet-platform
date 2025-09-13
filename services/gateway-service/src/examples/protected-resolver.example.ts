import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Resolver()
export class ProtectedResolverExample {
  
  // Public query - no protection needed
  @Query(() => String)
  public(): string {
    return 'This is a public endpoint';
  }

  // Protected query - requires valid JWT
  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  protected(): string {
    return 'This is a protected endpoint - JWT required';
  }

  // Admin only query - requires JWT + admin role
  @Query(() => String)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminOnly(): string {
    return 'This is an admin-only endpoint';
  }

  // User or admin query - requires JWT + specific roles
  @Query(() => String)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  userOrAdmin(): string {
    return 'This endpoint requires user or admin role';
  }

  // Example mutation with role protection
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteUser(@Args('userId') userId: string): boolean {
    // This would be handled by the actual user service
    console.log(`Admin deleting user: ${userId}`);
    return true;
  }
}

/* 
USAGE EXAMPLES:

1. Public access:
   query { public }

2. With JWT token:
   query { 
     protected 
   }
   Headers: { "Authorization": "Bearer <jwt_token>" }

3. Admin only:
   query { 
     adminOnly 
   }
   Headers: { "Authorization": "Bearer <admin_jwt_token>" }

4. User or Admin:
   query { 
     userOrAdmin 
   }
   Headers: { "Authorization": "Bearer <user_or_admin_jwt_token>" }

5. Protected mutation:
   mutation { 
     deleteUser(userId: "123") 
   }
   Headers: { "Authorization": "Bearer <admin_jwt_token>" }
*/
