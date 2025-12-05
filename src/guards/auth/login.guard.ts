import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppService } from 'src/app.service';

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(AppService)
  private readonly appService: AppService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('Guard login');
    console.log(this.appService.getHello());
    return true;
  }
}
