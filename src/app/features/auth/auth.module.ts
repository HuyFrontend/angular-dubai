import { NgModule, ModuleWithProviders } from '@angular/core';
import { AuthRoutingModule } from './auth.routes';
import { AUTH_SHARED_COMPONENTS } from './components';
import { AUTH_PAGES_COMPONENT } from './pages';
// import { AuthService } from 'services';
// import { AuthGuard } from './auth.guard';

// CommonModule
@NgModule({
  imports: [
    AuthRoutingModule
  ],
  declarations: [
    ...AUTH_SHARED_COMPONENTS,
    ...AUTH_PAGES_COMPONENT
  ],
  exports: [
    ...AUTH_SHARED_COMPONENTS
  ]
})
export class AuthModule {}
