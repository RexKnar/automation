import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
    imports: [WorkspacesModule],
    controllers: [InvitationsController],
    providers: [InvitationsService],
})
export class InvitationsModule { }
